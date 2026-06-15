<?php

namespace App\Modules\Foundation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Foundation\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $logs = AuditLog::query()
            ->with('user:id,name,email')
            ->when($request->entity_type, fn ($q, $type) => $q->where('entity_type', $type))
            ->when($request->user_id, fn ($q, $id) => $q->where('user_id', $id))
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20));

        return response()->json($logs);
    }
}
