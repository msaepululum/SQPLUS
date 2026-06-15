<?php

namespace App\Modules\Workflow\Models;

use Illuminate\Database\Eloquent\Model;

class ApprovalFlow extends Model
{
    protected $fillable = [
        'document_type',
        'name',
        'steps',
        'director_threshold',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'steps' => 'array',
            'director_threshold' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }
}
