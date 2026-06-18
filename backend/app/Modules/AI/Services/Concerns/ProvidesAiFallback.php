<?php

namespace App\Modules\AI\Services\Concerns;

use App\Models\User;
use App\Modules\AI\Services\AiToolRegistry;

trait ProvidesAiFallback
{
    /** @return array{content: string, tool_calls: list<array{name: string, input: array, output: array}>} */
    protected function fallbackResponse(User $user, string $userMessage, array $existing = []): array
    {
        $toolCalls = $existing;
        $toolName = $this->inferToolFromMessage($userMessage, $user);

        if ($toolName && empty($toolCalls)) {
            $output = $this->tools->execute($user, $toolName);
            $toolCalls[] = ['name' => $toolName, 'input' => [], 'output' => $output];
        }

        if (empty($toolCalls)) {
            return [
                'content' => 'Halo! Saya SQ+ AI Assistant. Saya dapat membantu ringkasan keuangan, SDM, pengadaan, stok, approval, dan laporan eksekutif. Silakan ajukan pertanyaan Anda.',
                'tool_calls' => [],
            ];
        }

        return [
            'content' => $this->formatFallback($toolCalls),
            'tool_calls' => $toolCalls,
        ];
    }

    protected function inferToolFromMessage(string $message, User $user): ?string
    {
        $map = [
            'finance.dashboard_summary' => '/dashboard|keuangan|saldo|kas/i',
            'finance.revenue_summary' => '/pendapatan|revenue|omzet/i',
            'finance.expense_realization' => '/realisasi|belanja|pagu|anggaran/i',
            'finance.cashflow_summary' => '/cashflow|arus\s+kas/i',
            'hr.employee_summary' => '/karyawan|sdm|pegawai|headcount/i',
            'procurement.request_summary' => '/purchase\s+request|\bpr\b|pengadaan/i',
            'supply_chain.stock_critical' => '/stok\s+kritis|minimum\s+stok|inventori/i',
            'approval.my_pending_approvals' => '/approval|pending|persetujuan/i',
            'report.executive_summary' => '/eksekutif|executive|kpi\s+lintas/i',
        ];

        foreach ($map as $tool => $pattern) {
            if (preg_match($pattern, $message)) {
                $defs = $this->tools->openAiToolDefinitions($user);
                $names = array_map(fn ($t) => $t['function']['name'], $defs);
                if (in_array($tool, $names, true)) {
                    return $tool;
                }
            }
        }

        return null;
    }

    /** @param  list<array{name: string, output: array}>  $toolCalls */
    protected function formatFallback(array $toolCalls): string
    {
        $parts = ['Berikut ringkasan berdasarkan data SQ+:'];
        foreach ($toolCalls as $tc) {
            $output = $tc['output'];
            if (isset($output['error'])) {
                $parts[] = $output['message'];

                continue;
            }
            $parts[] = ($output['summary'] ?? $tc['name']);
            if (! empty($output['metrics'])) {
                foreach ($output['metrics'] as $m) {
                    $parts[] = "- {$m['label']}: {$m['value']}";
                }
            }
        }

        return implode("\n", $parts);
    }
}
