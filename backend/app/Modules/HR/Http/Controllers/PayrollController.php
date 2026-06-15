<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\PayrollItem;
use App\Modules\HR\Models\PayrollPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayrollController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $periods = PayrollPeriod::query()
            ->orderByDesc('period_end')
            ->paginate($request->integer('per_page', 12));

        return response()->json($periods);
    }

    public function show(int $id): JsonResponse
    {
        $period = PayrollPeriod::query()
            ->with(['items.employee:id,employee_code,name'])
            ->findOrFail($id);

        return response()->json(['data' => $period]);
    }

    public function me(Request $request): JsonResponse
    {
        $employee = Employee::query()->where('user_id', $request->user()->id)->firstOrFail();

        $items = PayrollItem::query()
            ->with('payrollPeriod:id,code,name,period_start,period_end,status')
            ->where('employee_id', $employee->id)
            ->orderByDesc('id')
            ->limit(12)
            ->get();

        return response()->json(['data' => $items]);
    }
}
