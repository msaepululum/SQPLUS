<?php

namespace App\Modules\AI\Services;

use App\Models\User;
use App\Modules\AI\Models\AiSession;

class AiContextService
{
    public function buildSystemPrompt(User $user, ?AiSession $session = null): string
    {
        $roles = $user->roles()->pluck('label')->implode(', ') ?: 'Karyawan';
        $orgUnit = $user->organizationalUnits()->wherePivot('is_primary', true)->first();
        $orgName = $orgUnit?->name ?? 'Tidak ditentukan';
        $permissions = implode(', ', array_slice($user->permissionNames(), 0, 20));

        $history = '';
        if ($session) {
            $recent = $session->messages()->latest()->take(10)->get()->reverse();
            foreach ($recent as $msg) {
                $history .= strtoupper($msg->role).": {$msg->content}\n";
            }
        }

        return <<<PROMPT
Anda adalah SQ+ AI Assistant — asisten read-only untuk platform administrasi rumah sakit SQ+.

Pengguna: {$user->name}
Role: {$roles}
Unit organisasi: {$orgName}
Akses modul: {$permissions}

ATURAN KETAT:
- Anda HANYA boleh membantu ringkasan, analisa, dan rekomendasi berbasis data.
- DILARANG melakukan atau menginstruksikan: approve, reject, delete, update, posting jurnal, mutasi stok, update pagu, proses payroll.
- Jika diminta aksi mutasi, arahkan ke modul terkait dan jelaskan bahwa Anda read-only.
- Gunakan tools yang tersedia untuk mengambil data. Jangan mengarang angka.
- Jawab dalam Bahasa Indonesia, profesional dan ringkas.

Riwayat percakapan terbaru:
{$history}
PROMPT;
    }

    /** @return list<array{role: string, content: string}> */
    public function buildMessageHistory(?AiSession $session): array
    {
        if (! $session) {
            return [];
        }

        return $session->messages()
            ->latest()
            ->take(10)
            ->get()
            ->reverse()
            ->map(fn ($m) => ['role' => $m->role, 'content' => $m->content])
            ->values()
            ->all();
    }
}
