<?php

namespace App\Modules\AI\Services\Concerns;

use App\Models\User;
use App\Modules\AI\Services\AiInsightService;
use App\Modules\AI\Services\AiToolRegistry;

trait ProvidesAiFallback
{
    protected function fallbackResponse(User $user, string $userMessage, array $existing = []): array
    {
        /** @var AiInsightService $insights */
        $insights = app(AiInsightService::class);

        $toolCalls = $existing;
        $toolName = $this->inferToolFromMessage($userMessage, $user);

        if ($toolName && empty($toolCalls)) {
            $input = $this->buildToolInput($toolName, $userMessage);
            $output = $this->tools->execute($user, $toolName, $input);
            $toolCalls[] = ['name' => $toolName, 'input' => $input, 'output' => $output];
        }

        if (empty($toolCalls)) {
            return [
                'content' => $this->buildHelpMessage($user),
                'tool_calls' => [],
            ];
        }

        $intro = $this->buildDirectAnswerIntro($userMessage, $toolCalls);

        return [
            'content' => $intro."\n\n".$insights->synthesizeFromTools($toolCalls, $userMessage),
            'tool_calls' => $toolCalls,
        ];
    }

    protected function inferToolFromMessage(string $message, User $user): ?string
    {
        $normalized = mb_strtolower($message);

        $candidates = [
            ['tool' => 'data.get_data', 'score' => $this->score($normalized, ['data', 'database', 'tabel', 'query', 'lihat data', 'tampilkan data']) + ($this->inferDataSource($normalized) ? 2 : 0)],
            ['tool' => 'data.list_sources', 'score' => $this->score($normalized, ['sumber data', 'data apa saja', 'list data', 'data tersedia'])],
            ['tool' => 'approval.my_pending_approvals', 'score' => $this->score($normalized, ['approval pending', 'pending saya', 'persetujuan saya', 'menunggu approval', 'butuh approval'])],
            ['tool' => 'supply_chain.stock_critical', 'score' => $this->score($normalized, ['stok kritis', 'stok minimum', 'di bawah minimum', 'inventori kritis', 'stock kritis'])],
            ['tool' => 'finance.revenue_summary', 'score' => $this->score($normalized, ['pendapatan', 'revenue', 'omzet', 'penerimaan'])],
            ['tool' => 'finance.expense_realization', 'score' => $this->score($normalized, ['realisasi belanja', 'realisasi anggaran', 'belanja vs pagu', 'pagu anggaran', 'serapan anggaran'])],
            ['tool' => 'finance.cashflow_summary', 'score' => $this->score($normalized, ['arus kas', 'cashflow', 'cash flow', 'inflow', 'outflow'])],
            ['tool' => 'finance.dashboard_summary', 'score' => $this->score($normalized, ['dashboard keuangan', 'posisi keuangan', 'saldo kas', 'likuiditas', 'piutang hutang'])],
            ['tool' => 'hr.employee_summary', 'score' => $this->score($normalized, ['karyawan', 'sdm', 'pegawai', 'headcount', 'cuti pending', 'kontrak berakhir'])],
            ['tool' => 'procurement.request_summary', 'score' => $this->score($normalized, ['purchase request', 'pr aktif', 'pengadaan', 'pr pending'])],
            ['tool' => 'report.executive_summary', 'score' => $this->score($normalized, ['ringkasan eksekutif', 'executive summary', 'kpi lintas', 'kondisi rs', 'kondisi rumah sakit'])],
        ];

        usort($candidates, fn ($a, $b) => $b['score'] <=> $a['score']);

        $defs = $this->tools->openAiToolDefinitions($user);
        $names = array_map(fn ($t) => $t['function']['name'], $defs);

        foreach ($candidates as $candidate) {
            if ($candidate['score'] > 0 && in_array($candidate['tool'], $names, true)) {
                return $candidate['tool'];
            }
        }

        if (preg_match('/\b(keuangan|finansial|anggaran)\b/u', $normalized) && in_array('finance.dashboard_summary', $names, true)) {
            return 'finance.dashboard_summary';
        }

        return null;
    }

