<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Services\FinanceMasterService;
use Illuminate\Http\JsonResponse;

class FinanceMasterController extends Controller
{
    public function __construct(
        private readonly FinanceMasterService $service
    ) {}

    public function kelompokBelanja(): JsonResponse
    {
        return response()->json(['data' => $this->service->kelompokBelanja()]);
    }

    public function jenisBelanja(): JsonResponse
    {
        return response()->json(['data' => $this->service->jenisBelanja()]);
    }

    public function pptk(): JsonResponse
    {
        return response()->json(['data' => $this->service->pptk()]);
    }

    public function ptk(): JsonResponse
    {
        return response()->json(['data' => $this->service->ptk()]);
    }

    public function jenisRekening(): JsonResponse
    {
        return response()->json(['data' => $this->service->jenisRekening()]);
    }

    public function sro(): JsonResponse
    {
        return response()->json(['data' => $this->service->sro()]);
    }

    public function satuan(): JsonResponse
    {
        return response()->json(['data' => $this->service->satuan()]);
    }
}
