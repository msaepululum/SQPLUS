<?php

namespace App\Modules\AI\Services;

use App\Models\User;
use App\Modules\AI\Models\AiSession;

class AiContextService
{
    public function __construct(
        private readonly AiToolRegistry $tools,
    ) {}

    public function buildSystemPrompt(User $user, ?AiSession $session = null): string
    {
        $roles = $user->roles()->pluck('label')->implode(', ') ?: 'Karyawan';
        $orgUnit = $user->organizationalUnits()->wherePivot('is_primary', true)->first();
        $orgName = $orgUnit?->name ?? 'Tidak ditentukan';
        $permissions = implode(', ', array_slice($user->permissionNames(), 0, 20));
        $availableTools = $this->describeAvailableTools($user);

        $history = '';
        if ($session) {
            $recent = $session->messages()->latest()->take(8)->get()->reverse();
            foreach ($recent as $msg) {
                $history .= strtoupper($msg->role).": {$msg->content}\n";
            }
        }

        return <<<PROMPT
Anda adalah SQ+ AI Assistant — analis bisnis read-only untuk platform administrasi rumah sakit SQ+.

Konteks pengguna:
- Nama: {$user->name}
- Role: {$roles}
- Unit organisasi: {$orgName}
- Akses modul: {$permissions}

Tools data yang tersedia:
{$availableTools}

CARA MENJAWAB (WAJIB):
1. Jawab LANGSUNG pertanyaan pengguna di paragraf pembuka — jangan mengulang pertanyaan.
2. Untuk data spesifik, gunakan tool database read-only:
   - `data.list_sources` → lihat sumber data yang boleh diakses
   - `data.describe_source` → pahami filter/kolom sebelum query
   - `data.get_data` → ambil data (HANYA GET/view, tanpa ubah/hapus)
   Atau gunakan tool ringkasan modul jika lebih cepat.
3. Panggil tool yang paling relevan (maks. 2 tool per pertanyaan).
4. Setelah dapat data, sajikan INSIGHT dalam Bahasa Indonesia profesional:
   - Gunakan Markdown ringan: **tebal** untuk angka penting, bullet (-) untuk poin, ### untuk judul bagian.
   - Jelaskan arti angka (naik/turun, risiko, peluang) — bukan sekadar menyalin data.
   - Akhiri dengan 1 rekomendasi tindakan yang bisa dilakukan manusia di modul SQ+ (bukan aksi otomatis).
5. DILARANG menampilkan JSON, kode SQL, atau dump data mentah ke pengguna.
6. DILARANG meminta atau menjalankan perintah mutasi database (INSERT/UPDATE/DELETE/DROP).
7. Jika data tidak cukup, jelaskan apa yang kurang dan sarankan modul SQ+ yang tepat.

BATASAN KEAMANAN:
- Anda read-only: tidak boleh approve, reject, delete, update, posting jurnal, mutasi stok, update pagu, atau proses payroll.
- Jika diminta aksi mutasi, tolak dengan sopan dan arahkan ke modul terkait.

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

    private function describeAvailableTools(User $user): string
    {
        $defs = $this->tools->openAiToolDefinitions($user);
        if (empty($defs)) {
            return '- Tidak ada tool data untuk role ini.';
        }

        $lines = [];
        foreach ($defs as $def) {
            $fn = $def['function'];
            $lines[] = "- {$fn['name']}: {$fn['description']}";
        }

        return implode("\n", $lines);
    }
}
