<?php

namespace App\Listeners;

use App\Events\ApprovalCompleted;
use App\Modules\HR\Models\LeaveRequest;
use App\Modules\HR\Services\LeaveRequestService;

class HandleApprovalCompletion
{
    public function __construct(private readonly LeaveRequestService $leaveRequests) {}

    public function handle(ApprovalCompleted $event): void
    {
        if ($event->instance->document_type !== 'leave_request') {
            return;
        }

        $leave = LeaveRequest::query()->find($event->instance->document_id);
        if (! $leave) {
            return;
        }

        match ($event->outcome) {
            'approved' => $this->leaveRequests->markApproved($leave),
            'rejected' => $this->leaveRequests->markRejected($leave),
            default => null,
        };
    }
}
