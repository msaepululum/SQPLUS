<?php

namespace App\Modules\AI\Services;

class AiInsightService
{
    private const TOOL_LABELS = [
        'data.list_sources' => 'Sumber Data',
        'data.describe_source' => 'Deskripsi Data',
        'data.get_data' => 'Data Live',
        'finance.dashboard_summary' => 'Dashboard Keuangan',
        'finance.revenue_summary' => 'Ringkasan Pendapatan',
        'finance.expense_realization' => 'Realisasi Belanja',
        'finance.cashflow_summary' => 'Arus Kas',
        'hr.employee_summary' => 'Ringkasan SDM',
        'procurement.request_summary' => 'Ringkasan Purchase Request',
        'supply_chain.stock_critical' => 'Stok Kritis',
        'approval.my_pending_approvals' => 'Approval Pending',
        'report.executive_summary' => 'Ringkasan Eksekutif',
    ];

    /** @param  list<array{name: string, output: array<string, mixed>}>  $toolCalls */
    public function synthesizeFromTools(array $toolCalls, string $userQuestion = ''): string
    {
        if (empty($toolCalls)) {
            return '';
        }

        $sections = [];
        foreach ($toolCalls as $tc) {
            $section = $this->formatToolInsight($tc['name'], $tc['output'], $userQuestion);
            if ($section !== '') {
                $sections[] = $section;
            }
        }

        return implode("\n\n", $sections);
    }

    /** @param  array<string, mixed>  $output */
    public function formatToolInsight(string $toolName, array $output, string $userQuestion = ''): string
    {
        if (isset($output['error'])) {
            return (string) ($output['message'] ?? 'Data tidak tersedia untuk modul ini.');
        }

        $label = self::TOOL_LABELS[$toolName] ?? $toolName;
        $lines = ["### {$label}"];

        if (! empty($output['summary'])) {
            $lines[] = (string) $output['summary'];
        }

        if (! empty($output['metrics'])) {
            $lines[] = '';
            $lines[] = '**Indikator utama:**';
            foreach ($output['metrics'] as $metric) {
                $change = ! empty($metric['change']) ? " ({$metric['change']})" : '';
                $lines[] = "- **{$metric['label']}:** {$metric['value']}{$change}";
            }
        }

        $itemInsight = $this->buildItemInsight($toolName, $output['items'] ?? []);
        if ($itemInsight !== '') {
            $lines[] = '';
            $lines[] = $itemInsight;
        }

        $recommendation = $this->buildRecommendation($toolName, $output, $userQuestion);
        if ($recommendation !== '') {
            $lines[] = '';
            $lines[] = "**Insight:** {$recommendation}";
        }

        return implode("\n", $lines);
    }

    /** @param  array<string, mixed>  $output */
    public function formatToolForModel(string $toolName, array $output): string
    {
        if (isset($output['error'])) {
            return (string) ($output['message'] ?? 'Data tidak tersedia.');
        }

        return $this->formatToolInsight($toolName, $output);
    }

    public function polishAssistantContent(string $content, string $userQuestion = ''): string
    {
        $trimmed = trim($content);
        if ($trimmed === '') {
            return $trimmed;
        }

        if ($this->looksLikeJson($trimmed)) {
            $decoded = json_decode($trimmed, true);
            if (is_array($decoded)) {
                return $this->formatGenericData($decoded, $userQuestion);
            }
        }

        if (preg_match('/```(?:json)?\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/i', $trimmed, $matches)) {
            $decoded = json_decode($matches[1], true);
            if (is_array($decoded)) {
                $formatted = $this->formatGenericData($decoded, $userQuestion);
                $trimmed = trim(str_replace($matches[0], $formatted, $trimmed));
            }
        }

        return $trimmed;
    }

    /** @param  list<array<string, mixed>>  $items */
    private function buildItemInsight(string $toolName, array $items): string
    {
        if (empty($items)) {
            return '';
        }

        $lines = ['**Rincian:**'];

        return match ($toolName) {
            'finance.revenue_summary' => $this->formatRevenueItems($items, $lines),
            'finance.expense_realization' => $this->formatExpenseItems($items, $lines),
            'supply_chain.stock_critical' => $this->formatStockItems($items, $lines),
            'approval.my_pending_approvals' => $this->formatApprovalItems($items, $lines),
            'report.executive_summary' => $this->formatExecutiveItems($items, $lines),
            'hr.employee_summary' => $this->formatHrItems($items, $lines),
            'procurement.request_summary' => $this->formatProcurementItems($items, $lines),
            default => $this->formatGenericItems($items, $lines),
        };
    }

    /** @param  list<array<string, mixed>>  $items */
    private function formatRevenueItems(array $items, array $lines): string
    {
        foreach ($items as $item) {
            $lines[] = "- {$item['unit']}: {$item['amount']} ({$item['share']} dari total)";
        }

        return implode("\n", $lines);
    }

