<?php

namespace App\Modules\Finance\Services;

use App\Support\RsudConnections;
use Illuminate\Support\Facades\DB;

class CashBankDashboardService
{
    private const BULAN_LABELS = [
        1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'Mei', 6 => 'Jun',
        7 => 'Jul', 8 => 'Agu', 9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des',
    ];

    /**
     * @param  array{tahun: int, bulan?: int|null}  $filters
     */
    public function index(array $filters): array
    {
        $tahun = (int) $filters['tahun'];
        $bulan = isset($filters['bulan']) && $filters['bulan'] !== null ? (int) $filters['bulan'] : null;
        $bkuPrefix = 'BKU-'.substr((string) $tahun, -2);

        $bkuQuery = DB::connection(RsudConnections::SIMARTDB)
            ->table('BKUH as h')
            ->where('h.cnobku', 'like', $bkuPrefix.'%')
            ->where(function ($q) {
                $q->whereNull('h.lbatal')->orWhere('h.lbatal', '<>', 1);
            });

        if ($bulan) {
            $bkuQuery->whereRaw('MONTH(h.dtgtrans) = ?', [$bulan]);
        }

        $totals = (clone $bkuQuery)->selectRaw('
            COUNT(*) as jumlah,
            SUM(CAST(h.nterima AS float)) as total_masuk,
            SUM(CAST(h.nkeluar AS float)) as total_keluar
        ')->first();

        $postedAcc = (clone $bkuQuery)
            ->whereNotNull('h.cnojurnal')
            ->whereRaw("RTRIM(h.cnojurnal) <> ''")
            ->count();

        $jumlah = (int) ($totals->jumlah ?? 0);
        $totalMasuk = round((float) ($totals->total_masuk ?? 0), 2);
        $totalKeluar = round((float) ($totals->total_keluar ?? 0), 2);
        $saldoNetto = round($totalMasuk - $totalKeluar, 2);

        $accStats = $this->accJournalStats($tahun, $bulan);
        $rekonPct = $jumlah > 0 ? round(($postedAcc / $jumlah) * 100, 1) : 0;

        return [
            'sources' => [
                'operational' => 'SIMARTDB.BKUH',
                'accounting' => 'ACC2026.JURNAL_H',
            ],
            'filters' => [
                'tahun' => $tahun,
                'bulan' => $bulan,
            ],
            'kpis' => [
                'total_masuk' => $totalMasuk,
                'total_keluar' => $totalKeluar,
                'saldo_netto' => $saldoNetto,
                'jumlah_transaksi' => $jumlah,
                'posted_ke_acc' => $postedAcc,
                'belum_posting_acc' => max(0, $jumlah - $postedAcc),
                'rekon_acc_pct' => $rekonPct,
                'acc_jurnal_count' => $accStats['count'],
                'acc_jurnal_total' => $accStats['total'],
            ],
            'trend' => $this->monthlyTrend($tahun),
            'masuk_composition' => $this->masukComposition($bkuPrefix, $bulan),
            'keluar_composition' => $this->keluarComposition($bkuPrefix, $bulan),
            'accounts' => $this->accountSummary($bkuPrefix, $bulan),
            'recent_transactions' => $this->recentTransactions($bkuPrefix, $bulan),
        ];
    }

    /**
     * @return array{count: int, total: float}
     */
    private function accJournalStats(int $tahun, ?int $bulan): array
    {
        $query = DB::connection(RsudConnections::ACC2026)
            ->table('JURNAL_H')
            ->whereYear('dtgljurnal', $tahun)
            ->whereIn('ckeljurnal', ['BKM', 'BBM', 'BBK', 'BKK'])
            ->where(function ($q) {
                $q->whereNull('lbatal')->orWhere('lbatal', '<>', 1);
            });

        if ($bulan) {
            $query->whereRaw('MONTH(dtgljurnal) = ?', [$bulan]);
        }

        $row = $query->selectRaw('COUNT(*) as cnt, SUM(CAST(ndebet AS float)) as total')->first();

        return [
            'count' => (int) ($row->cnt ?? 0),
            'total' => round((float) ($row->total ?? 0), 2),
        ];
    }

    /**
     * @return list<array{month: string, bulan: int, masuk: float, keluar: float, saldo: float}>
     */
    private function monthlyTrend(int $tahun): array
    {
        $prefix = 'BKU-'.substr((string) $tahun, -2);
        $rows = DB::connection(RsudConnections::SIMARTDB)->select("
            SELECT MONTH(h.dtgtrans) as bulan,
                   SUM(CAST(h.nterima AS float)) as masuk,
                   SUM(CAST(h.nkeluar AS float)) as keluar
            FROM BKUH h
            WHERE h.cnobku LIKE ?
              AND YEAR(h.dtgtrans) = ?
              AND (h.lbatal IS NULL OR h.lbatal <> 1)
            GROUP BY MONTH(h.dtgtrans)
            ORDER BY bulan
        ", [$prefix.'%', $tahun]);

        $byMonth = collect($rows)->keyBy('bulan');
        $running = 0.0;
        $trend = [];

        for ($m = 1; $m <= 12; $m++) {
            $row = $byMonth->get($m);
            $masuk = round((float) ($row->masuk ?? 0), 2);
            $keluar = round((float) ($row->keluar ?? 0), 2);
            $running += $masuk - $keluar;

            $trend[] = [
                'month' => self::BULAN_LABELS[$m] ?? (string) $m,
                'bulan' => $m,
                'masuk' => $masuk,
                'keluar' => $keluar,
                'saldo' => round($running, 2),
            ];
        }

        return $trend;
    }

    /**
     * @return list<array{label: string, amount: float, pct: float}>
     */
    private function masukComposition(string $bkuPrefix, ?int $bulan): array
    {
        $bindings = [$bkuPrefix.'%'];
        $bulanSql = '';
        if ($bulan) {
            $bulanSql = ' AND MONTH(h.dtgtrans) = ?';
            $bindings[] = $bulan;
        }

        $rows = DB::connection(RsudConnections::SIMARTDB)->select("
            SELECT
                CASE
                    WHEN h.cket LIKE '%PPN%' OR h.cket LIKE '%PPH%' THEN 'Pajak (PPN/PPH)'
                    WHEN h.nterima > 0 AND h.nkeluar = 0 THEN 'Penerimaan Langsung'
                    ELSE 'Lainnya'
                END as label,
                SUM(CAST(h.nterima AS float)) as amount
            FROM BKUH h
            WHERE h.cnobku LIKE ?
              AND (h.lbatal IS NULL OR h.lbatal <> 1)
              AND h.nterima > 0
              {$bulanSql}
            GROUP BY CASE
                WHEN h.cket LIKE '%PPN%' OR h.cket LIKE '%PPH%' THEN 'Pajak (PPN/PPH)'
                WHEN h.nterima > 0 AND h.nkeluar = 0 THEN 'Penerimaan Langsung'
                ELSE 'Lainnya'
            END
        ", $bindings);

        $total = array_sum(array_map(fn ($r) => (float) $r->amount, $rows));

        return array_map(function ($row) use ($total) {
            $amount = round((float) $row->amount, 2);

            return [
                'label' => $row->label,
                'amount' => $amount,
                'pct' => $total > 0 ? round(($amount / $total) * 100, 1) : 0,
            ];
        }, $rows);
    }

    /**
     * @return list<array{label: string, amount: float}>
     */
    private function keluarComposition(string $bkuPrefix, ?int $bulan): array
    {
        if ($bulan) {
            $rows = DB::connection(RsudConnections::SIMARTDB)->select("
                SELECT TOP 6
                    COALESCE(NULLIF(RTRIM(d.CNMKELBLJ), ''), NULLIF(RTRIM(d.cnmrekening), ''), 'Lainnya') as label,
                    SUM(CAST(d.nkeluar AS float)) as amount
                FROM BKUD d
                INNER JOIN BKUH h ON h.cnobku = d.cnobku
                WHERE d.cnobku LIKE ?
                  AND MONTH(h.dtgtrans) = ?
                  AND (d.lbatal IS NULL OR d.lbatal <> 1)
                  AND (h.lbatal IS NULL OR h.lbatal <> 1)
                  AND d.nkeluar > 0
                GROUP BY COALESCE(NULLIF(RTRIM(d.CNMKELBLJ), ''), NULLIF(RTRIM(d.cnmrekening), ''), 'Lainnya')
                ORDER BY amount DESC
            ", [$bkuPrefix.'%', $bulan]);
        } else {
            $rows = DB::connection(RsudConnections::SIMARTDB)->select("
                SELECT TOP 6
                    COALESCE(NULLIF(RTRIM(d.CNMKELBLJ), ''), NULLIF(RTRIM(d.cnmrekening), ''), 'Lainnya') as label,
                    SUM(CAST(d.nkeluar AS float)) as amount
                FROM BKUD d
                WHERE d.cnobku LIKE ?
                  AND (d.lbatal IS NULL OR d.lbatal <> 1)
                  AND d.nkeluar > 0
                GROUP BY COALESCE(NULLIF(RTRIM(d.CNMKELBLJ), ''), NULLIF(RTRIM(d.cnmrekening), ''), 'Lainnya')
                ORDER BY amount DESC
            ", [$bkuPrefix.'%']);
        }

        return array_map(fn ($row) => [
            'label' => trim((string) $row->label),
            'amount' => round((float) $row->amount, 2),
        ], $rows);
    }

    /**
     * @return list<array{account_no: string, account_name: string, masuk: float, keluar: float, saldo: float}>
     */
    private function accountSummary(string $bkuPrefix, ?int $bulan): array
    {
        $rows = DB::connection(RsudConnections::SIMARTDB)->select("
            SELECT
                RTRIM(d.cno_acc) as account_no,
                RTRIM(d.cnm_acc) as account_name,
                SUM(CAST(d.nterima AS float)) as masuk,
                SUM(CAST(d.nkeluar AS float)) as keluar
            FROM BKUD d
            WHERE d.cnobku LIKE ?
              AND (d.lbatal IS NULL OR d.lbatal <> 1)
              AND d.cno_acc IS NOT NULL AND RTRIM(d.cno_acc) <> ''
            GROUP BY RTRIM(d.cno_acc), RTRIM(d.cnm_acc)
            ORDER BY keluar DESC
        ", [$bkuPrefix.'%']);

        return array_map(fn ($row) => [
            'account_no' => trim((string) $row->account_no),
            'account_name' => trim((string) $row->account_name),
            'masuk' => round((float) $row->masuk, 2),
            'keluar' => round((float) $row->keluar, 2),
            'saldo' => round((float) $row->masuk - (float) $row->keluar, 2),
        ], $rows);
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function recentTransactions(string $bkuPrefix, ?int $bulan): array
    {
        $query = DB::connection(RsudConnections::SIMARTDB)
            ->table('BKUH as h')
            ->where('h.cnobku', 'like', $bkuPrefix.'%')
            ->where(function ($q) {
                $q->whereNull('h.lbatal')->orWhere('h.lbatal', '<>', 1);
            })
            ->orderByDesc('h.dtgtrans')
            ->orderByDesc('h.cnobku')
            ->limit(15);

        if ($bulan) {
            $query->whereRaw('MONTH(h.dtgtrans) = ?', [$bulan]);
        }

        return $query->get([
            'h.cnobku',
            'h.cnojurnal',
            'h.dtgtrans',
            'h.cket',
            'h.nterima',
            'h.nkeluar',
            'h.CKDNOBYR',
        ])->map(function ($row) {
            $terima = round((float) ($row->nterima ?? 0), 2);
            $keluar = round((float) ($row->nkeluar ?? 0), 2);

            return [
                'no_bku' => trim((string) $row->cnobku),
                'no_jurnal' => trim((string) ($row->cnojurnal ?? '')),
                'tanggal' => $row->dtgtrans ? date('Y-m-d', strtotime((string) $row->dtgtrans)) : null,
                'keterangan' => trim((string) ($row->cket ?? '')),
                'flow_type' => $terima > 0 ? 'masuk' : 'keluar',
                'amount' => $terima > 0 ? $terima : $keluar,
                'no_bayar' => trim((string) ($row->CKDNOBYR ?? '')),
                'posted_acc' => trim((string) ($row->cnojurnal ?? '')) !== '',
            ];
        })->all();
    }
}
