<?php

namespace App\Modules\AI\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\AI\Http\Requests\AiChatRequest;
use App\Modules\AI\Models\AiFeedback;
use App\Modules\AI\Models\AiMessage;
use App\Modules\AI\Models\AiSession;
use App\Modules\AI\Services\AiAssistantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiAssistantController extends Controller
{
    public function __construct(private readonly AiAssistantService $assistant) {}

    public function chat(AiChatRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();

        if (! empty($data['session_id'])) {
            AiSession::query()
                ->where('user_id', $user->id)
                ->where('id', $data['session_id'])
                ->firstOrFail();
        }

        $result = $this->assistant->chat(
            $user,
            $data['message'],
            $data['session_id'] ?? null,
        );

        return response()->json([
            'data' => [
                'session' => $result['session'],
                'messages' => collect($result['messages'])->map(fn ($m) => $this->formatMessage($m)),
                'tool_results' => $result['tool_results'],
                'blocked' => $result['blocked'],
            ],
        ]);
    }

    public function sessions(Request $request): JsonResponse
    {
        $sessions = AiSession::query()
            ->where('user_id', $request->user()->id)
            ->orderByDesc('updated_at')
            ->paginate(20);

        return response()->json($sessions);
    }

    public function showSession(Request $request, AiSession $session): JsonResponse
    {
        if ($session->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $session->load(['messages.toolCalls', 'messages.feedback']);

        return response()->json([
            'data' => [
                'session' => $session,
                'messages' => $session->messages->map(fn ($m) => $this->formatMessage($m)),
            ],
        ]);
    }

    public function feedback(Request $request, AiMessage $message): JsonResponse
    {
        $data = $request->validate([
            'rating' => ['required', 'integer', 'in:1,-1'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $session = $message->session;
        if ($session->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($message->role !== 'assistant') {
            return response()->json(['message' => 'Feedback hanya untuk pesan assistant.'], 422);
        }

        $feedback = AiFeedback::query()->updateOrCreate(
            ['ai_message_id' => $message->id, 'user_id' => $request->user()->id],
            ['rating' => $data['rating'], 'comment' => $data['comment'] ?? null],
        );

        return response()->json(['data' => $feedback]);
    }

    private function formatMessage(AiMessage $message): array
    {
        return [
            'id' => $message->id,
            'role' => $message->role,
            'content' => $message->content,
            'metadata' => $message->metadata,
            'created_at' => $message->created_at?->toIso8601String(),
            'tool_calls' => $message->relationLoaded('toolCalls')
                ? $message->toolCalls->map(fn ($tc) => [
                    'id' => $tc->id,
                    'tool_name' => $tc->tool_name,
                    'output' => $tc->output,
                    'status' => $tc->status,
                ])
                : [],
            'feedback' => $message->relationLoaded('feedback') && $message->feedback
                ? ['rating' => $message->feedback->rating, 'comment' => $message->feedback->comment]
                : null,
        ];
    }
}
