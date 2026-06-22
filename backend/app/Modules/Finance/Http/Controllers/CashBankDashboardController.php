<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Services\CashBankDashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CashBankDashboardController extends Controller
{
    public function __construct(
        private readonly CashBankDashboardService $service
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'tahun' => ['required', 'integer', 'min:2000', 'max:2100'],
            'bulan' => ['nullable', 'integer', 'min:1', 'max:12'],
        ]);

        return response()->json([
            'data' => $this->service->index($filters),
        ]);
    }
}
