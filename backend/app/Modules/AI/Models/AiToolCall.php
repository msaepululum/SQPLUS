<?php

namespace App\Modules\AI\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiToolCall extends Model
{
    protected $fillable = [
        'ai_message_id',
        'tool_name',
        'input',
        'output',
        'status',
        'duration_ms',
    ];

    protected function casts(): array
    {
        return [
            'input' => 'array',
            'output' => 'array',
        ];
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(AiMessage::class, 'ai_message_id');
    }
}
