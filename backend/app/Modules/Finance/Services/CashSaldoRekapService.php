<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\BudgetYear;
use App\Support\RsudConnections;
use Illuminate\Support\Facades\DB;

class CashSaldoRekapService
{
    private const BULAN_LABELS = [
        1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
        7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
    ];

    private const BULAN_SHORT = [
        1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'Mei', 6 => 'Jun',
        7 => 'Jul', 8 => 'Agu', 9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des',
    ];

    public function meta(?int $budgetYearId = null): array
    {
        $tahun = null;
        if ($budgetYearId) {
            $year = BudgetYear::query()->find($budgetYearId);
            $tahun = $year ? (int) $year->tahun : null;
        }

        return [
            'bulan_options' => collect(self::BULAN_LABELS)
                ->map(fn (string $label, int $value) => ['value' => $value, 'label' => $label])
                ->values()
                ->all(),
            'kas_account_options' => $this->kasAccountOptions(),
            'tahun' => $tahun,
        ];
    }

    /**
     * @param  array{tahun: int, bulan?: int|null, kas_account_no?: string|null}  $filters
     */
    public function posisiSaldo(array $filters): array
    {
        $tahun = (int) $filters['tahun'];
        $bulan = isset($filters['bulan']) ? (int) $filters['bulan'] : null;
        $accountFilter = isset($filters['kas_account_no']) ? trim((string) $filters['kas_account_no']) : null;
        $prefix = $this->bkuPrefix($tahun);

        $accounts = $this->kasAccountOptions();
        if ($accountFilter) {
            $accounts = array_values(array_filter($accounts, fn ($a) => $a['value'] === $accountFilter));
        }

        $rows = [];
        $totalSaldoAwal = 0.0;
        $totalMasuk = 0.0;
        $totalKeluar = 0.0;
        $totalSaldoAkhir = 0.0;

        foreach ($accounts as $account) {
            $accNo = $account['value'];
            $saldoAwal = $this->saldoAkunSebelumPeriode($prefix, $accNo, $tahun, $bulan);
            $mutasi = $this->mutasiAkunPeriode($prefix, $accNo, $tahun, $bulan);
            $saldoAkhir = round($saldoAwal + $mutasi['masuk'] - $mutasi['keluar'], 2);

            $rows[] = [
                'account_no' => $accNo,
                'account_name' => $account['label'],
                'account_type' => $account['account_type'],
                'saldo_awal' => round($saldoAwal, 2),
                'masuk' => $mutasi['masuk'],
                'keluar' => $mutasi['keluar'],
                'saldo_akhir' => $saldoAkhir,
            ];

            $totalSaldoAwal += $saldoAwal;
            $totalMasuk += $mutasi['masuk'];
            $totalKeluar += $mutasi['keluar'];
            $totalSaldoAkhir += $saldoAkhir;
        }

        return [
            'rows' => $rows,
            'summary' => [
                'tahun' => $tahun,
                'bulan' => $bulan,
                'bulan_label' => $bulan ? (self::BULAN_LABELS[$bulan] ?? '') : 'Tahun penuh',
                'saldo_awal' => round($totalSaldoAwal, 2),
                'total_masuk' => round($totalMasuk, 2),
                'total_keluar' => round($totalKeluar, 2),
                'saldo_akhir' => round($totalSaldoAkhir, 2),
                'jumlah_rekening' => count($rows),
            ],
        ];
    }

