<?php

namespace App\Services;

use App\Modules\Foundation\Models\Notification;

class NotificationService
{
    public function notify(
        int $userId,
        string $title,
        string $body,
        string $type = 'info',
        ?array $payload = null
    ): Notification {
        return Notification::query()->create([
            'user_id' => $userId,
            'title' => $title,
            'body' => $body,
            'type' => $type,
            'payload' => $payload,
        ]);
    }

    public function markAsRead(int $notificationId, int $userId): bool
    {
        return (bool) Notification::query()
            ->where('id', $notificationId)
            ->where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }
}
