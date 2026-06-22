<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\BudgetYear;
use App\Support\RsudConnections;
use Illuminate\Support\Facades\DB;

class CashBankReconciliationService
{
    private const BULAN_LABELS = [
        1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
        7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
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
            'bank_account_options' => $this->bankAccountOptions(),
            'tahun' => $tahun,
        ];
    }

    /**
     * @param  array{tahun: int, bulan?: int|null}  $filters
     */
    public function rekeningBank(array $filters): array
    {
        $tahun = (int) $filters['tahun'];
        $bulan = isset($filters['bulan']) ? (int) $filters['bulan'] : null;
        $prefix = $this->bkuPrefix($tahun);

        $accounts = $this->bankAccountOptions();
        $rows = [];
        $totalSaldoAkhir = 0.0;
        $totalMasuk = 0.0;
        $totalKeluar = 0.0;
        $activeCount = 0;

        foreach ($accounts as $account) {
            $accNo = $account['value'];
            $saldoAwal = $this->saldoBkuSebelumPeriode($prefix, $accNo, $tahun, $bulan);
            $mutasi = $this->mutasiBkuPeriode($prefix, $accNo, $tahun, $bulan);
            $saldoAkhir = round($saldoAwal + $mutasi['masuk'] - $mutasi['keluar'], 2);
            $saldoAcc = $account['acc_coa']
                ? $this->saldoAccPeriode($account['acc_coa'], $tahun, $bulan)
                : null;
            $stats = $this->bkuStats($prefix, $accNo, $tahun, $bulan);
            $isActive = $stats['jumlah'] > 0 || $account['source'] === 'simart';

            if ($isActive) {
                $activeCount++;
            }

            $rows[] = [
                'account_no' => $accNo,
                'account_name' => $account['label'],
                'bank_name' => $account['bank_name'],
                'rekening_no' => $account['rekening_no'],
                'acc_coa' => $account['acc_coa'],
                'source' => $account['source'],
                'is_active' => $isActive,
                'saldo_awal' => round($saldoAwal, 2),
                'masuk' => $mutasi['masuk'],
                'keluar' => $mutasi['keluar'],
                'saldo_akhir' => $saldoAkhir,
                'saldo_acc' => $saldoAcc,
                'selisih_saldo' => $saldoAcc !== null ? round($saldoAkhir - $saldoAcc, 2) : null,
                'jumlah_transaksi' => $stats['jumlah'],
                'posted_acc' => $stats['posted'],
                'rekon_pct' => $stats['jumlah'] > 0
                    ? round(($stats['posted'] / $stats['jumlah']) * 100, 1)
                    : 0,
            ];

            $totalSaldoAkhir += $saldoAkhir;
            $totalMasuk += $mutasi['masuk'];
            $totalKeluar += $mutasi['keluar'];
        }

        return [
            'rows' => $rows,
            'summary' => [
                'tahun' => $tahun,
                'bulan' => $bulan,
                'bulan_label' => $bulan ? (self::BULAN_LABELS[$bulan] ?? '') : 'Tahun penuh',
                'jumlah_rekening' => count($rows),
                'rekening_aktif' => $activeCount,
                'total_masuk' => round($totalMasuk, 2),
                'total_keluar' => round($totalKeluar, 2),
                'total_saldo_akhir' => round($totalSaldoAkhir, 2),
            ],
        ];
    }

    /**
     * @param  array{
     *   tahun: int,
     *   bulan?: int|null,
     *   bank_account_no?: string|null,
     *   status?: string|null,
     *   search?: string|null,
     *   page?: int,
     *   per_page?: int
     * }  $filters
     */
    public function rekonsiliasi(array $filters): array
    {
        $tahun = (int) $filters['tahun'];
        $bulan = isset($filters['bulan']) ? (int) $filters['bulan'] : null;
        $accountFilter = isset($filters['bank_account_no']) ? trim((string) $filters['bank_account_no']) : null;
        $statusFilter = isset($filters['status']) ? trim((string) $filters['status']) : null;
        $search = trim((string) ($filters['search'] ?? ''));
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(10, (int) ($filters['per_page'] ?? 20)));
        $prefix = $this->bkuPrefix($tahun);

        $accounts = $this->bankAccountOptions();
        if ($accountFilter) {
            $accounts = array_values(array_filter($accounts, fn ($a) => $a['value'] === $accountFilter));
        }

        $accountSummaries = [];
        $allRows = [];

        foreach ($accounts as $account) {
            $accNo = $account['value'];
            $saldoBku = $this->saldoBkuAkhir($prefix, $accNo, $tahun, $bulan);
            $saldoAcc = $account['acc_coa']
                ? $this->saldoAccPeriode($account['acc_coa'], $tahun, $bulan)
                : null;
            $lines = $this->fetchRekonLines($prefix, $accNo, $account, $tahun, $bulan, $search);

            $matched = 0;
            $pending = 0;
            $selisih = 0;

            foreach ($lines as &$line) {
                if ($line['status'] === 'matched') {
                    $matched++;
                } elseif ($line['status'] === 'pending') {
                    $pending++;
                } else {
                    $selisih++;
                }
            }
            unset($line);

            $accountSummaries[] = [
                'account_no' => $accNo,
                'account_name' => $account['label'],
                'bank_name' => $account['bank_name'],
                'saldo_buku' => $saldoBku,
                'saldo_acc' => $saldoAcc,
                'selisih' => $saldoAcc !== null ? round($saldoBku - $saldoAcc, 2) : null,
                'matched' => $matched,
                'pending' => $pending,
                'selisih_item' => $selisih,
            ];

            foreach ($lines as $line) {
                if ($statusFilter && $statusFilter !== 'all' && $line['status'] !== $statusFilter) {
                    continue;
                }
                $allRows[] = $line;
            }
        }

        $total = count($allRows);
        $offset = ($page - 1) * $perPage;
        $pageRows = array_slice($allRows, $offset, $perPage);

        $totalMatched = array_sum(array_column($accountSummaries, 'matched'));
        $totalPending = array_sum(array_column($accountSummaries, 'pending'));
        $totalSelisih = array_sum(array_column($accountSummaries, 'selisih_item'));

        return [
            'account_summaries' => $accountSummaries,
            'rows' => $pageRows,
            'summary' => [
                'tahun' => $tahun,
                'bulan' => $bulan,
                'bulan_label' => $bulan ? (self::BULAN_LABELS[$bulan] ?? '') : 'Tahun penuh',
                'total_matched' => $totalMatched,
                'total_pending' => $totalPending,
                'total_selisih' => $totalSelisih,
                'total_items' => $totalMatched + $totalPending + $totalSelisih,
            ],
            'meta' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => max(1, (int) ceil($total / $perPage)),
            ],
        ];
    }

    private function bkuPrefix(int $tahun): string
    {
        return 'BKU-'.substr((string) $tahun, -2);
    }

    /**
     * @return list<array{value: string, label: string, bank_name: string, rekening_no: string, acc_coa: ?string, source: string}>
     */
    private function bankAccountOptions(): array
    {
        $accounts = [];
        $seen = [];

        try {
            $simartRows = DB::connection(RsudConnections::SIMARTDB)
                ->table('master_kas_bayar')
                ->orderBy('cno_acc')
                ->get(['cno_acc', 'cnm_acc']);

            foreach ($simartRows as $row) {
                $no = trim((string) $row->cno_acc);
                $name = trim((string) $row->cnm_acc);
                if ($no === '' || ! $this->isBankAccountName($name)) {
                    continue;
                }

                $parsed = $this->parseBankMeta($name);
                $accCoa = $this->resolveAccCoa($name);

                $accounts[] = [
                    'value' => $no,
                    'label' => $name,
                    'bank_name' => $parsed['bank_name'],
                    'rekening_no' => $parsed['rekening_no'],
                    'acc_coa' => $accCoa,
                    'source' => 'simart',
                ];
                $seen[$no] = true;
            }
        } catch (\Throwable) {
            // SIMART unavailable
        }

        try {
            $tbRows = DB::connection(RsudConnections::ACC2026)
                ->table('tbbank')
                ->where(function ($q) {
                    $q->whereNull('lbatal')->orWhere('lbatal', '<>', 1);
                })
                ->whereRaw("RTRIM(cno_acc) <> ''")
                ->orderBy('cnorek')
                ->get(['cnorek', 'cnmbank1', 'cnmbank2', 'cno_acc', 'cnm_acc']);

            foreach ($tbRows as $row) {
                $no = trim((string) $row->cno_acc);
                if ($no === '' || isset($seen[$no])) {
                    continue;
                }

                $name = trim((string) ($row->cnm_acc ?: $row->cnmbank1));
                $accounts[] = [
                    'value' => $no,
                    'label' => $name,
                    'bank_name' => trim((string) $row->cnmbank1),
                    'rekening_no' => trim((string) $row->cnorek),
                    'acc_coa' => $no,
                    'source' => 'acc_tbbank',
                ];
                $seen[$no] = true;
            }

            $vkRows = DB::connection(RsudConnections::ACC2026)
                ->table('vkasbank')
                ->whereRaw("RTRIM(cno_acc) LIKE '1.11.02%'")
                ->orderBy('cno_acc')
                ->get(['cno_acc', 'cnm_acc']);

            foreach ($vkRows as $row) {
                $no = trim((string) $row->cno_acc);
                if ($no === '' || isset($seen[$no])) {
                    continue;
                }

                $name = trim((string) $row->cnm_acc);
                $parsed = $this->parseBankMeta($name);

                $accounts[] = [
                    'value' => $no,
                    'label' => $name,
                    'bank_name' => $parsed['bank_name'],
                    'rekening_no' => $parsed['rekening_no'],
                    'acc_coa' => $no,
                    'source' => 'acc_vkasbank',
                ];
                $seen[$no] = true;
            }
        } catch (\Throwable) {
            // ACC unavailable
        }

        return $accounts;
    }

    private function isBankAccountName(string $name): bool
    {
        $lower = strtolower($name);

        return str_contains($lower, 'bank') || str_contains($lower, 'bca')
            || str_contains($lower, 'bni') || str_contains($lower, 'mandiri')
            || str_contains($lower, 'dki') || str_contains($lower, 'bri');
    }

    /**
     * @return array{bank_name: string, rekening_no: string}
     */
    private function parseBankMeta(string $name): array
    {
        $bankName = 'Bank';
        $rekeningNo = '';

        if (preg_match('/Bank\s+([A-Za-z0-9\s\.\-]+?)(?:\s+\d|\s*$)/i', $name, $m)) {
            $bankName = 'Bank '.trim($m[1]);
        } elseif (preg_match('/(BCA|BNI|Mandiri|DKI|BRI)/i', $name, $m)) {
            $bankName = $m[1];
        }

        if (preg_match('/(\d[\d\-\.]+(?:\-\d+)?)\s*$/', $name, $m)) {
            $rekeningNo = trim($m[1]);
        }

        return ['bank_name' => $bankName, 'rekening_no' => $rekeningNo];
    }

    private function resolveAccCoa(string $simartName): ?string
    {
        $parsed = $this->parseBankMeta($simartName);
        $rekening = preg_replace('/[^\d]/', '', $parsed['rekening_no']);

        if ($rekening === '') {
            return null;
        }

        try {
            $candidates = DB::connection(RsudConnections::ACC2026)
                ->table('vkasbank')
                ->whereRaw("RTRIM(cno_acc) LIKE '1.11.02%'")
                ->get(['cno_acc', 'cnm_acc']);

            foreach ($candidates as $row) {
                $accName = trim((string) $row->cnm_acc);
                $digits = preg_replace('/[^\d]/', '', $accName);
                if ($digits !== '' && (str_contains($digits, $rekening) || str_contains($rekening, $digits))) {
                    return trim((string) $row->cno_acc);
                }
            }

            $tbRows = DB::connection(RsudConnections::ACC2026)
                ->table('tbbank')
                ->where(function ($q) {
                    $q->whereNull('lbatal')->orWhere('lbatal', '<>', 1);
                })
                ->get(['cno_acc', 'cnm_acc', 'cnorek']);

            foreach ($tbRows as $row) {
                $haystack = trim((string) ($row->cnm_acc.$row->cnorek));
                $digits = preg_replace('/[^\d]/', '', $haystack);
                if ($digits !== '' && (str_contains($digits, $rekening) || str_contains($rekening, $digits))) {
                    return trim((string) $row->cno_acc);
                }
            }
        } catch (\Throwable) {
            return null;
        }

        return null;
    }

    private function saldoBkuSebelumPeriode(string $prefix, string $accountNo, int $tahun, ?int $bulan): float
    {
        $bindings = [$prefix.'%', $accountNo, $tahun];
        $bulanSql = '';

        if ($bulan && $bulan > 1) {
            $bulanSql = ' AND MONTH(h.dtgtrans) < ?';
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
    private function mutasiBkuPeriode(string $prefix, string $accountNo, int $tahun, ?int $bulan): array
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

    private function saldoBkuAkhir(string $prefix, string $accountNo, int $tahun, ?int $bulan): float
    {
        $awal = $this->saldoBkuSebelumPeriode($prefix, $accountNo, $tahun, $bulan);
        $mutasi = $this->mutasiBkuPeriode($prefix, $accountNo, $tahun, $bulan);

        return round($awal + $mutasi['masuk'] - $mutasi['keluar'], 2);
    }

    private function saldoAccPeriode(string $accCoa, int $tahun, ?int $bulan): float
    {
        try {
            $bindings = [$accCoa, $tahun];
            $bulanSql = '';

            if ($bulan) {
                $bulanSql = ' AND MONTH(h.dtgljurnal) = ?';
                $bindings[] = $bulan;
            }

            $row = DB::connection(RsudConnections::ACC2026)->selectOne("
                SELECT
                    SUM(CAST(e.ndebet AS float)) as debet,
                    SUM(CAST(e.nkredit AS float)) as kredit
                FROM JURNAL_E e
                INNER JOIN JURNAL_H h ON h.cnojurnal = e.cnojurnal
                WHERE RTRIM(e.cno_acc) = ?
                  AND YEAR(h.dtgljurnal) = ?
                  AND (h.lbatal IS NULL OR h.lbatal <> 1)
                  {$bulanSql}
            ", $bindings);

            return round((float) ($row->debet ?? 0) - (float) ($row->kredit ?? 0), 2);
        } catch (\Throwable) {
            return 0.0;
        }
    }

    /**
     * @return array{jumlah: int, posted: int}
     */
    private function bkuStats(string $prefix, string $accountNo, int $tahun, ?int $bulan): array
    {
        $bindings = [$prefix.'%', $accountNo, $tahun];
        $bulanSql = '';

        if ($bulan) {
            $bulanSql = ' AND MONTH(h.dtgtrans) = ?';
            $bindings[] = $bulan;
        }

        $row = DB::connection(RsudConnections::SIMARTDB)->selectOne("
            SELECT
                COUNT(*) as jumlah,
                SUM(CASE WHEN h.cnojurnal IS NOT NULL AND RTRIM(h.cnojurnal) <> '' THEN 1 ELSE 0 END) as posted
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
            'jumlah' => (int) ($row->jumlah ?? 0),
            'posted' => (int) ($row->posted ?? 0),
        ];
    }

    /**
     * @param  array{value: string, label: string, acc_coa: ?string}  $account
     * @return list<array<string, mixed>>
     */
    private function fetchRekonLines(
        string $prefix,
        string $accountNo,
        array $account,
        int $tahun,
        ?int $bulan,
        string $search
    ): array {
        $bindings = [$prefix.'%', $accountNo, $tahun];
        $bulanSql = '';
        $searchSql = '';

        if ($bulan) {
            $bulanSql = ' AND MONTH(h.dtgtrans) = ?';
            $bindings[] = $bulan;
        }

        if ($search !== '') {
            $searchSql = ' AND (h.cnobku LIKE ? OR h.cket LIKE ? OR h.cnojurnal LIKE ?)';
            $term = '%'.$search.'%';
            $bindings[] = $term;
            $bindings[] = $term;
            $bindings[] = $term;
        }

        $rows = DB::connection(RsudConnections::SIMARTDB)->select("
            SELECT
                h.cnobku,
                h.cnojurnal,
                h.dtgtrans,
                h.cket,
                CAST(d.nterima AS float) as nterima,
                CAST(d.nkeluar AS float) as nkeluar
            FROM BKUD d
            INNER JOIN BKUH h ON h.cnobku = d.cnobku
            WHERE d.cnobku LIKE ?
              AND RTRIM(d.cno_acc) = ?
              AND YEAR(h.dtgtrans) = ?
              AND (d.lbatal IS NULL OR d.lbatal <> 1)
              AND (h.lbatal IS NULL OR h.lbatal <> 1)
              {$bulanSql}
              {$searchSql}
            ORDER BY h.dtgtrans DESC, h.cnobku DESC
        ", $bindings);

        $jurnalNos = collect($rows)
            ->map(fn ($row) => trim((string) ($row->cnojurnal ?? '')))
            ->filter()
            ->unique()
            ->values()
            ->all();

        $jurnalAmounts = $this->batchJurnalAmounts($jurnalNos, $account['acc_coa']);

        $lines = [];

        foreach ($rows as $row) {
            $masuk = round((float) ($row->nterima ?? 0), 2);
            $keluar = round((float) ($row->nkeluar ?? 0), 2);
            $amountBku = $masuk > 0 ? $masuk : $keluar;
            $noJurnal = trim((string) ($row->cnojurnal ?? ''));
            $amountAcc = null;
            $status = 'pending';

            if ($noJurnal !== '') {
                $amountAcc = $jurnalAmounts[$noJurnal] ?? null;

                if ($amountAcc !== null && abs($amountBku - abs($amountAcc)) < 0.01) {
                    $status = 'matched';
                } else {
                    $status = 'selisih';
                }
            }

            $lines[] = [
                'account_no' => $accountNo,
                'account_name' => $account['label'],
                'no_bku' => trim((string) $row->cnobku),
                'no_jurnal' => $noJurnal,
                'tanggal' => $row->dtgtrans ? date('Y-m-d', strtotime((string) $row->dtgtrans)) : null,
                'keterangan' => trim((string) ($row->cket ?? '')),
                'masuk' => $masuk,
                'keluar' => $keluar,
                'amount_bku' => $amountBku,
                'amount_acc' => $amountAcc !== null ? round(abs($amountAcc), 2) : null,
                'selisih' => $amountAcc !== null ? round($amountBku - abs($amountAcc), 2) : null,
                'status' => $status,
            ];
        }

        return $lines;
    }

    /**
     * @param  list<string>  $jurnalNos
     * @return array<string, float>
     */
    private function batchJurnalAmounts(array $jurnalNos, ?string $accCoa): array
    {
        if ($jurnalNos === []) {
            return [];
        }

        $amounts = [];

        try {
            if ($accCoa) {
                $chunks = array_chunk($jurnalNos, 200);
                foreach ($chunks as $chunk) {
                    $placeholders = implode(',', array_fill(0, count($chunk), '?'));
                    $bindings = array_merge($chunk, [$accCoa]);
                    $rows = DB::connection(RsudConnections::ACC2026)->select("
                        SELECT RTRIM(e.cnojurnal) as cnojurnal,
                               SUM(CAST(e.ndebet AS float)) as debet,
                               SUM(CAST(e.nkredit AS float)) as kredit
                        FROM JURNAL_E e
                        WHERE RTRIM(e.cnojurnal) IN ({$placeholders})
                          AND RTRIM(e.cno_acc) = ?
                        GROUP BY RTRIM(e.cnojurnal)
                    ", $bindings);

                    foreach ($rows as $row) {
                        $amounts[trim((string) $row->cnojurnal)] = round(
                            (float) ($row->debet ?? 0) - (float) ($row->kredit ?? 0),
                            2
                        );
                    }
                }
            }

            $missing = array_values(array_filter($jurnalNos, fn ($no) => ! isset($amounts[$no])));
            if ($missing !== []) {
                foreach (array_chunk($missing, 200) as $chunk) {
                    $placeholders = implode(',', array_fill(0, count($chunk), '?'));
                    $headers = DB::connection(RsudConnections::ACC2026)->select("
                        SELECT RTRIM(cnojurnal) as cnojurnal,
                               CAST(ndebet AS float) as ndebet,
                               CAST(nkredit AS float) as nkredit
                        FROM JURNAL_H
                        WHERE RTRIM(cnojurnal) IN ({$placeholders})
                          AND (lbatal IS NULL OR lbatal <> 1)
                    ", $chunk);

                    foreach ($headers as $row) {
                        $no = trim((string) $row->cnojurnal);
                        if (! isset($amounts[$no])) {
                            $amounts[$no] = round(
                                max((float) ($row->ndebet ?? 0), (float) ($row->nkredit ?? 0)),
                                2
                            );
                        }
                    }
                }
            }
        } catch (\Throwable) {
            return [];
        }

        return $amounts;
    }

    private function jurnalAmount(string $noJurnal, ?string $accCoa): ?float
    {
        if (! $accCoa) {
            return null;
        }

        try {
            $row = DB::connection(RsudConnections::ACC2026)->selectOne("
                SELECT SUM(CAST(e.ndebet AS float)) as debet, SUM(CAST(e.nkredit AS float)) as kredit
                FROM JURNAL_E e
                WHERE RTRIM(e.cnojurnal) = ? AND RTRIM(e.cno_acc) = ?
            ", [$noJurnal, $accCoa]);

            if (! $row || ($row->debet === null && $row->kredit === null)) {
                return null;
            }

            return round((float) ($row->debet ?? 0) - (float) ($row->kredit ?? 0), 2);
        } catch (\Throwable) {
            return null;
        }
    }

    private function jurnalHeaderAmount(string $noJurnal): ?float
    {
        try {
            $row = DB::connection(RsudConnections::ACC2026)
                ->table('JURNAL_H')
                ->whereRaw('RTRIM(cnojurnal) = ?', [$noJurnal])
                ->where(function ($q) {
                    $q->whereNull('lbatal')->orWhere('lbatal', '<>', 1);
                })
                ->first(['ndebet', 'nkredit']);

            if (! $row) {
                return null;
            }

            return round(max((float) ($row->ndebet ?? 0), (float) ($row->nkredit ?? 0)), 2);
        } catch (\Throwable) {
            return null;
        }
    }
}
