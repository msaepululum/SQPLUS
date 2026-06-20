<?php

namespace App\Listeners;

use App\Events\ApprovalCompleted;
use App\Modules\Finance\Models\BudgetPaguRevision;
use App\Modules\Finance\Models\BudgetPaguShift;
use App\Modules\Finance\Services\BudgetPaguPergeseranService;
use App\Modules\Finance\Services\BudgetPaguRevisiService;
use App\Modules\HR\Models\LeaveRequest;
use App\Modules\HR\Services\LeaveRequestService;

class HandleApprovalCompletion
{
    public function __construct(
        private readonly LeaveRequestService $leaveRequests,
        private readonly BudgetPaguRevisiService $budgetRevisions,
        private readonly BudgetPaguPergeseranService $budgetShifts,
    ) {}

    public function handle(ApprovalCompleted $event): void
    {
        if ($event->instance->document_type === 'leave_request') {
            $leave = LeaveRequest::query()->find($event->instance->document_id);
            if (! $leave) {
                return;
            }

            match ($event->outcome) {
                'approved' => $this->leaveRequests->markApproved($leave),
                'rejected' => $this->leaveRequests->markRejected($leave),
                default => null,
            };

            return;
        }

        if ($event->instance->document_type === 'budget_revision') {
            $revision = BudgetPaguRevision::query()->find($event->instance->document_id);
            if (! $revision) {
                return;
            }

            match ($event->outcome) {
                'approved' => $this->budgetRevisions->markApproved($revision),
                'rejected' => $this->budgetRevisions->markRejected($revision),
                default => null,
            };

            return;
        }

        if ($event->instance->document_type === 'budget_shift') {
            $shift = BudgetPaguShift::query()->find($event->instance->document_id);
            if (! $shift) {
                return;
            }

            match ($event->outcome) {
                'approved' => $this->budgetShifts->markApproved($shift),
                'rejected' => $this->budgetShifts->markRejected($shift),
                default => null,
            };
        }
    }
}
