<?php

namespace App\Modules\AI\Services;

use App\Models\User;
use App\Modules\AI\Services\Concerns\ProvidesAiFallback;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenAiCompatibleProviderService
{
    use ProvidesAiFallback;

    public function __construct(
        private readonly AiToolRegistry $tools,
        private readonly AiInsightService $insights,
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
        $apiKey = config('services.openai.api_key');
        if (empty($apiKey)) {
            return $this->fallbackResponse($user, $userMessage);
        }

        $messages = [['role' => 'system', 'content' => $systemPrompt]];
        foreach ($history as $msg) {
            $messages[] = ['role' => $msg['role'], 'content' => $msg['content']];
        }
        $messages[] = ['role' => 'user', 'content' => $userMessage];

        $toolDefs = $this->tools->openAiToolDefinitions($user);
        $executedTools = [];

        try {
            $response = $this->callApi($messages, $toolDefs);
            $choice = $response['choices'][0]['message'] ?? [];
            $toolCalls = $choice['tool_calls'] ?? [];

            if (! empty($toolCalls)) {
                $messages[] = $choice;

                foreach ($toolCalls as $tc) {
                    $name = $tc['function']['name'] ?? '';
                    $input = json_decode($tc['function']['arguments'] ?? '{}', true) ?: [];
                    $output = $this->tools->execute($user, $name, $input);
                    $executedTools[] = ['name' => $name, 'input' => $input, 'output' => $output];
                    $onToolCall($name, $input, $output);

                    $messages[] = [
                        'role' => 'tool',
                        'tool_call_id' => $tc['id'],
                        'content' => $this->insights->formatToolForModel($name, $output),
                    ];
                }

                $messages[] = [
                    'role' => 'system',
                    'content' => 'Susun jawaban akhir sebagai insight bisnis dalam Bahasa Indonesia. Gunakan Markdown ringan. Jangan tampilkan JSON atau dump data mentah.',
                ];

                $finalResponse = $this->callApi($messages, []);
                $content = $finalResponse['choices'][0]['message']['content']
                    ?? $this->insights->synthesizeFromTools($executedTools, $userMessage);

                return [
                    'content' => $this->insights->polishAssistantContent($content, $userMessage),
                    'tool_calls' => $executedTools,
                ];
            }

            return [
                'content' => $this->insights->polishAssistantContent(
                    $choice['content'] ?? 'Maaf, saya tidak dapat memproses permintaan Anda.',
                    $userMessage
                ),
                'tool_calls' => [],
            ];
        } catch (\Throwable $e) {
            Log::warning('OpenAI-compatible API error', ['message' => $e->getMessage()]);

            return $this->fallbackResponse($user, $userMessage, $executedTools);
        }
    }

    /** @param  list<array{type: string, function: array<string, mixed>}>  $tools */
    private function callApi(array $messages, array $tools): array
    {
        $payload = [
            'model' => config('services.openai.model', 'gpt-4o-mini'),
            'messages' => $messages,
            'max_tokens' => (int) config('services.ai.max_tokens', 1024),
        ];

        if (! empty($tools)) {
            $payload['tools'] = $tools;
            $payload['tool_choice'] = 'auto';
        }

        $response = Http::withToken(config('services.openai.api_key'))
            ->baseUrl(rtrim(config('services.openai.base_url', 'https://api.openai.com/v1'), '/'))
            ->timeout(60)
            ->post('/chat/completions', $payload);

        if (! $response->successful()) {
            throw new \RuntimeException('OpenAI-compatible API returned '.$response->status().': '.$response->body());
        }

        return $response->json();
    }
}
