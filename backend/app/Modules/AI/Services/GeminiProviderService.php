<?php

namespace App\Modules\AI\Services;

use App\Models\User;
use App\Modules\AI\Services\Concerns\ProvidesAiFallback;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiProviderService
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
        $apiKey = config('services.gemini.api_key');
        if (empty($apiKey)) {
            return $this->fallbackResponse($user, $userMessage);
        }

        $contents = $this->buildContents($history, $userMessage);
        $geminiTools = $this->toGeminiTools($this->tools->openAiToolDefinitions($user));
        $executedTools = [];

        try {
            $response = $this->generateContent($systemPrompt, $contents, $geminiTools);
            $parts = $response['candidates'][0]['content']['parts'] ?? [];
            $functionCalls = $this->extractFunctionCalls($parts);

            if (! empty($functionCalls)) {
                $modelParts = [];
                $userParts = [];

                foreach ($functionCalls as $call) {
                    $name = $call['name'];
                    $input = $call['args'];
                    $output = $this->tools->execute($user, $name, $input);
                    $executedTools[] = ['name' => $name, 'input' => $input, 'output' => $output];
                    $onToolCall($name, $input, $output);

                    $modelParts[] = ['functionCall' => ['name' => $name, 'args' => (object) $input]];
                    $userParts[] = [
                        'functionResponse' => [
                            'name' => $name,
                            'response' => [
                                'insight_text' => $this->insights->formatToolForModel($name, $output),
                            ],
                        ],
                    ];
                }

                $contents[] = ['role' => 'model', 'parts' => $modelParts];
                $contents[] = ['role' => 'user', 'parts' => $userParts];
                $contents[] = [
                    'role' => 'user',
                    'parts' => [[
                        'text' => 'Susun jawaban akhir sebagai insight bisnis dalam Bahasa Indonesia. Gunakan Markdown ringan. Jangan tampilkan JSON atau dump data mentah.',
                    ]],
                ];

                $finalResponse = $this->generateContent($systemPrompt, $contents, []);
                $content = $this->extractText($finalResponse['candidates'][0]['content']['parts'] ?? [])
                    ?: $this->insights->synthesizeFromTools($executedTools, $userMessage);

                return [
                    'content' => $this->insights->polishAssistantContent($content, $userMessage),
                    'tool_calls' => $executedTools,
                ];
            }

            $content = $this->extractText($parts);

            return [
                'content' => $this->insights->polishAssistantContent(
                    $content ?: 'Maaf, saya tidak dapat memproses permintaan Anda.',
                    $userMessage
                ),
                'tool_calls' => [],
            ];
        } catch (\Throwable $e) {
            Log::warning('Gemini API error', ['message' => $e->getMessage()]);

            return $this->fallbackResponse($user, $userMessage, $executedTools);
        }
    }

    /**
     * @param  list<array{role: string, content: string}>  $history
     * @return list<array<string, mixed>>
     */
    private function buildContents(array $history, string $userMessage): array
    {
        $contents = [];

        foreach ($history as $msg) {
            $role = match ($msg['role']) {
                'assistant' => 'model',
                'user' => 'user',
                default => null,
            };

            if ($role === null) {
                continue;
            }

            $contents[] = [
                'role' => $role,
                'parts' => [['text' => $msg['content']]],
            ];
        }

        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $userMessage]],
        ];

        return $this->mergeConsecutiveRoles($contents);
    }

    /** @param  list<array<string, mixed>>  $contents */
    private function mergeConsecutiveRoles(array $contents): array
    {
        $merged = [];

        foreach ($contents as $entry) {
            $last = end($merged);
            if ($last && ($last['role'] ?? null) === ($entry['role'] ?? null)) {
                $merged[array_key_last($merged)]['parts'] = array_merge(
                    $last['parts'],
                    $entry['parts']
                );
            } else {
                $merged[] = $entry;
            }
        }

        return array_values($merged);
    }

    /** @param  list<array{type: string, function: array<string, mixed>}>  $openAiTools */
    private function toGeminiTools(array $openAiTools): array
    {
        if (empty($openAiTools)) {
            return [];
        }

        $declarations = [];
        foreach ($openAiTools as $tool) {
            $fn = $tool['function'];
            $declarations[] = [
                'name' => $fn['name'],
                'description' => $fn['description'],
                'parameters' => $this->sanitizeGeminiSchema($fn['parameters']),
            ];
        }

        return [['functionDeclarations' => $declarations]];
    }

    /** @param  array<string, mixed>  $schema */
    private function sanitizeGeminiSchema(array $schema): array
    {
        unset($schema['additionalProperties']);

        if (isset($schema['properties']) && is_array($schema['properties'])) {
            foreach ($schema['properties'] as $key => $property) {
                if (is_array($property)) {
                    $schema['properties'][$key] = $this->sanitizeGeminiSchema($property);
                }
            }
        }

        return $schema;
    }

    /** @param  list<array<string, mixed>>  $contents */
    private function generateContent(string $systemPrompt, array $contents, array $tools): array
    {
        $model = config('services.gemini.model', 'gemini-2.0-flash');
        $baseUrl = rtrim(config('services.gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta'), '/');
        $apiKey = config('services.gemini.api_key');

        $payload = [
            'systemInstruction' => [
                'parts' => [['text' => $systemPrompt]],
            ],
            'contents' => $contents,
            'generationConfig' => [
                'maxOutputTokens' => (int) config('services.ai.max_tokens', 1024),
            ],
        ];

        if (! empty($tools)) {
            $payload['tools'] = $tools;
            $payload['toolConfig'] = [
                'functionCallingConfig' => ['mode' => 'AUTO'],
            ];
        }

        $response = Http::timeout(60)
            ->post("{$baseUrl}/models/{$model}:generateContent?key={$apiKey}", $payload);

        if (! $response->successful()) {
            throw new \RuntimeException('Gemini API returned '.$response->status().': '.$response->body());
        }

        return $response->json();
    }

    /** @param  list<array<string, mixed>>  $parts */
    private function extractFunctionCalls(array $parts): array
    {
        $calls = [];
        foreach ($parts as $part) {
            if (isset($part['functionCall'])) {
                $calls[] = [
                    'name' => $part['functionCall']['name'] ?? '',
                    'args' => (array) ($part['functionCall']['args'] ?? []),
                ];
            }
        }

        return $calls;
    }

    /** @param  list<array<string, mixed>>  $parts */
    private function extractText(array $parts): string
    {
        $text = '';
        foreach ($parts as $part) {
            if (isset($part['text'])) {
                $text .= $part['text'];
            }
        }

        return trim($text);
    }
}
