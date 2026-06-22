<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\AttendanceRecord;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Services\HrInsightService;
use App\Services\AuditTrailService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function __construct(
        private readonly AuditTrailService $auditTrail,
        private readonly HrInsightService $insights,
    ) {}

    public function index(Request $request): JsonResponse
    {
        if ($request->boolean('hris')) {
            $noAbsen = $request->user()?->no_absen;
            if ($noAbsen) {
                return response()->json([
                    'data' => $this->insights->attendanceFromHris((string) $noAbsen),
                    'source' => 'hris',
                ]);
            }
        }

        if ($request->boolean('from_hris') && $request->user()?->hasPermission('hr.employees.view')) {
            $result = $this->insights->attendanceDailyFromHris(
                $request->date,
                $request->integer('page', 1),
                $request->integer('per_page', 20)
            );

            return response()->json($result);
        }

        $records = AttendanceRecord::query()
            ->with(['employee:id,employee_code,name'])
            ->when($request->date, fn ($q, $d) => $q->where('date', $d))
            ->when($request->employee_id, fn ($q, $id) => $q->where('employee_id', $id))
            ->when($request->from, fn ($q, $from) => $q->where('date', '>=', $from))
            ->when($request->to, fn ($q, $to) => $q->where('date', '<=', $to))
            ->orderByDesc('date')
            ->paginate($request->integer('per_page', 20));

        return response()->json($records);
    }

    public function checkIn(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);

        $today = now()->toDateString();
        $now = now()->format('H:i:s');

        $record = AttendanceRecord::query()
            ->where('employee_id', $employee->id)
            ->where('date', $today)
            ->first();

        if ($record?->check_in) {
            return response()->json(['message' => 'Sudah check-in hari ini.', 'data' => $record], 422);
        }

        $record = AttendanceRecord::query()->updateOrCreate(
            ['employee_id' => $employee->id, 'date' => $today],
            ['check_in' => $now, 'status' => $this->attendanceStatus($now)]
        );
        $this->auditTrail->log('attendance.check_in', 'attendance', $record->id, $request->user()->id);

        return response()->json(['data' => $record]);
    }

    public function checkOut(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);
        $today = now()->toDateString();
        $now = now()->format('H:i:s');

        $record = AttendanceRecord::query()
            ->where('employee_id', $employee->id)
            ->where('date', $today)
            ->firstOrFail();

        $record->update(['check_out' => $now]);
        $this->auditTrail->log('attendance.check_out', 'attendance', $record->id, $request->user()->id);

        return response()->json(['data' => $record]);
    }

    private function resolveEmployee(Request $request): Employee
    {
        if ($request->filled('employee_id') && $request->user()->hasPermission('hr.employees.manage')) {
            return Employee::query()->findOrFail($request->integer('employee_id'));
        }

        return Employee::query()->where('user_id', $request->user()->id)->firstOrFail();
    }

    private function attendanceStatus(string $checkIn): string
    {
        return Carbon::parse($checkIn)->format('H:i') > '08:15' ? 'late' : 'present';
    }
}
