<?php

namespace App\Services;

use App\Modules\Foundation\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditTrailService
{
    public function log(
        string $action,
        string $entityType,
        ?int $entityId = null,
        ?int $userId = null,
        ?array $metadata = null
    ): AuditLog {
        return AuditLog::query()->create([
            'user_id' => $userId ?? Auth::id(),
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'metadata' => $metadata,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'created_at' => now(),
        ]);
    }
}
