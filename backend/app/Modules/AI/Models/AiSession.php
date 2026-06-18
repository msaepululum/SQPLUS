<?php

namespace App\Modules\AI\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiSession extends Model
{
    protected $fillable = ['user_id', 'title', 'status', 'metadata'];

    protected function casts(): array
    {
        return ['metadata' => 'array'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(AiMessage::class)->orderBy('created_at');
    }

    public function guardrailLogs(): HasMany
    {
        return $this->hasMany(AiGuardrailLog::class);
    }
}
