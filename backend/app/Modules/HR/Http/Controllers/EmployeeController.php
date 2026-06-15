<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\Employee;
use App\Services\AuditTrailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function __construct(private readonly AuditTrailService $auditTrail) {}

    public function index(Request $request): JsonResponse
    {
        $employees = Employee::query()
            ->with(['position:id,code,name', 'organizationalUnit:id,code,name'])
            ->when($request->search, function ($q, $search) {
                $q->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('employee_code', 'like', "%{$search}%");
                });
            })
            ->when($request->status, fn ($q, $s) => $q->where('employment_status', $s))
            ->when($request->organizational_unit_id, fn ($q, $id) => $q->where('organizational_unit_id', $id))
            ->orderBy('name')
            ->paginate($request->integer('per_page', 15));

        return response()->json($employees);
    }

    public function show(int $id): JsonResponse
    {
        $employee = Employee::query()
            ->with(['position', 'organizationalUnit', 'leaveBalances.leaveType', 'user:id,name,email'])
            ->findOrFail($id);

        return response()->json(['data' => $employee]);
    }

    public function me(Request $request): JsonResponse
    {
        $employee = Employee::query()
            ->with(['position', 'organizationalUnit', 'leaveBalances.leaveType'])
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return response()->json(['data' => $employee]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'employee_code' => ['required', 'string', 'max:10', 'unique:employees,employee_code'],
            'legacy_department_code' => ['nullable', 'string', 'max:6'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'organizational_unit_id' => ['required', 'exists:organizational_units,id'],
            'position_id' => ['required', 'exists:positions,id'],
            'employment_status' => ['nullable', 'in:active,inactive,resigned'],
            'join_date' => ['required', 'date'],
            'gender' => ['nullable', 'in:male,female'],
            'birth_date' => ['nullable', 'date'],
            'base_salary' => ['nullable', 'numeric', 'min:0'],
            'user_id' => ['nullable', 'exists:users,id'],
        ]);

        $employee = Employee::query()->create([
            ...$data,
            'employment_status' => $data['employment_status'] ?? 'active',
            'base_salary' => $data['base_salary'] ?? 0,
        ]);

        $this->auditTrail->log('employee.created', 'employee', $employee->id, $request->user()->id);

        return response()->json(['data' => $employee->load(['position', 'organizationalUnit'])], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $employee = Employee::query()->findOrFail($id);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['nullable', 'email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'organizational_unit_id' => ['sometimes', 'exists:organizational_units,id'],
            'position_id' => ['sometimes', 'exists:positions,id'],
            'employment_status' => ['sometimes', 'in:active,inactive,resigned'],
            'base_salary' => ['nullable', 'numeric', 'min:0'],
            'user_id' => ['nullable', 'exists:users,id'],
        ]);

        $employee->update($data);
        $this->auditTrail->log('employee.updated', 'employee', $employee->id, $request->user()->id);

        return response()->json(['data' => $employee->fresh(['position', 'organizationalUnit'])]);
    }
}
