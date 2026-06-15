<?php

namespace App\Modules\Foundation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Foundation\Models\OrganizationalUnit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizationalUnitController extends Controller
{
    public function index(): JsonResponse
    {
        $units = OrganizationalUnit::query()
            ->where('is_active', true)
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'parent_id', 'type']);

        return response()->json(['data' => $units]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:organizational_units,code'],
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'exists:organizational_units,id'],
            'type' => ['nullable', 'string', 'max:50'],
        ]);

        $unit = OrganizationalUnit::query()->create([
            ...$data,
            'type' => $data['type'] ?? 'department',
        ]);

        return response()->json(['data' => $unit], 201);
    }
}
