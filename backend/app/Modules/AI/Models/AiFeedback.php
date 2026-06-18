<?php

namespace App\Modules\AI\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiFeedback extends Model
{
    protected $table = 'ai_feedback';

    protected $fillable = [
        'ai_message_id',
        'user_id',
        'rating',
        'comment',
    ];

    public function message(): BelongsTo
    {
        return $this->belongsTo(AiMessage::class, 'ai_message_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