    /** @return array<string, mixed> */
    private function buildToolInput(string $toolName, string $userMessage): array
    {
        if ($toolName !== 'data.get_data') {
            return [];
        }

        $source = $this->inferDataSource(mb_strtolower($userMessage));
        if (! $source) {
            return [];
        }

        $filters = [];
        if (preg_match('/\b(20\d{2})\b/', $userMessage, $m)) {
            $filters['tahun'] = (int) $m[1];
        }
        if (preg_match('/\b(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\b/i', $userMessage, $m)) {
            $filters['bulan'] = $this->monthFromName(mb_strtolower($m[1]));
        }

        return array_filter([
            'source' => $source,
            'filters' => $filters ?: null,
        ]);
    }

    private function inferDataSource(string $message): ?string
    {
        $map = [
            'finance.cash_bank' => ['kas', 'bank', 'bku', 'saldo kas'],
            'finance.revenue' => ['pendapatan', 'revenue', 'omzet'],
            'finance.budget_monitoring' => ['pagu', 'serapan', 'monitoring anggaran', 'realisasi belanja'],
            'finance.budget_years' => ['tahun anggaran'],
            'hr.employees' => ['karyawan', 'pegawai', 'sdm', 'headcount'],
            'hr.leave_pending' => ['cuti pending', 'cuti menunggu'],
            'workflow.approvals' => ['approval', 'persetujuan', 'pending'],
        ];

        foreach ($map as $source => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($message, $keyword)) {
                    return $source;
                }
            }
        }

        return null;
    }

    private function monthFromName(string $name): int
    {
        return match ($name) {
            'januari' => 1, 'februari' => 2, 'maret' => 3, 'april' => 4,
            'mei' => 5, 'juni' => 6, 'juli' => 7, 'agustus' => 8,
            'september' => 9, 'oktober' => 10, 'november' => 11, 'desember' => 12,
            default => (int) now()->month,
        };
    }

    /** @param  list<string>  $phrases */
    private function score(string $message, array $phrases): int
    {
        $score = 0;
        foreach ($phrases as $phrase) {
            if (str_contains($message, $phrase)) {
                $score += 3;
            }
        }

        return $score;
    }

  /** @param  list<array{name: string, output: array}>  $toolCalls */
    private function buildDirectAnswerIntro(string $userMessage, array $toolCalls): string
    {
        $toolName = $toolCalls[0]['name'] ?? '';

        if (preg_match('/\b(berapa|ada berapa|jumlah)\b/i', $userMessage)) {
            return 'Berikut jawaban singkat berdasarkan data terbaru di SQ+:';
        }

        if (preg_match('/\b(pending|menunggu)\b/i', $userMessage) && $toolName === 'approval.my_pending_approvals') {
            return 'Ini daftar dan ringkasan approval yang masih menunggu tindakan Anda:';
        }

        if (preg_match('/\b(kritis|minimum)\b/i', $userMessage) && $toolName === 'supply_chain.stock_critical') {
            return 'Berikut item stok yang perlu perhatian segera:';
        }

        return 'Saya sudah menarik data relevan untuk pertanyaan Anda:';
    }

    private function buildHelpMessage(User $user): string
    {
        $defs = $this->tools->openAiToolDefinitions($user);
        if (empty($defs)) {
            return 'Halo! Saya SQ+ AI Assistant. Saat ini belum ada modul data yang dapat saya akses untuk role Anda. Hubungi administrator jika membutuhkan akses laporan.';
        }

        $examples = [
            'Ringkasan keuangan bulan ini',
            'Approval pending saya',
            'Stok kritis farmasi',
            'Realisasi anggaran Q2',
            'Ringkasan eksekutif KPI',
        ];

        $list = implode("\n- ", $examples);

        return <<<MSG
Halo! Saya SQ+ AI Assistant — siap membantu **analisa dan insight** dari data SQ+ (read-only).

Contoh pertanyaan:
- {$list}

Ajukan pertanyaan spesifik agar saya bisa memberikan jawaban yang tepat.
MSG;
    }
}