    /**
     * @param  array{tahun: int}  $filters
     */
    public function rekapBulanan(array $filters): array
    {
        $tahun = (int) $filters['tahun'];
        $prefix = $this->bkuPrefix($tahun);

        $monthly = DB::connection(RsudConnections::SIMARTDB)->select("
            SELECT MONTH(h.dtgtrans) as bulan,
                   SUM(CAST(h.nterima AS float)) as masuk,
                   SUM(CAST(h.nkeluar AS float)) as keluar,
                   COUNT(*) as jumlah
            FROM BKUH h
            WHERE h.cnobku LIKE ?
              AND YEAR(h.dtgtrans) = ?
              AND (h.lbatal IS NULL OR h.lbatal <> 1)
            GROUP BY MONTH(h.dtgtrans)
            ORDER BY bulan
        ", [$prefix.'%', $tahun]);

        $byMonth = collect($monthly)->keyBy('bulan');
        $saldoAwalTahun = 0.0;
        $rows = [];

        for ($m = 1; $m <= 12; $m++) {
            $row = $byMonth->get($m);
            $masuk = round((float) ($row->masuk ?? 0), 2);
            $keluar = round((float) ($row->keluar ?? 0), 2);
            $neto = round($masuk - $keluar, 2);
            $saldoAwal = round($saldoAwalTahun, 2);
            $saldoAkhir = round($saldoAwal + $neto, 2);

            $rows[] = [
                'bulan' => $m,
                'bulan_label' => self::BULAN_LABELS[$m],
                'bulan_short' => self::BULAN_SHORT[$m],
                'saldo_awal' => $saldoAwal,
                'masuk' => $masuk,
                'keluar' => $keluar,
                'neto' => $neto,
                'saldo_akhir' => $saldoAkhir,
                'jumlah_transaksi' => (int) ($row->jumlah ?? 0),
            ];

            $saldoAwalTahun = $saldoAkhir;
        }

        $totalMasuk = array_sum(array_column($rows, 'masuk'));
        $totalKeluar = array_sum(array_column($rows, 'keluar'));

        return [
            'rows' => $rows,
            'summary' => [
                'tahun' => $tahun,
                'total_masuk' => round($totalMasuk, 2),
                'total_keluar' => round($totalKeluar, 2),
                'saldo_akhir_tahun' => round($saldoAwalTahun, 2),
            ],
        ];
    }

    /**
     * @param  array{
     *   tahun: int,
     *   bulan?: int|null,
     *   kas_account_no?: string|null,
     *   search?: string|null,
     *   page?: int,
     *   per_page?: int
     * }  $filters
     */
    public function bukuKasBesar(array $filters): array
    {
        $tahun = (int) $filters['tahun'];
        $bulan = isset($filters['bulan']) ? (int) $filters['bulan'] : null;
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(10, (int) ($filters['per_page'] ?? 20)));
        $search = trim((string) ($filters['search'] ?? ''));
        $accountNo = isset($filters['kas_account_no']) ? trim((string) $filters['kas_account_no']) : null;
        $prefix = $this->bkuPrefix($tahun);

        $allRows = $this->fetchBkuLedgerRows($prefix, $tahun, $bulan, $search, $accountNo);
        $saldoAwal = $this->saldoBkuSebelumPeriode($prefix, $tahun, $bulan, $search, $accountNo);

        $running = $saldoAwal;
        $ledger = [];

        foreach ($allRows as $row) {
            $masuk = (float) $row['masuk'];
            $keluar = (float) $row['keluar'];
            $running = round($running + $masuk - $keluar, 2);

            $ledger[] = [
                ...$row,
                'saldo' => $running,
            ];
        }

        $total = count($ledger);
        $offset = ($page - 1) * $perPage;
        $pageRows = array_slice($ledger, $offset, $perPage);

        if ($pageRows !== [] && $offset > 0) {
            $saldoBeforePage = $ledger[$offset - 1]['saldo'] ?? $saldoAwal;
        } else {
            $saldoBeforePage = $saldoAwal;
        }

        return [
            'rows' => $pageRows,
            'summary' => [
                'tahun' => $tahun,
                'bulan' => $bulan,
                'saldo_awal' => round($saldoAwal, 2),
                'saldo_sebelum_halaman' => round($saldoBeforePage, 2),
                'saldo_akhir' => $total > 0 ? $ledger[$total - 1]['saldo'] : round($saldoAwal, 2),
                'total_masuk' => round(array_sum(array_column($ledger, 'masuk')), 2),
                'total_keluar' => round(array_sum(array_column($ledger, 'keluar')), 2),
                'jumlah_baris' => $total,
            ],
            'meta' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => max(1, (int) ceil($total / $perPage)),
            ],
        ];
    }

    /**
     * @param  array{tahun: int}  $filters
     */
    public function proyeksiCashflow(array $filters): array
    {
        $tahun = (int) $filters['tahun'];
        $prefix = $this->bkuPrefix($tahun);
        $currentMonth = (int) date('n');
        $currentYear = (int) date('Y');

        $rekap = $this->rekapBulanan(['tahun' => $tahun]);
        $completedMonths = $tahun < $currentYear ? 12 : ($tahun === $currentYear ? $currentMonth : 0);

        $actualMasuk = 0.0;
        $actualKeluar = 0.0;
        $monthsWithData = 0;

        foreach ($rekap['rows'] as $row) {
            if ($completedMonths > 0 && $row['bulan'] <= $completedMonths) {
                $actualMasuk += $row['masuk'];
                $actualKeluar += $row['keluar'];
                if ($row['jumlah_transaksi'] > 0) {
                    $monthsWithData++;
                }
            }
        }

        $avgMasuk = $monthsWithData > 0 ? $actualMasuk / $monthsWithData : 0;
        $avgKeluar = $monthsWithData > 0 ? $actualKeluar / $monthsWithData : 0;
        $remainingMonths = max(0, 12 - $completedMonths);

        $pending = DB::connection(RsudConnections::SIMARTDB)
            ->table('BKUH')
            ->where('cnobku', 'like', $prefix.'%')
            ->where(function ($q) {
                $q->whereNull('lbatal')->orWhere('lbatal', '<>', 1);
            })
            ->where(function ($q) {
                $q->whereNull('cnojurnal')->orWhereRaw("RTRIM(cnojurnal) = ''");
            })
            ->selectRaw('COUNT(*) as cnt, SUM(CAST(nkeluar AS float)) as keluar, SUM(CAST(nterima AS float)) as masuk')
            ->first();

        $pendingKeluar = round((float) ($pending->keluar ?? 0), 2);
        $pendingMasuk = round((float) ($pending->masuk ?? 0), 2);

        if ($tahun < $currentYear) {
            $saldoSaatIni = (float) $rekap['summary']['saldo_akhir_tahun'];
        } elseif ($tahun === $currentYear) {
            $saldoSaatIni = 0.0;
            foreach ($rekap['rows'] as $row) {
                if ($row['bulan'] <= $currentMonth) {
                    $saldoSaatIni = (float) $row['saldo_akhir'];
                }
            }
        } else {
            $saldoSaatIni = 0.0;
        }

        $proyeksiMasuk = round($avgMasuk * $remainingMonths, 2);
        $proyeksiKeluar = round($avgKeluar * $remainingMonths + $pendingKeluar, 2);
        $saldoProyeksi = round($saldoSaatIni + $proyeksiMasuk - $proyeksiKeluar, 2);

        $scenarios = [];
        $runningSaldo = $saldoSaatIni;
        for ($m = $completedMonths + 1; $m <= 12; $m++) {
            $runningSaldo = round($runningSaldo + $avgMasuk - $avgKeluar, 2);
            $scenarios[] = [
                'bulan' => $m,
                'bulan_label' => self::BULAN_SHORT[$m],
                'estimasi_masuk' => round($avgMasuk, 2),
                'estimasi_keluar' => round($avgKeluar, 2),
                'saldo_proyeksi' => $runningSaldo,
            ];
        }

        return [
            'assumptions' => [
                'bulan_berjalan' => $completedMonths,
                'bulan_sisa' => $remainingMonths,
                'rata_masuk_bulan' => round($avgMasuk, 2),
                'rata_keluar_bulan' => round($avgKeluar, 2),
                'pending_bku_belum_acc' => (int) ($pending->cnt ?? 0),
            ],
            'summary' => [
                'saldo_saat_ini' => round($saldoSaatIni, 2),
                'estimasi_masuk_sisa' => $proyeksiMasuk,
                'estimasi_keluar_sisa' => $proyeksiKeluar,
                'pending_keluar' => $pendingKeluar,
                'pending_masuk' => $pendingMasuk,
                'saldo_proyeksi_akhir' => $saldoProyeksi,
            ],
            'scenarios' => $scenarios,
            'actual_ytd' => [
                'masuk' => round($actualMasuk, 2),
                'keluar' => round($actualKeluar, 2),
            ],
        ];
    }

    private function bkuPrefix(int $tahun): string
    {
        return 'BKU-'.substr((string) $tahun, -2);
    }

    /**
     * @return list<array{value: string, label: string, account_type: string}>
     */
    private function kasAccountOptions(): array
    {
        $options = [];

        try {
            $rows = DB::connection(RsudConnections::SIMARTDB)
                ->table('master_kas_bayar')
                ->orderBy('cno_acc')
                ->get(['cno_acc', 'cnm_acc']);

            foreach ($rows as $row) {
                $no = trim((string) $row->cno_acc);
                if ($no === '') {
                    continue;
                }
                $name = trim((string) $row->cnm_acc);
                $options[] = [
                    'value' => $no,
                    'label' => $name,
                    'account_type' => str_contains(strtolower($name), 'bank') ? 'bank' : 'kas',
                ];
            }
        } catch (\Throwable) {
            // fallback empty
        }

        return $options;
    }

    private function saldoAkunSebelumPeriode(string $prefix, string $accountNo, int $tahun, ?int $bulan): float
    {
        $bindings = [$prefix.'%', $accountNo, $tahun];
        $bulanSql = '';

        if ($bulan && $bulan > 1) {
            $bulanSql = ' AND (MONTH(h.dtgtrans) < ? OR h.dtgtrans IS NULL)';
            $bindings[] = $bulan;
        } elseif ($bulan === 1) {
            return 0.0;
        }

        $row = DB::connection(RsudConnections::SIMARTDB)->selectOne("
            SELECT
                SUM(CAST(d.nterima AS float)) as masuk,
                SUM(CAST(d.nkeluar AS float)) as keluar
            FROM BKUD d
            INNER JOIN BKUH h ON h.cnobku = d.cnobku
            WHERE d.cnobku LIKE ?
              AND RTRIM(d.cno_acc) = ?
              AND YEAR(h.dtgtrans) = ?
              AND (d.lbatal IS NULL OR d.lbatal <> 1)
              AND (h.lbatal IS NULL OR h.lbatal <> 1)
              {$bulanSql}
        ", $bindings);

        return round((float) ($row->masuk ?? 0) - (float) ($row->keluar ?? 0), 2);
    }

    /**
     * @return array{masuk: float, keluar: float}
     */
    private function mutasiAkunPeriode(string $prefix, string $accountNo, int $tahun, ?int $bulan): array
    {
        $bindings = [$prefix.'%', $accountNo, $tahun];
        $bulanSql = '';

        if ($bulan) {
            $bulanSql = ' AND MONTH(h.dtgtrans) = ?';
            $bindings[] = $bulan;
        }

        $row = DB::connection(RsudConnections::SIMARTDB)->selectOne("
            SELECT
                SUM(CAST(d.nterima AS float)) as masuk,
                SUM(CAST(d.nkeluar AS float)) as keluar
            FROM BKUD d
            INNER JOIN BKUH h ON h.cnobku = d.cnobku
            WHERE d.cnobku LIKE ?
              AND RTRIM(d.cno_acc) = ?
              AND YEAR(h.dtgtrans) = ?
              AND (d.lbatal IS NULL OR d.lbatal <> 1)
              AND (h.lbatal IS NULL OR h.lbatal <> 1)
              {$bulanSql}
        ", $bindings);

        return [
            'masuk' => round((float) ($row->masuk ?? 0), 2),
            'keluar' => round((float) ($row->keluar ?? 0), 2),
        ];
    }

    private function saldoBkuSebelumPeriode(
        string $prefix,
        int $tahun,
        ?int $bulan,
        string $search,
        ?string $accountNo
    ): float {
        $rows = $this->fetchBkuLedgerRows($prefix, $tahun, null, $search, $accountNo, $bulan ? $bulan - 1 : null);

        $saldo = 0.0;
        foreach ($rows as $row) {
            $saldo += (float) $row['masuk'] - (float) $row['keluar'];
        }

        return round($saldo, 2);
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function fetchBkuLedgerRows(
        string $prefix,
        int $tahun,
        ?int $bulanOnly,
        string $search,
        ?string $accountNo,
        ?int $bulanUntil = null
    ): array {
        $query = DB::connection(RsudConnections::SIMARTDB)
            ->table('BKUH as h')
            ->where('h.cnobku', 'like', $prefix.'%')
            ->where(function ($q) {
                $q->whereNull('h.lbatal')->orWhere('h.lbatal', '<>', 1);
            })
            ->whereNotNull('h.dtgtrans');

        if ($bulanOnly) {
            $query->whereRaw('MONTH(h.dtgtrans) = ?', [$bulanOnly]);
        } elseif ($bulanUntil !== null && $bulanUntil > 0) {
            $query->whereRaw('MONTH(h.dtgtrans) <= ?', [$bulanUntil]);
        }

        if ($search !== '') {
            $term = '%'.$search.'%';
            $query->where(function ($q) use ($term) {
                $q->where('h.cnobku', 'like', $term)
                    ->orWhere('h.cket', 'like', $term)
                    ->orWhere('h.cnojurnal', 'like', $term)
                    ->orWhere('h.CKDNOBYR', 'like', $term);
            });
        }

        if ($accountNo) {
            $query->whereExists(function ($sub) use ($accountNo) {
                $sub->selectRaw('1')
                    ->from('BKUD as d')
                    ->whereColumn('d.cnobku', 'h.cnobku')
                    ->whereRaw('RTRIM(d.cno_acc) = ?', [$accountNo])
                    ->where(function ($q) {
                        $q->whereNull('d.lbatal')->orWhere('d.lbatal', '<>', 1);
                    });
            });
        }

        return $query
            ->orderBy('h.dtgtrans')
            ->orderBy('h.cnobku')
            ->get([
                'h.cnobku',
                'h.cnojurnal',
                'h.dtgtrans',
                'h.cket',
                'h.nterima',
                'h.nkeluar',
                'h.CKDNOBYR',
            ])
            ->map(function ($row) {
                $masuk = round((float) ($row->nterima ?? 0), 2);
                $keluar = round((float) ($row->nkeluar ?? 0), 2);

                return [
                    'no_bku' => trim((string) $row->cnobku),
                    'no_jurnal' => trim((string) ($row->cnojurnal ?? '')),
                    'tanggal' => $row->dtgtrans ? date('Y-m-d', strtotime((string) $row->dtgtrans)) : null,
                    'keterangan' => trim((string) ($row->cket ?? '')),
                    'no_bayar' => trim((string) ($row->CKDNOBYR ?? '')),
                    'masuk' => $masuk,
                    'keluar' => $keluar,
                    'flow_type' => $masuk > 0 ? 'masuk' : 'keluar',
                    'posted_acc' => trim((string) ($row->cnojurnal ?? '')) !== '',
                ];
            })
            ->all();
    }
}
