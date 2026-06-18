<?php

namespace App\Modules\AI\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AiChatRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'max:4000'],
            'session_id' => ['nullable', 'integer', 'exists:ai_sessions,id'],
        ];
    }
}
