<?php

namespace App\Modules\AI\Services;

use App\Models\User;
use App\Modules\AI\Models\AiGuardrailLog;
use App\Modules\AI\Models\AiSession;

class AiGuardrailService
{
    public const REFUSAL_MESSAGE = 'Untuk keamanan, saya belum dapat melakukan perubahan data langsung. Saya hanya bisa membantu membuat ringkasan, analisa, dan rekomendasi. Buka modul terkait di SQ+ untuk melakukan tindakan tersebut.';

    /** @var list<string> */
    private const MUTATION_PATTERNS = [
        '/\b(silakan|tolong|mohon|please)\s+(approve|setujui|setujukan|tolak|reject|hapus|delete|ubah|update|posting|proses)\b/i',
        '/\b(approve|setujui|setujukan)\s+(pr|po|cuti|dokumen|ini|tersebut|\w+-\d{4}-\d+)/i',
        '/\b(tolak|reject)\s+(pr|po|cuti|dokumen|ini|tersebut|\w+-\d{4}-\d+)/i',
        '/\b(hapus|delete)\s+(data|record|dokumen|pr|po|jurnal)/i',
        '/\b(ubah|update|edit|perbarui)\s+(pagu|stok|data|jurnal|payroll)/i',
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
        if ($this->isReadOnlyQuery($message)) {
            return false;
        }

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

    private function isReadOnlyQuery(string $message): bool
    {
        $readOnlySignals = '/\b(ringkasan|summary|berapa|tampilkan|lihat|daftar|status|analisa|analisis|insight|kpi|laporan|report|pending|menunggu|kritis|realisasi|pagu|pendapatan|arus\s+kas|cashflow|headcount|karyawan|eksekutif)\b/i';

        if (! preg_match($readOnlySignals, $message)) {
            return false;
        }

        $actionSignals = '/\b(silakan|tolong|mohon)\s+(approve|setujui|tolak|hapus|ubah|posting|proses)\b/i';

        return ! preg_match($actionSignals, $message);
    }
}
