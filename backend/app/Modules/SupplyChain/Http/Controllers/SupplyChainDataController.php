<?php

namespace App\Modules\SupplyChain\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\SupplyChain\Services\SupplyChainDataService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplyChainDataController extends Controller
{
    public function __construct(
        private readonly SupplyChainDataService $service
    ) {}

    public function meta(): JsonResponse
    {
        return response()->json(['data' => $this->service->meta()]);
    }

    public function monitoring(): JsonResponse
    {
        return response()->json(['data' => $this->service->monitoring()]);
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'slug' => ['required', 'string', 'max:60'],
            'stage' => ['required', 'string', 'max:40'],
            'search' => ['nullable', 'string', 'max:120'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ]);

        return response()->json($this->service->list(array_filter(
            $filters,
            fn ($v) => $v !== null && $v !== ''
        )));
    }
}
