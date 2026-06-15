<?php

namespace App\Modules\HR\Services;

use App\Modules\HR\Models\LeaveBalance;
use App\Modules\HR\Models\LeaveRequest;
use App\Services\ApprovalService;
use App\Services\AuditTrailService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class LeaveRequestService
{
    public function __construct(
        private readonly ApprovalService $approvals,
        private readonly AuditTrailService $auditTrail,
    ) {}

    public function create(array $data, int $submitterUserId): LeaveRequest
    {
        return DB::transaction(function () use ($data, $submitterUserId) {
            $daysCount = $this->calculateDays($data['start_date'], $data['end_date']);

            $leave = LeaveRequest::query()->create([
                ...$data,
                'days_count' => $daysCount,
                'status' => 'draft',
            ]);

            $this->auditTrail->log(
                'leave_request.created',
                'leave_request',
                $leave->id,
                $submitterUserId
            );

            return $leave->load(['employee', 'leaveType']);
        });
    }

    public function submit(LeaveRequest $leave, int $submitterUserId): LeaveRequest
    {
        return DB::transaction(function () use ($leave, $submitterUserId) {
            if ($leave->status !== 'draft') {
                throw new RuntimeException('Hanya pengajuan draft yang dapat disubmit.');
            }

            $balance = $this->getBalance($leave);
            if ($balance->remainingDays() < $leave->days_count) {
                throw new RuntimeException('Saldo cuti tidak mencukupi.');
            }

            $instance = $this->approvals->submit(
                'leave_request',
                $leave->id,
                $submitterUserId,
                ['amount' => 0, 'employee_id' => $leave->employee_id]
            );

            $leave->update([
                'status' => 'submitted',
                'approval_instance_id' => $instance->id,
            ]);

            $this->auditTrail->log(
                'leave_request.submitted',
                'leave_request',
                $leave->id,
                $submitterUserId,
                ['approval_instance_id' => $instance->id]
            );

            return $leave->fresh(['employee', 'leaveType']);
        });
    }

    public function markApproved(LeaveRequest $leave): void
    {
        DB::transaction(function () use ($leave) {
            $leave->update(['status' => 'approved']);

            $balance = $this->getBalance($leave);
            $balance->increment('used_days', $leave->days_count);

            $this->auditTrail->log(
                'leave_request.approved',
                'leave_request',
                $leave->id
            );
        });
    }

    public function markRejected(LeaveRequest $leave): void
    {
        $leave->update(['status' => 'rejected']);
        $this->auditTrail->log('leave_request.rejected', 'leave_request', $leave->id);
    }

    private function getBalance(LeaveRequest $leave): LeaveBalance
    {
        $year = (int) $leave->start_date->format('Y');

        return LeaveBalance::query()->firstOrCreate(
            [
                'employee_id' => $leave->employee_id,
                'leave_type_id' => $leave->leave_type_id,
                'year' => $year,
            ],
            ['entitled_days' => $leave->leaveType->default_days_per_year, 'used_days' => 0]
        );
    }

    private function calculateDays(string $start, string $end): int
    {
        return Carbon::parse($start)->diffInDays(Carbon::parse($end)) + 1;
    }
}
