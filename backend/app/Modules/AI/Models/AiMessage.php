<?php

namespace App\Modules\AI\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AiMessage extends Model
{
    protected $fillable = [
        'ai_session_id',
        'role',
        'content',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(AiSession::class, 'ai_session_id');
    }

    public function toolCalls(): HasMany
    {
        return $this->hasMany(AiToolCall::class);
    }

    public function feedback(): HasOne
    {
        return $this->hasOne(AiFeedback::class);
    }
}
