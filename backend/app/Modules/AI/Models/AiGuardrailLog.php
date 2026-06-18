<?php

namespace App\Modules\AI\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiGuardrailLog extends Model
{
    protected $fillable = [
        'ai_session_id',
        'user_id',
        'trigger_type',
        'user_message',
        'response',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(AiSession::class, 'ai_session_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
