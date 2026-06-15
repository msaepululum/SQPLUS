<?php

namespace App\Modules\Workflow\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Workflow\Models\ApprovalInstance;
use App\Services\ApprovalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApprovalController extends Controller
{
    public function __construct(private readonly ApprovalService $approvals) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $roleNames = $user->roles->pluck('name');

        $instances = ApprovalInstance::query()
            ->with(['submitter:id,name,email', 'actions.user:id,name'])
            ->whereIn('status', ['submitted', 'in_review'])
            ->where(function ($q) use ($user, $roleNames) {
                $q->where('submitter_id', $user->id);

                if ($roleNames->isNotEmpty()) {
                    $q->orWhereHas('submitter'); // placeholder for queue visibility
                }
            })
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20));

        return response()->json($instances);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $data = $request->validate(['note' => ['nullable', 'string', 'max:1000']]);

        $instance = $this->approvals->approve($id, $request->user()->id, $data['note'] ?? null);

        return response()->json(['data' => $instance]);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $data = $request->validate(['reason' => ['required', 'string', 'max:1000']]);

        $instance = $this->approvals->reject($id, $request->user()->id, $data['reason']);

        return response()->json(['data' => $instance]);
    }
}
