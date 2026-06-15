<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\AttendanceRecord;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\LeaveRequest;
use App\Modules\HR\Models\PayrollPeriod;
use Illuminate\Http\JsonResponse;

class HrDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $today = now()->toDateString();

        return response()->json([
            'data' => [
                'total_employees' => Employee::query()->where('employment_status', 'active')->count(),
                'present_today' => AttendanceRecord::query()
                    ->where('date', $today)
                    ->whereIn('status', ['present', 'late'])
                    ->count(),
                'pending_leave_requests' => LeaveRequest::query()
                    ->whereIn('status', ['submitted', 'draft'])
                    ->count(),
                'latest_payroll_period' => PayrollPeriod::query()
                    ->orderByDesc('period_end')
                    ->first(['id', 'code', 'name', 'status', 'period_start', 'period_end']),
            ],
        ]);
    }
}
