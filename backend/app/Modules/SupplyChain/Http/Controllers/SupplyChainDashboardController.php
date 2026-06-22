<?php

namespace App\Modules\SupplyChain\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\SupplyChain\Services\SupplyChainDashboardService;
use Illuminate\Http\JsonResponse;

class SupplyChainDashboardController extends Controller
{
    public function __construct(
        private readonly SupplyChainDashboardService $service
    ) {}

    public function index(): JsonResponse
    {
        return response()->json(['data' => $this->service->dashboard()]);
    }
}
