<?php

namespace App\Services;

use App\Events\ApprovalCompleted;
use App\Models\User;
use App\Modules\Workflow\Models\ApprovalAction;
use App\Modules\Workflow\Models\ApprovalFlow;
use App\Modules\Workflow\Models\ApprovalInstance;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

class ApprovalService
{
    public function __construct(
        private readonly AuditTrailService $auditTrail,
        private readonly NotificationService $notifications,
    ) {}

    public function submit(
        string $documentType,
        int $documentId,
        int $submitterId,
        ?array $context = null
    ): ApprovalInstance {
        $flow = ApprovalFlow::query()
            ->where('document_type', $documentType)
            ->where('is_active', true)
            ->firstOrFail();

        return DB::transaction(function () use ($flow, $documentType, $documentId, $submitterId, $context) {
            $instance = ApprovalInstance::query()->create([
                'document_type' => $documentType,
                'document_id' => $documentId,
                'submitter_id' => $submitterId,
                'status' => 'in_review',
                'current_step' => 1,
                'context' => $context,
            ]);

            $this->auditTrail->log('approval.submitted', $documentType, $documentId, $submitterId, [
                'approval_instance_id' => $instance->id,
            ]);

            $this->notifyApproversForStep($instance, $flow, 1);

            return $instance->fresh(['submitter', 'actions']);
        });
    }

    public function approve(int $instanceId, int $approverId, ?string $note = null): ApprovalInstance
    {
        return $this->act($instanceId, $approverId, 'approved', $note);
    }

    public function reject(int $instanceId, int $approverId, string $reason): ApprovalInstance
    {
        return $this->act($instanceId, $approverId, 'rejected', $reason);
    }

    private function act(int $instanceId, int $approverId, string $action, ?string $note): ApprovalInstance
    {
        return DB::transaction(function () use ($instanceId, $approverId, $action, $note) {
            $instance = ApprovalInstance::query()->lockForUpdate()->findOrFail($instanceId);

            if (! in_array($instance->status, ['submitted', 'in_review'], true)) {
                throw new RuntimeException('Approval instance is not actionable.');
            }

            $flow = ApprovalFlow::query()
                ->where('document_type', $instance->document_type)
                ->firstOrFail();

            $steps = $flow->steps;
            $currentStep = $instance->current_step;
            $stepConfig = $steps[$currentStep - 1] ?? null;

            if (! $stepConfig) {
                throw new InvalidArgumentException('Invalid approval step configuration.');
            }

            $this->assertApproverAuthorized($approverId, $stepConfig['role'] ?? null);

            ApprovalAction::query()->create([
                'approval_instance_id' => $instance->id,
                'user_id' => $approverId,
                'step' => $currentStep,
                'action' => $action,
                'note' => $note,
                'acted_at' => now(),
            ]);

            if ($action === 'rejected') {
                $instance->update(['status' => 'rejected']);
                $this->notifications->notify(
                    $instance->submitter_id,
                    'Dokumen ditolak',
                    "Dokumen {$instance->document_type} #{$instance->document_id} ditolak.",
                    'approval',
                    ['approval_instance_id' => $instance->id]
                );
                ApprovalCompleted::dispatch($instance->fresh(), 'rejected');
            } else {
                $resolvedSteps = $this->resolveSteps($flow, $instance);
                $isLastStep = $currentStep >= count($resolvedSteps);

                if ($isLastStep) {
                    $instance->update(['status' => 'approved']);
                    $this->notifications->notify(
                        $instance->submitter_id,
                        'Dokumen disetujui',
                        "Dokumen {$instance->document_type} #{$instance->document_id} telah disetujui.",
                        'approval',
                        ['approval_instance_id' => $instance->id]
                    );
                    ApprovalCompleted::dispatch($instance->fresh(), 'approved');
                } else {
                    $nextStep = $currentStep + 1;
                    $instance->update([
                        'status' => 'in_review',
                        'current_step' => $nextStep,
                    ]);
                    $this->notifyApproversForStep($instance, $flow, $nextStep, $resolvedSteps);
                }
            }

            $this->auditTrail->log(
                "approval.{$action}",
                $instance->document_type,
                $instance->document_id,
                $approverId,
                ['approval_instance_id' => $instance->id, 'step' => $currentStep]
            );

            return $instance->fresh(['submitter', 'actions']);
        });
    }

    private function resolveSteps(ApprovalFlow $flow, ApprovalInstance $instance): array
    {
        $steps = $flow->steps;
        $amount = (float) ($instance->context['amount'] ?? 0);

        if ($flow->director_threshold && $amount < (float) $flow->director_threshold) {
            return array_values(array_filter($steps, fn ($s) => ($s['role'] ?? '') !== 'director'));
        }

        return $steps;
    }

    private function assertApproverAuthorized(int $approverId, ?string $requiredRole): void
    {
        if (! $requiredRole) {
            return;
        }

        $user = User::query()->with('roles')->findOrFail($approverId);

        if (! $user->hasRole($requiredRole) && ! $user->hasRole('super_admin')) {
            throw new RuntimeException('User is not authorized to approve this step.');
        }
    }

    private function notifyApproversForStep(
        ApprovalInstance $instance,
        ApprovalFlow $flow,
        int $step,
        ?array $resolvedSteps = null
    ): void {
        $steps = $resolvedSteps ?? $this->resolveSteps($flow, $instance);
        $stepConfig = $steps[$step - 1] ?? null;

        if (! $stepConfig || empty($stepConfig['role'])) {
            return;
        }

        $roleName = $stepConfig['role'];
        $approvers = User::query()
            ->whereHas('roles', fn ($q) => $q->where('name', $roleName))
            ->where('is_active', true)
            ->get();

        foreach ($approvers as $approver) {
            $this->notifications->notify(
                $approver->id,
                'Menunggu persetujuan',
                "Dokumen {$instance->document_type} #{$instance->document_id} memerlukan persetujuan Anda.",
                'approval',
                ['approval_instance_id' => $instance->id, 'step' => $step]
            );
        }
    }
}
