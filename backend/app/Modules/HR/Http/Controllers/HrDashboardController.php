<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Services\HrInsightService;
use Illuminate\Http\JsonResponse;

class HrDashboardController extends Controller
{
    public function __construct(private readonly HrInsightService $insights) {}

    public function index(): JsonResponse
    {
        return response()->json(['data' => $this->insights->dashboard()]);
    }
}
