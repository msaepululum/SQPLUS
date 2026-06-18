<?php

namespace App\Modules\AI\Services;

use App\Models\User;
use App\Modules\AI\Models\AiGuardrailLog;
use App\Modules\AI\Models\AiSession;

class AiGuardrailService
{
    public const REFUSAL_MESSAGE = 'Untuk keamanan, saya belum dapat melakukan perubahan data langsung. Saya hanya bisa membantu membuat ringkasan, analisa, dan rekomendasi.';

    /** @var list<string> */
    private const MUTATION_PATTERNS = [
        '/\b(approve|setujui|approval)\b/i',
        '/\b(reject|tolak|menolak)\b/i',
        '/\b(delete|hapus|menghapus)\b/i',
        '/\b(update|ubah|perbarui|edit)\b/i',
        '/\bposting\s+jurnal\b/i',
        '/\bmutasi\s+stok\b/i',
        '/\bupdate\s+stok\b/i',
        '/\bupdate\s+pagu\b/i',
        '/\bproses\s+payroll\b/i',
        '/\b(buat|create)\s+(jurnal|po|pr)\b/i',
        '/\b(kirim|submit)\s+(approval|pengajuan)\b/i',
    ];

    public function isBlocked(string $message): bool
    {
        foreach (self::MUTATION_PATTERNS as $pattern) {
            if (preg_match($pattern, $message)) {
                return true;
            }
        }

        return false;
    }

    public function logAndRefuse(User $user, string $message, ?AiSession $session = null): string
    {
        AiGuardrailLog::query()->create([
            'ai_session_id' => $session?->id,
            'user_id' => $user->id,
            'trigger_type' => 'blocked_mutation',
            'user_message' => $message,
            'response' => self::REFUSAL_MESSAGE,
        ]);

        return self::REFUSAL_MESSAGE;
    }
}
