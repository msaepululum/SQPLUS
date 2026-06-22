<?php

use App\Modules\HR\Http\Controllers\AttendanceController;
use App\Modules\HR\Http\Controllers\EmployeeController;
use App\Modules\HR\Http\Controllers\HrDashboardController;
use App\Modules\HR\Http\Controllers\LeaveRequestController;
use App\Modules\HR\Http\Controllers\PayrollController;
use App\Modules\HR\Http\Controllers\PayrollTaxController;
use Illuminate\Support\Facades\Route;

Route::prefix('hr')->name('hr.')->group(function () {
    Route::get('/dashboard', [HrDashboardController::class, 'index'])
        ->middleware('permission:hr.employees.view');

    Route::get('/employees', [EmployeeController::class, 'index'])
        ->middleware('permission:hr.employees.view');
    Route::get('/employees/me', [EmployeeController::class, 'me']);
    Route::get('/employees/{id}', [EmployeeController::class, 'show'])
        ->middleware('permission:hr.employees.view');
    Route::post('/employees', [EmployeeController::class, 'store'])
        ->middleware('permission:hr.employees.manage');
    Route::put('/employees/{id}', [EmployeeController::class, 'update'])
        ->middleware('permission:hr.employees.manage');

    Route::get('/attendance', [AttendanceController::class, 'index'])
        ->middleware('permission:hr.employees.view');
    Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn']);
    Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut']);

    Route::get('/leave-types', [LeaveRequestController::class, 'leaveTypes']);
    Route::get('/leave-requests', [LeaveRequestController::class, 'index']);
    Route::post('/leave-requests', [LeaveRequestController::class, 'store']);
    Route::post('/leave-requests/{id}/submit', [LeaveRequestController::class, 'submit']);

    Route::get('/payroll/periods', [PayrollController::class, 'index'])
        ->middleware('permission:hr.payroll.view');
    Route::get('/payroll/periods/{id}', [PayrollController::class, 'show'])
        ->middleware('permission:hr.payroll.view');
    Route::get('/payroll/me', [PayrollController::class, 'me']);

    Route::get('/payroll/tax/schema', [PayrollTaxController::class, 'schema'])
        ->middleware('permission:hr.payroll.view');
    Route::get('/payroll/tax/summary', [PayrollTaxController::class, 'summary'])
        ->middleware('permission:hr.payroll.view');
    Route::get('/payroll/tax/employees', [PayrollTaxController::class, 'index'])
        ->middleware('permission:hr.payroll.view');
    Route::get('/payroll/tax/me', [PayrollTaxController::class, 'me']);
    Route::post('/payroll/tax/simulate', [PayrollTaxController::class, 'simulate'])
        ->middleware('permission:hr.payroll.view');
});
