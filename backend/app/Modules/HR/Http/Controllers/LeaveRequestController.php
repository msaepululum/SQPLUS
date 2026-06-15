<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\LeaveRequest;
use App\Modules\HR\Models\LeaveType;
use App\Modules\HR\Services\LeaveRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaveRequestController extends Controller
{
    public function __construct(private readonly LeaveRequestService $leaveRequests) {}

    public function index(Request $request): JsonResponse
    {
        $query = LeaveRequest::query()
            ->with(['employee:id,employee_code,name', 'leaveType:id,code,name']);

        if (! $request->user()->hasPermission('hr.employees.manage')) {
            $employee = Employee::query()->where('user_id', $request->user()->id)->first();
            $query->where('employee_id', $employee?->id ?? 0);
        } elseif ($request->employee_id) {
            $query->where('employee_id', $request->integer('employee_id'));
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return response()->json(
            $query->orderByDesc('created_at')->paginate($request->integer('per_page', 15))
        );
    }

    public function leaveTypes(): JsonResponse
    {
        return response()->json([
            'data' => LeaveType::query()->where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'leave_type_id' => ['required', 'exists:leave_types,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'reason' => ['nullable', 'string', 'max:1000'],
            'employee_id' => ['nullable', 'exists:employees,id'],
            'submit' => ['nullable', 'boolean'],
        ]);

        $employeeId = $data['employee_id'] ?? null;
        if ($employeeId && $request->user()->hasPermission('hr.employees.manage')) {
            $employee = Employee::query()->findOrFail($employeeId);
        } else {
            $employee = Employee::query()->where('user_id', $request->user()->id)->firstOrFail();
        }

        $leave = $this->leaveRequests->create([
            'employee_id' => $employee->id,
            'leave_type_id' => $data['leave_type_id'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'reason' => $data['reason'] ?? null,
        ], $request->user()->id);

        if ($request->boolean('submit')) {
            $leave = $this->leaveRequests->submit($leave, $request->user()->id);
        }

        return response()->json(['data' => $leave], 201);
    }

    public function submit(Request $request, int $id): JsonResponse
    {
        $leave = LeaveRequest::query()->findOrFail($id);
        $this->authorizeLeaveAccess($request, $leave);

        $leave = $this->leaveRequests->submit($leave, $request->user()->id);

        return response()->json(['data' => $leave]);
    }

    private function authorizeLeaveAccess(Request $request, LeaveRequest $leave): void
    {
        if ($request->user()->hasPermission('hr.employees.manage')) {
            return;
        }

        $employee = Employee::query()->where('user_id', $request->user()->id)->first();
        if (! $employee || $leave->employee_id !== $employee->id) {
            abort(403);
        }
    }
}