    /** @param  list<array<string, mixed>>  $items */
    private function formatExpenseItems(array $items, array $lines): string
    {
        foreach ($items as $item) {
            $lines[] = "- {$item['coa']}: realisasi {$item['realisasi']} dari pagu {$item['pagu']} ({$item['pct']})";
        }

        return implode("\n", $lines);
    }

    /** @param  list<array<string, mixed>>  $items */
    private function formatStockItems(array $items, array $lines): string
    {
        foreach ($items as $item) {
            $lines[] = "- {$item['code']} {$item['name']}: stok {$item['stock']} (min. {$item['min']})";
        }

        return implode("\n", $lines);
    }

    /** @param  list<array<string, mixed>>  $items */
    private function formatApprovalItems(array $items, array $lines): string
    {
        foreach ($items as $item) {
            $lines[] = "- {$item['doc']} ({$item['type']}, {$item['dept']}): {$item['amount']}";
        }

        return implode("\n", $lines);
    }

    /** @param  list<array<string, mixed>>  $items */
    private function formatExecutiveItems(array $items, array $lines): string
    {
        foreach ($items as $item) {
            $lines[] = "- {$item['area']}: **{$item['status']}** — {$item['note']}";
        }

        return implode("\n", $lines);
    }

    /** @param  list<array<string, mixed>>  $items */
    private function formatHrItems(array $items, array $lines): string
    {
        foreach ($items as $item) {
            $lines[] = "- {$item['status']}: {$item['count']} orang";
        }

        return implode("\n", $lines);
    }

    /** @param  list<array<string, mixed>>  $items */
    private function formatProcurementItems(array $items, array $lines): string
    {
        foreach ($items as $item) {
            $lines[] = "- {$item['dept']}: {$item['open']} terbuka, {$item['approved']} disetujui bulan ini";
        }

        return implode("\n", $lines);
    }

    /** @param  list<array<string, mixed>>  $items */
    private function formatGenericItems(array $items, array $lines): string
    {
        foreach (array_slice($items, 0, 8) as $item) {
            $pairs = [];
            foreach ($item as $key => $value) {
                $pairs[] = "{$key}: {$value}";
            }
            $lines[] = '- '.implode(', ', $pairs);
        }

        return implode("\n", $lines);
    }

    /** @param  array<string, mixed>  $output */
    private function buildRecommendation(string $toolName, array $output, string $userQuestion): string
    {
        $metrics = $output['metrics'] ?? [];
        $items = $output['items'] ?? [];

        return match ($toolName) {
            'finance.dashboard_summary' => $this->insightLiquidity($metrics),
            'finance.revenue_summary' => $this->insightRevenue($metrics, $items),
            'finance.expense_realization' => $this->insightExpense($metrics, $items),
            'finance.cashflow_summary' => $this->insightCashflow($metrics),
            'hr.employee_summary' => $this->insightHr($metrics),
            'procurement.request_summary' => $this->insightProcurement($metrics),
            'supply_chain.stock_critical' => $this->insightStock($metrics, $items),
            'approval.my_pending_approvals' => $this->insightApprovals($metrics, $items, $userQuestion),
            'report.executive_summary' => $this->insightExecutive($items),
            default => '',
        };
    }

    /** @param  list<array<string, mixed>>  $metrics */
    private function insightLiquidity(array $metrics): string
    {
        foreach ($metrics as $m) {
            if (($m['label'] ?? '') === 'Rasio Likuiditas' && is_numeric(str_replace(',', '.', (string) ($m['value'] ?? '')))) {
                $val = (float) str_replace(',', '.', (string) $m['value']);
                if ($val >= 2) {
                    return 'Posisi likuiditas relatif sehat; pantau piutang agar arus kas tetap stabil.';
                }

                return 'Rasio likuiditas perlu perhatian; prioritaskan penagihan piutang dan kontrol hutang.';
            }
        }

        return 'Pantau pergerakan kas, piutang, dan hutang secara berkala untuk menjaga keseimbangan keuangan.';
    }

    /** @param  list<array<string, mixed>>  $metrics  @param  list<array<string, mixed>>  $items */
    private function insightRevenue(array $metrics, array $items): string
    {
        if (! empty($items)) {
            $top = $items[0];
            foreach ($items as $item) {
                $share = (int) str_replace('%', '', (string) ($item['share'] ?? '0'));
                if ($share > (int) str_replace('%', '', (string) ($top['share'] ?? '0'))) {
                    $top = $item;
                }
            }

            return "Kontributor terbesar saat ini adalah {$top['unit']} ({$top['share']}); fokuskan monitoring kapasitas layanan di segmen ini.";
        }

        return 'Bandingkan pertumbuhan bulan berjalan dengan YTD untuk melihat apakah tren pendapatan konsisten.';
    }

