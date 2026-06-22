<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Services\HrPayrollTaxService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayrollTaxController extends Controller
{
    public function __construct(private readonly HrPayrollTaxService $tax) {}

    public function schema(): JsonResponse
    {
        return response()->json(['data' => $this->tax->schema()]);
    }

    public function summary(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->tax->periodSummary([
                'tahun' => $request->integer('tahun') ?: null,
                'bulan' => $request->integer('bulan') ?: null,
            ]),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $this->tax->employeeList([
                'tahun' => $request->integer('tahun') ?: null,
                'bulan' => $request->integer('bulan') ?: null,
                'search' => $request->search,
                'page' => $request->integer('page', 1),
                'per_page' => $request->integer('per_page', 20),
            ])
        );
    }

    public function me(Request $request): JsonResponse
    {
        $employee = Employee::query()->where('user_id', $request->user()->id)->first();
        $noAbsen = $request->user()?->no_absen;

        $data = $this->tax->employeeMe(
            $noAbsen ? (string) $noAbsen : null,
            $employee?->employee_code
        );

        if (! $data) {
            return response()->json(['message' => 'Data pajak gaji belum tersedia untuk akun ini.'], 404);
        }

        return response()->json(['data' => $data]);
    }

    public function simulate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'penghasilan_bruto' => ['required', 'numeric', 'min:0'],
            'ptkp_code' => ['required', 'string', 'max:10'],
        ]);

        return response()->json([
            'data' => $this->tax->calculateTer(
                (float) $validated['penghasilan_bruto'],
                $validated['ptkp_code']
            ),
        ]);
    }
}
