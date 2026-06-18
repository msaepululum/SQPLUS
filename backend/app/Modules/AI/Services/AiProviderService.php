<?php

namespace App\Modules\AI\Services;

use App\Models\User;

class AiProviderService
{
    public function __construct(
        private readonly OpenAiCompatibleProviderService $openAi,
        private readonly GeminiProviderService $gemini,
    ) {}

    /**
     * @param  list<array{role: string, content: string}>  $history
     * @return array{content: string, tool_calls: list<array{name: string, input: array, output: array}>}
     */
    public function complete(
        User $user,
        string $systemPrompt,
        array $history,
        string $userMessage,
        callable $onToolCall,
    ): array {
        $provider = config('services.ai.provider', 'openai');

        return match ($provider) {
            'gemini' => $this->gemini->complete($user, $systemPrompt, $history, $userMessage, $onToolCall),
            default => $this->openAi->complete($user, $systemPrompt, $history, $userMessage, $onToolCall),
        };
    }
}