    /** @param  list<array<string, mixed>>  $metrics  @param  list<array<string, mixed>>  $items */
    private function insightExpense(array $metrics, array $items): string
    {
        $lowest = null;
        foreach ($items as $item) {
            $pct = (float) str_replace('%', '', (string) ($item['pct'] ?? '0'));
            if ($lowest === null || $pct < $lowest['pct']) {
                $lowest = ['coa' => $item['coa'], 'pct' => $pct];
            }
        }

        if ($lowest) {
            return "Realisasi terendah pada {$lowest['coa']} ({$lowest['pct']} pagu); evaluasi apakah ada penundaan belanja atau efisiensi.";
        }

        return 'Pastikan realisasi belanja tetap selaras dengan rencana anggaran triwulan.';
    }

    /** @param  list<array<string, mixed>>  $metrics */
    private function insightCashflow(array $metrics): string
    {
        return 'Net cashflow positif menunjukkan penerimaan kas lebih besar dari pengeluaran; pertahankan disiplin penagihan dan kontrol belanja.';
    }

    /** @param  list<array<string, mixed>>  $metrics */
    private function insightHr(array $metrics): string
    {
        foreach ($metrics as $m) {
            if (str_contains((string) ($m['label'] ?? ''), 'Kontrak Berakhir')) {
                $count = (int) ($m['value'] ?? 0);
                if ($count > 0) {
                    return "{$count} kontrak berakhir dalam 30 hari — koordinasikan perpanjangan atau penggantian segera.";
                }
            }
        }

        return 'Pantau cuti pending agar operasional unit tidak terganggu.';
    }

    /** @param  list<array<string, mixed>>  $metrics */
    private function insightProcurement(array $metrics): string
    {
        foreach ($metrics as $m) {
            if (str_contains((string) ($m['label'] ?? ''), 'Menunggu Approval')) {
                $pending = (int) ($m['value'] ?? 0);
                if ($pending >= 10) {
                    return "{$pending} PR menunggu approval — pertimbangkan eskalasi agar pengadaan tidak tertunda.";
                }
            }
        }

        return 'Prioritaskan PR yang mendukung layanan klinis dan operasional kritis.';
    }

    /** @param  list<array<string, mixed>>  $metrics  @param  list<array<string, mixed>>  $items */
    private function insightStock(array $metrics, array $items): string
    {
        $count = count($items);
        if ($count > 0) {
            return "{$count} item di bawah stok minimum — segera koordinasikan replenishment dengan farmasi/gudang.";
        }

        return 'Tidak ada item kritis terdeteksi saat ini.';
    }

    /** @param  list<array<string, mixed>>  $metrics  @param  list<array<string, mixed>>  $items */
    private function insightApprovals(array $metrics, array $items, string $userQuestion): string
    {
        $total = (int) ($metrics[0]['value'] ?? count($items));
        if ($total === 0) {
            return 'Tidak ada approval yang menunggu tindakan Anda saat ini.';
        }

        if (preg_match('/\b(urgent|prioritas|penting)\b/i', $userQuestion) && ! empty($items)) {
            return "Anda memiliki {$total} approval pending; mulai dari {$items[0]['doc']} ({$items[0]['type']}) karena paling atas daftar.";
        }

        return "Anda memiliki {$total} approval yang menunggu — tinjau melalui modul Workflow untuk detail lengkap.";
    }

    /** @param  list<array<string, mixed>>  $items */
    private function insightExecutive(array $items): string
    {
        $attention = array_filter($items, fn ($i) => ($i['status'] ?? '') === 'Perhatian');
        if (! empty($attention)) {
            $areas = implode(', ', array_column($attention, 'area'));

            return "Area yang perlu perhatian: {$areas}. Rekomendasikan review lintas fungsi minggu ini.";
        }

        return 'Kondisi operasional secara umum stabil; lanjutkan monitoring KPI utama.';
    }

    /** @param  array<string, mixed>  $data */
    private function formatGenericData(array $data, string $userQuestion): string
    {
        if (isset($data['summary']) || isset($data['metrics'])) {
            return $this->formatToolInsight('generic', $data, $userQuestion);
        }

        $lines = ['**Ringkasan data:**'];
        foreach ($data as $key => $value) {
            if (is_scalar($value)) {
                $lines[] = "- **{$key}:** {$value}";
            }
        }

        return implode("\n", $lines);
    }

    private function looksLikeJson(string $text): bool
    {
        if (! str_starts_with($text, '{') && ! str_starts_with($text, '[')) {
            return false;
        }

        json_decode($text);

        return json_last_error() === JSON_ERROR_NONE;
    }
}
