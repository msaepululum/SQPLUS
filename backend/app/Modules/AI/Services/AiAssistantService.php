<?php

namespace App\Modules\AI\Services;

use App\Models\User;
use App\Modules\AI\Models\AiMessage;
use App\Modules\AI\Models\AiSession;
use App\Modules\AI\Models\AiToolCall;
use Illuminate\Support\Str;

class AiAssistantService
{
    public function __construct(
        private readonly AiGuardrailService $guardrail,
        private readonly AiContextService $context,
        private readonly AiProviderService $provider,
        private readonly AiInsightService $insights,
    ) {}

    /** @return array{session: AiSession, messages: list<AiMessage>, tool_results: list<array<string, mixed>>, blocked: bool} */
    public function chat(User $user, string $message, ?int $sessionId = null): array
    {
        $session = $this->resolveSession($user, $sessionId, $message);

        if ($this->guardrail->isBlocked($message)) {
            $refusal = $this->guardrail->logAndRefuse($user, $message, $session);

            $userMsg = $session->messages()->create([
                'role' => 'user',
                'content' => $message,
            ]);

            $assistantMsg = $session->messages()->create([
                'role' => 'assistant',
                'content' => $refusal,
                'metadata' => ['guardrail' => true],
            ]);

            $session->update(['title' => $session->title ?? Str::limit($message, 80)]);

            return [
                'session' => $session->fresh(),
                'messages' => [$userMsg, $assistantMsg],
                'tool_results' => [],
                'blocked' => true,
            ];
        }

        $userMsg = $session->messages()->create([
            'role' => 'user',
            'content' => $message,
        ]);

        $systemPrompt = $this->context->buildSystemPrompt($user, $session);
        $history = $this->context->buildMessageHistory($session);
        $pendingToolCalls = [];

        $result = $this->provider->complete(
            $user,
            $systemPrompt,
            $history,
            $message,
            function (string $name, array $input, array $output) use (&$pendingToolCalls) {
                $pendingToolCalls[] = compact('name', 'input', 'output');
            },
        );

        $content = $this->insights->polishAssistantContent($result['content'], $message);
        if (trim($content) === '' && ! empty($result['tool_calls'])) {
            $content = $this->insights->synthesizeFromTools($result['tool_calls'], $message);
        }

        $assistantMsg = $session->messages()->create([
            'role' => 'assistant',
            'content' => $content,
            'metadata' => ['tool_count' => count($result['tool_calls'])],
        ]);

        $toolResults = [];
        foreach ($result['tool_calls'] as $tc) {
            $start = microtime(true);
            $toolCall = AiToolCall::query()->create([
                'ai_message_id' => $assistantMsg->id,
                'tool_name' => $tc['name'],
                'input' => $tc['input'],
                'output' => $tc['output'],
                'status' => isset($tc['output']['error']) ? 'error' : 'completed',
                'duration_ms' => (int) ((microtime(true) - $start) * 1000),
            ]);
            $toolResults[] = [
                'id' => $toolCall->id,
                'tool_name' => $tc['name'],
                'output' => $tc['output'],
            ];
        }

        if (! $session->title) {
            $session->update(['title' => Str::limit($message, 80)]);
        }
        $session->touch();

        return [
            'session' => $session->fresh(),
            'messages' => [$userMsg->fresh(), $assistantMsg->fresh(['toolCalls'])],
            'tool_results' => $toolResults,
            'blocked' => false,
        ];
    }

    private function resolveSession(User $user, ?int $sessionId, string $message): AiSession
    {
        if ($sessionId) {
            return AiSession::query()
                ->where('user_id', $user->id)
                ->where('id', $sessionId)
                ->firstOrFail();
        }

        return AiSession::query()->create([
            'user_id' => $user->id,
            'title' => null,
            'status' => 'active',
        ]);
    }
}
