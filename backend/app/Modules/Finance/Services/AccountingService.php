<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\BudgetYear;
use App\Support\RsudConnections;
use Illuminate\Support\Facades\DB;

class AccountingService
{
    /** @var array<string, string> */
    private const KELOMPOK_LABELS = [
        'A' => 'Aset',
        'P' => 'Kewajiban',
        'M' => 'Ekuitas / Modal',
        'R' => 'Pendapatan',
        'B' => 'Beban',
    ];

    /** @var array<string, string> */
    private const JOURNAL_TYPE_LABELS = [
        'BKM' => 'Bukti Kas Masuk',
        'BBM' => 'Bukti Bank Masuk',
        'BKK' => 'Bukti Kas Keluar',
        'BBK' => 'Bukti Bank Keluar',
        'BBA' => 'Beban Administrasi Bank',
        'BKA' => 'Bukti Kas Adjust / Jurnal Umum',
        'BIL' => 'Billing',
        'BIF' => 'Billing Farmasi',
        'BLF' => 'Belanja Langsung Farmasi',
        'BLL' => 'Belanja Langsung Lainnya',
        'BUM' => 'Belanja Umum',
        'PRI' => 'Penerimaan Internal',
    ];

    /** @var list<string> */
    private const AUTO_JOURNAL_TYPES = [
        'BIL', 'BIF', 'BKM', 'BBM', 'BBK', 'BKK', 'BBA', 'BLF', 'BLL', 'BUM', 'PRI',
    ];

    /** @var list<string> */
    private const MANUAL_JOURNAL_TYPES = ['BKA'];

    /** @var list<array{module: string, label: string, coa_prefix: string, source: string}> */
    private const MODULE_MAPPINGS = [
        ['module' => 'kas-bank', 'label' => 'Kas & Bank', 'coa_prefix' => '1.1.01', 'source' => 'ACC2026.vkas / tbbank'],
        ['module' => 'hutang', 'label' => 'Hutang', 'coa_prefix' => '2.1.01', 'source' => 'ACC2026.JURNAL_H/E'],
        ['module' => 'piutang', 'label' => 'Piutang Pelayanan', 'coa_prefix' => '1.1.02', 'source' => 'ACC2026.JURNAL_H/E'],
        ['module' => 'pendapatan', 'label' => 'Pendapatan', 'coa_prefix' => '4.', 'source' => 'ACC2026 + SIMARTDB'],
        ['module' => 'belanja', 'label' => 'Belanja', 'coa_prefix' => '5.', 'source' => 'ACC2026 + SIMARTDB'],
    ];

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
            'tahun' => $tahun,
            'source' => 'ACC2026 (ACCRSPR2026)',
            'bulan_options' => collect(self::BULAN_LABELS)
                ->map(fn (string $label, int $value) => ['value' => $value, 'label' => $label])
                ->values()->all(),
            'kelompok_options' => collect(self::KELOMPOK_LABELS)
                ->map(fn (string $label, string $value) => ['value' => $value, 'label' => $label])
                ->values()->all(),
            'journal_type_options' => collect(self::JOURNAL_TYPE_LABELS)
                ->map(fn (string $label, string $value) => ['value' => $value, 'label' => $label])
                ->values()->all(),
        ];
    }

    /**
     * @param  array{tahun: int, bulan?: int|null}  $filters
     */
    public function dashboard(array $filters): array
    {
        $tahun = (int) $filters['tahun'];
        $bulan = isset($filters['bulan']) ? (int) $filters['bulan'] : null;

        $journalStats = $this->journalStats($tahun, $bulan);
        $groupSaldo = $this->saldoByKelompok();
        $tutupBuku = $this->tutupBukuStatus();

        $aset = $groupSaldo['A'] ?? 0;
        $kewajiban = $groupSaldo['P'] ?? 0;
        $ekuitas = $groupSaldo['M'] ?? 0;
        $pendapatan = $groupSaldo['R'] ?? 0;
        $beban = abs($groupSaldo['B'] ?? 0);

        return [
            'filters' => ['tahun' => $tahun, 'bulan' => $bulan],
            'source' => 'ACC2026.JURNAL_H/E · CHARTACC · TABBULAN',
            'kpis' => [
                'total_jurnal' => $journalStats['total'],
                'belum_posting' => $journalStats['unposted'],
                'sudah_posting' => $journalStats['posted'],
                'total_coa' => $this->coaCount(),
                'saldo_aset' => $aset,
                'saldo_kewajiban' => $kewajiban,
                'saldo_ekuitas' => $ekuitas,
                'surplus_periode' => round($pendapatan - $beban, 2),
                'periode_tertutup' => $tutupBuku['closed_count'],
                'periode_terbuka' => $tutupBuku['open_count'],
            ],
            'journal_by_type' => $this->journalByType($tahun, $bulan),
            'monthly_trend' => $this->monthlyJournalTrend($tahun),
            'group_composition' => collect(self::KELOMPOK_LABELS)
                ->map(fn (string $label, string $key) => [
                    'kelompok' => $key,
                    'label' => $label,
                    'saldo' => round(abs($groupSaldo[$key] ?? 0), 2),
                ])
                ->values()->all(),
            'recent_journals' => $this->recentJournals($tahun, 8),
            'tutup_buku_summary' => $tutupBuku,
        ];
    }

    /**
     * @param  array{tahun: int, search?: string|null, kelompok?: string|null, detail_only?: bool, page?: int, per_page?: int}  $filters
     */
    public function coa(array $filters): array
    {
        $search = trim((string) ($filters['search'] ?? ''));
        $kelompok = trim((string) ($filters['kelompok'] ?? ''));
        $detailOnly = (bool) ($filters['detail_only'] ?? false);
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(10, (int) ($filters['per_page'] ?? 25)));

        $where = ['(lbatal IS NULL OR lbatal <> 1)'];
        $bindings = [];

        if ($detailOnly) {
            $where[] = 'ldetail = 1';
        }
        if ($kelompok !== '') {
            $where[] = 'RTRIM(ckelompok) = ?';
            $bindings[] = $kelompok;
        }
        if ($search !== '') {
            $where[] = '(RTRIM(cno_acc) LIKE ? OR RTRIM(cnm_acc) LIKE ?)';
            $term = '%'.$search.'%';
            array_push($bindings, $term, $term);
        }

        $whereSql = implode(' AND ', $where);

        $totalRow = DB::connection(RsudConnections::ACC2026)->selectOne("
            SELECT COUNT(*) as cnt FROM CHARTACC WHERE {$whereSql}
        ", $bindings);

        $offset = ($page - 1) * $perPage;
        $rows = DB::connection(RsudConnections::ACC2026)->select("
            SELECT RTRIM(cno_acc) as account_no, RTRIM(cnm_acc) as account_name,
                   RTRIM(ckelompok) as kelompok, CAST(nlevel AS int) as level,
                   CAST(ldetail AS int) as is_detail, RTRIM(lnrckiri) as normal_balance,
                   CAST(nsldodeb AS float) as saldo_debet, CAST(nsldokre AS float) as saldo_kredit
            FROM CHARTACC
            WHERE {$whereSql}
            ORDER BY cno_acc
            OFFSET {$offset} ROWS FETCH NEXT {$perPage} ROWS ONLY
        ", $bindings);

        $total = (int) ($totalRow->cnt ?? 0);

        return [
            'rows' => array_map(fn ($r) => [
                'account_no' => trim((string) $r->account_no),
                'account_name' => trim((string) $r->account_name),
                'kelompok' => trim((string) $r->kelompok),
                'kelompok_label' => self::KELOMPOK_LABELS[trim((string) $r->kelompok)] ?? trim((string) $r->kelompok),
                'level' => (int) $r->level,
                'is_detail' => (int) $r->is_detail === 1,
                'normal_balance' => trim((string) $r->normal_balance),
                'saldo' => $this->chartaccSaldo($r),
            ], $rows),
            'meta' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => max(1, (int) ceil($total / $perPage)),
            ],
            'summary' => [
                'total_accounts' => $this->coaCount(),
                'detail_accounts' => $this->coaCount(true),
            ],
        ];
    }

    public function mappingAkun(): array
    {
        $kasRows = $this->safeQuery(fn () => DB::connection(RsudConnections::ACC2026)
            ->table('vkas')
            ->orderBy('cno_acc')
            ->limit(50)
            ->get(['cno_acc', 'cnm_acc'])
            ->map(fn ($r) => [
                'account_no' => trim((string) $r->cno_acc),
                'account_name' => trim((string) $r->cnm_acc),
                'type' => 'kas',
            ])->all(), []);

        $bankRows = $this->safeQuery(fn () => DB::connection(RsudConnections::ACC2026)
            ->table('tbbank')
            ->whereRaw("RTRIM(cno_acc) <> ''")
            ->orderBy('cno_acc')
            ->limit(50)
            ->get(['cno_acc', 'cnm_acc', 'cnorek', 'cnmbank1'])
            ->map(fn ($r) => [
                'account_no' => trim((string) $r->cno_acc),
                'account_name' => trim((string) ($r->cnm_acc ?: $r->cnmbank1)),
                'bank_account' => trim((string) ($r->cnorek ?? '')),
                'type' => 'bank',
            ])->all(), []);

        $moduleRows = [];
        foreach (self::MODULE_MAPPINGS as $mapping) {
            $count = $this->safeQuery(fn () => (int) DB::connection(RsudConnections::ACC2026)
                ->table('CHARTACC')
                ->whereRaw('RTRIM(cno_acc) LIKE ?', [$mapping['coa_prefix'].'%'])
                ->where('ldetail', 1)
                ->count(), 0);

            $moduleRows[] = [
                ...$mapping,
                'account_count' => $count,
            ];
        }

        return [
            'source' => 'ACC2026.vkas · tbbank · CHARTACC',
            'kas_accounts' => $kasRows,
            'bank_accounts' => $bankRows,
            'module_mappings' => $moduleRows,
        ];
    }

    /**
     * @param  array{tahun: int, bulan?: int|null, search?: string|null, page?: int, per_page?: int}  $filters
     */
    public function jurnalUmum(array $filters): array
    {
        return $this->journalList($filters, 'manual');
    }

    /**
     * @param  array{tahun: int, bulan?: int|null, journal_type?: string|null, search?: string|null, page?: int, per_page?: int}  $filters
     */
    public function jurnalOtomatis(array $filters): array
    {
        return $this->journalList($filters, 'auto');
    }

    /**
     * @param  array{tahun: int, bulan?: int|null, search?: string|null, page?: int, per_page?: int}  $filters
     */
    public function postingJurnal(array $filters): array
    {
        return $this->journalList($filters, 'unposted');
    }

    /**
     * @param  array{tahun: int, bulan?: int|null, account_no?: string|null, search?: string|null, page?: int, per_page?: int}  $filters
     */
    public function bukuBesar(array $filters): array
    {
        $tahun = (int) $filters['tahun'];
        $bulan = isset($filters['bulan']) ? (int) $filters['bulan'] : null;
        $accountNo = trim((string) ($filters['account_no'] ?? ''));
        $search = trim((string) ($filters['search'] ?? ''));
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(10, (int) ($filters['per_page'] ?? 25)));

        $accountOptions = $this->safeQuery(fn () => DB::connection(RsudConnections::ACC2026)
            ->select("
                SELECT TOP 200 RTRIM(cno_acc) as account_no, RTRIM(cnm_acc) as account_name
                FROM CHARTACC WHERE ldetail = 1 AND (lbatal IS NULL OR lbatal <> 1)
                ORDER BY cno_acc
            "), []);

        if ($accountNo === '' && count($accountOptions) > 0) {
            $accountNo = trim((string) $accountOptions[0]->account_no);
        }

        $accountInfo = null;
        $rows = [];
        $total = 0;

        if ($accountNo !== '') {
            $accountInfo = $this->safeQuery(fn () => DB::connection(RsudConnections::ACC2026)->selectOne("
                SELECT RTRIM(cno_acc) as account_no, RTRIM(cnm_acc) as account_name,
                       RTRIM(ckelompok) as kelompok, CAST(nsldodeb AS float) as saldo_debet,
                       CAST(nsldokre AS float) as saldo_kredit, RTRIM(lnrckiri) as normal_balance
                FROM CHARTACC WHERE RTRIM(cno_acc) = ?
            ", [$accountNo]), null);

            $bulanSql = $bulan ? ' AND MONTH(h.dtgljurnal) = ?' : '';
            $searchSql = $search !== '' ? ' AND (h.cnojurnal LIKE ? OR h.cket LIKE ?)' : '';
            $bindings = [$accountNo, $tahun];
            if ($bulan) {
                $bindings[] = $bulan;
            }
            if ($search !== '') {
                $term = '%'.$search.'%';
                array_push($bindings, $term, $term);
            }

            $countRow = $this->safeQuery(fn () => DB::connection(RsudConnections::ACC2026)->selectOne("
                SELECT COUNT(*) as cnt
                FROM JURNAL_E e INNER JOIN JURNAL_H h ON h.cnojurnal = e.cnojurnal
                WHERE RTRIM(e.cno_acc) = ? AND YEAR(h.dtgljurnal) = ?
                  AND (h.lbatal IS NULL OR h.lbatal <> 1)
                  {$bulanSql}{$searchSql}
            ", $bindings), null);

            $total = (int) ($countRow->cnt ?? 0);
            $offset = ($page - 1) * $perPage;

            $rawRows = $this->safeQuery(fn () => DB::connection(RsudConnections::ACC2026)->select("
                SELECT h.cnojurnal, h.dtgljurnal, h.cket, h.ckeljurnal,
                       CAST(e.ndebet AS float) as debet, CAST(e.nkredit AS float) as kredit,
                       h.lsdhproses, h.lvalid
                FROM JURNAL_E e INNER JOIN JURNAL_H h ON h.cnojurnal = e.cnojurnal
                WHERE RTRIM(e.cno_acc) = ? AND YEAR(h.dtgljurnal) = ?
                  AND (h.lbatal IS NULL OR h.lbatal <> 1)
                  {$bulanSql}{$searchSql}
                ORDER BY h.dtgljurnal DESC, h.cnojurnal DESC
                OFFSET {$offset} ROWS FETCH NEXT {$perPage} ROWS ONLY
            ", $bindings), []);

            $running = 0.0;
            $normalBalance = trim((string) ($accountInfo->normal_balance ?? 'L'));
            foreach (array_reverse($rawRows) as $r) {
                $debet = (float) $r->debet;
                $kredit = (float) $r->kredit;
                $running += $normalBalance === 'L' ? ($debet - $kredit) : ($kredit - $debet);
            }

            $rows = array_map(function ($r) use (&$running, $normalBalance) {
                $debet = (float) $r->debet;
                $kredit = (float) $r->kredit;
                $running += $normalBalance === 'L' ? ($debet - $kredit) : ($kredit - $debet);

                return [
                    'no_jurnal' => trim((string) $r->cnojurnal),
                    'tanggal' => $r->dtgljurnal ? date('Y-m-d', strtotime((string) $r->dtgljurnal)) : null,
                    'keterangan' => trim((string) ($r->cket ?? '')),
                    'journal_type' => trim((string) ($r->ckeljurnal ?? '')),
                    'debet' => round($debet, 2),
                    'kredit' => round($kredit, 2),
                    'saldo' => round($running, 2),
                    'posted' => ((int) ($r->lsdhproses ?? 0)) === 1,
                    'valid' => ((int) ($r->lvalid ?? 0)) === 1,
                ];
            }, $rawRows);
        }

        return [
            'account' => $accountInfo ? [
                'account_no' => trim((string) $accountInfo->account_no),
                'account_name' => trim((string) $accountInfo->account_name),
                'kelompok' => trim((string) $accountInfo->kelompok),
                'kelompok_label' => self::KELOMPOK_LABELS[trim((string) $accountInfo->kelompok)] ?? '',
                'saldo' => $this->chartaccSaldo($accountInfo),
            ] : null,
            'account_options' => array_map(fn ($r) => [
                'value' => trim((string) $r->account_no),
                'label' => trim((string) $r->account_name).' ('.trim((string) $r->account_no).')',
            ], $accountOptions),
            'rows' => $rows,
            'meta' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => max(1, (int) ceil(max(1, $total) / $perPage)),
            ],
        ];
    }

    /**
     * @param  array{tahun: int, bulan?: int|null}  $filters
     */
    public function neraca(array $filters): array
    {
        return $this->financialReport($filters, ['A', 'P', 'M'], 'neraca');
    }

    /**
     * @param  array{tahun: int, bulan?: int|null}  $filters
     */
    public function laporanOperasional(array $filters): array
    {
        return $this->financialReport($filters, ['R', 'B'], 'operasional');
    }

    /**
     * @param  array{tahun: int, bulan?: int|null}  $filters
     */
    public function arusKas(array $filters): array
    {
        $tahun = (int) $filters['tahun'];
        $bulan = isset($filters['bulan']) ? (int) $filters['bulan'] : null;

        $cashCoa = $this->safeQuery(fn () => DB::connection(RsudConnections::ACC2026)
            ->select("
                SELECT RTRIM(cno_acc) as account_no, RTRIM(cnm_acc) as account_name
                FROM CHARTACC
                WHERE ldetail = 1 AND RTRIM(cno_acc) LIKE '1.1.01%'
                  AND (lbatal IS NULL OR lbatal <> 1)
                ORDER BY cno_acc
            "), []);

        $coaList = array_map(fn ($r) => trim((string) $r->account_no), $cashCoa);
        $monthly = [];

        for ($m = 1; $m <= 12; $m++) {
            if ($bulan && $m !== $bulan) {
                continue;
            }
            $in = 0.0;
            $out = 0.0;
            if ($coaList !== []) {
                $inClause = $this->inClause($coaList);
                $row = $this->safeQuery(fn () => DB::connection(RsudConnections::ACC2026)->selectOne("
                    SELECT SUM(CAST(e.ndebet AS float)) as masuk, SUM(CAST(e.nkredit AS float)) as keluar
                    FROM JURNAL_E e INNER JOIN JURNAL_H h ON h.cnojurnal = e.cnojurnal
                    WHERE RTRIM(e.cno_acc) IN ({$inClause})
                      AND YEAR(h.dtgljurnal) = ? AND MONTH(h.dtgljurnal) = ?
                      AND (h.lbatal IS NULL OR h.lbatal <> 1)
                ", array_merge($coaList, [$tahun, $m])), null);
                $in = round((float) ($row->masuk ?? 0), 2);
                $out = round((float) ($row->keluar ?? 0), 2);
            }
            $monthly[] = [
                'bulan' => $m,
                'label' => self::BULAN_LABELS[$m],
                'masuk' => $in,
                'keluar' => $out,
                'net' => round($in - $out, 2),
            ];
        }

        $accountRows = [];
        foreach ($cashCoa as $acc) {
            $no = trim((string) $acc->account_no);
            $bulanSql = $bulan ? ' AND MONTH(h.dtgljurnal) = ?' : '';
            $bindings = [$no, $tahun];
            if ($bulan) {
                $bindings[] = $bulan;
            }
            $row = $this->safeQuery(fn () => DB::connection(RsudConnections::ACC2026)->selectOne("
                SELECT SUM(CAST(e.ndebet AS float)) as masuk, SUM(CAST(e.nkredit AS float)) as keluar
                FROM JURNAL_E e INNER JOIN JURNAL_H h ON h.cnojurnal = e.cnojurnal
                WHERE RTRIM(e.cno_acc) = ? AND YEAR(h.dtgljurnal) = ?
                  AND (h.lbatal IS NULL OR h.lbatal <> 1)
                  {$bulanSql}
            ", $bindings), null);

            $accountRows[] = [
                'account_no' => $no,
                'account_name' => trim((string) $acc->account_name),
                'masuk' => round((float) ($row->masuk ?? 0), 2),
                'keluar' => round((float) ($row->keluar ?? 0), 2),
                'net' => round((float) ($row->masuk ?? 0) - (float) ($row->keluar ?? 0), 2),
            ];
        }

        return [
            'filters' => ['tahun' => $tahun, 'bulan' => $bulan],
            'source' => 'ACC2026 — akun kas 1.1.01%',
            'monthly' => $monthly,
            'accounts' => $accountRows,
            'summary' => [
                'total_masuk' => round(array_sum(array_column($monthly, 'masuk')), 2),
                'total_keluar' => round(array_sum(array_column($monthly, 'keluar')), 2),
                'net' => round(array_sum(array_column($monthly, 'net')), 2),
            ],
        ];
    }

    /**
     * @param  array{tahun: int, bulan?: int|null}  $filters
     */
    public function perubahanEkuitas(array $filters): array
    {
        $tahun = (int) $filters['tahun'];

        $rows = $this->safeQuery(fn () => DB::connection(RsudConnections::ACC2026)->select("
            SELECT RTRIM(cno_acc) as account_no, RTRIM(cnm_acc) as account_name,
                   CAST(nsldodeb AS float) as saldo_debet, CAST(nsldokre AS float) as saldo_kredit,
                   RTRIM(lnrckiri) as normal_balance
            FROM CHARTACC
            WHERE RTRIM(ckelompok) = 'M' AND ldetail = 1
              AND (lbatal IS NULL OR lbatal <> 1)
            ORDER BY cno_acc
        "), []);

        $mutations = [];
        foreach ($rows as $r) {
            $no = trim((string) $r->account_no);
            $mutRow = $this->safeQuery(fn () => DB::connection(RsudConnections::ACC2026)->selectOne("
                SELECT SUM(CAST(e.ndebet AS float)) as debet, SUM(CAST(e.nkredit AS float)) as kredit
                FROM JURNAL_E e INNER JOIN JURNAL_H h ON h.cnojurnal = e.cnojurnal
                WHERE RTRIM(e.cno_acc) = ? AND YEAR(h.dtgljurnal) = ?
                  AND (h.lbatal IS NULL OR h.lbatal <> 1)
            ", [$no, $tahun]), null);

            $mutations[] = [
                'account_no' => $no,
                'account_name' => trim((string) $r->account_name),
                'saldo_awal' => $this->chartaccSaldo($r),
                'mutasi_debet' => round((float) ($mutRow->debet ?? 0), 2),
                'mutasi_kredit' => round((float) ($mutRow->kredit ?? 0), 2),
                'saldo_akhir' => round($this->chartaccSaldo($r), 2),
            ];
        }

        return [
            'filters' => ['tahun' => $tahun],
            'source' => 'ACC2026 — akun ekuitas (ckelompok M)',
            'rows' => $mutations,
            'summary' => [
                'total_saldo' => round(array_sum(array_column($mutations, 'saldo_akhir')), 2),
                'total_mutasi_debet' => round(array_sum(array_column($mutations, 'mutasi_debet')), 2),
                'total_mutasi_kredit' => round(array_sum(array_column($mutations, 'mutasi_kredit')), 2),
            ],
        ];
    }

    public function tutupBuku(): array
    {
        $status = $this->tutupBukuStatus();

        $history = $this->safeQuery(fn () => DB::connection(RsudConnections::ACC2026)
            ->table('CLOSEBLN')
            ->orderByDesc('dtgclose')
            ->limit(20)
            ->get(['cnoclose', 'cthn', 'cbln', 'cnmunit', 'dtgclose', 'lvalid', 'ckunci'])
            ->map(fn ($r) => [
                'no_close' => trim((string) ($r->cnoclose ?? '')),
                'tahun' => trim((string) ($r->cthn ?? '')),
                'bulan' => trim((string) ($r->cbln ?? '')),
                'unit' => trim((string) ($r->cnmunit ?? '')),
                'tanggal_close' => $r->dtgclose ? date('Y-m-d', strtotime((string) $r->dtgclose)) : null,
                'valid' => ((int) ($r->lvalid ?? 0)) === 1,
                'kunci' => trim((string) ($r->ckunci ?? '')),
            ])->all(), []);

        return [
            'source' => 'ACC2026.TABBULAN · CLOSEBLN',
            'periode_status' => $status['months'],
            'summary' => [
                'closed_count' => $status['closed_count'],
                'open_count' => $status['open_count'],
                'current_open_month' => $status['current_open_month'],
            ],
            'history' => $history,
        ];
    }

    /**
     * @param  array{tahun: int, bulan?: int|null, search?: string|null, journal_type?: string|null, page?: int, per_page?: int}  $filters
     * @return array{rows: list<array<string, mixed>>, meta: array<string, int>, summary: array<string, int|float>}
     */
    private function journalList(array $filters, string $mode): array
    {
        $tahun = (int) $filters['tahun'];
        $bulan = isset($filters['bulan']) ? (int) $filters['bulan'] : null;
        $search = trim((string) ($filters['search'] ?? ''));
        $journalType = trim((string) ($filters['journal_type'] ?? ''));
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(10, (int) ($filters['per_page'] ?? 20)));

        $where = ['YEAR(h.dtgljurnal) = ?', '(h.lbatal IS NULL OR h.lbatal <> 1)'];
        $bindings = [$tahun];

        if ($bulan) {
            $where[] = 'MONTH(h.dtgljurnal) = ?';
            $bindings[] = $bulan;
        }

        if ($mode === 'manual') {
            $inClause = $this->inClause(self::MANUAL_JOURNAL_TYPES);
            $where[] = "RTRIM(h.ckeljurnal) IN ({$inClause})";
            $bindings = array_merge($bindings, self::MANUAL_JOURNAL_TYPES);
        } elseif ($mode === 'auto') {
            $types = self::AUTO_JOURNAL_TYPES;
            if ($journalType !== '') {
                $types = in_array($journalType, $types, true) ? [$journalType] : [];
            }
            if ($types === []) {
                return [
                    'rows' => [],
                    'meta' => ['page' => 1, 'per_page' => $perPage, 'total' => 0, 'last_page' => 1],
                    'summary' => ['total_debet' => 0, 'total_kredit' => 0],
                ];
            }
            $inClause = $this->inClause($types);
            $where[] = "RTRIM(h.ckeljurnal) IN ({$inClause})";
            $bindings = array_merge($bindings, $types);
        } elseif ($mode === 'unposted') {
            $where[] = '(h.lsdhproses IS NULL OR h.lsdhproses <> 1)';
        }

        if ($search !== '') {
            $where[] = '(h.cnojurnal LIKE ? OR h.cket LIKE ? OR h.cnobukti LIKE ?)';
            $term = '%'.$search.'%';
            array_push($bindings, $term, $term, $term);
        }

        $whereSql = implode(' AND ', $where);

        $countRow = $this->safeQuery(fn () => DB::connection(RsudConnections::ACC2026)->selectOne("
            SELECT COUNT(*) as cnt FROM JURNAL_H h WHERE {$whereSql}
        ", $bindings), null);

        $total = (int) ($countRow->cnt ?? 0);
        $offset = ($page - 1) * $perPage;

        $rows = $this->safeQuery(fn () => DB::connection(RsudConnections::ACC2026)->select("
            SELECT h.cnojurnal, h.dtgljurnal, h.cket, h.cnobukti, h.ckeljurnal,
                   CAST(h.ndebet AS float) as debet, CAST(h.nkredit AS float) as kredit,
                   h.lvalid, h.lsdhproses, h.cno_acc, h.cnm_acc
            FROM JURNAL_H h
            WHERE {$whereSql}
            ORDER BY h.dtgljurnal DESC, h.cnojurnal DESC
            OFFSET {$offset} ROWS FETCH NEXT {$perPage} ROWS ONLY
        ", $bindings), []);

        $sumRow = $this->safeQuery(fn () => DB::connection(RsudConnections::ACC2026)->selectOne("
            SELECT SUM(CAST(h.ndebet AS float)) as total_debet, SUM(CAST(h.nkredit AS float)) as total_kredit
            FROM JURNAL_H h WHERE {$whereSql}
        ", $bindings), null);

        return [
            'rows' => array_map(fn ($r) => $this->formatJournalRow($r), $rows),
            'meta' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => max(1, (int) ceil(max(1, $total) / $perPage)),
            ],
            'summary' => [
                'total_debet' => round((float) ($sumRow->total_debet ?? 0), 2),
                'total_kredit' => round((float) ($sumRow->total_kredit ?? 0), 2),
            ],
        ];
    }

    /**
     * @param  list<string>  $kelompokList
     * @return array<string, mixed>
     */
    private function financialReport(array $filters, array $kelompokList, string $type): array
    {
        $tahun = (int) $filters['tahun'];
        $bulan = isset($filters['bulan']) ? (int) $filters['bulan'] : null;

        $inClause = $this->inClause($kelompokList);
        $bindings = $kelompokList;

        $rows = $this->safeQuery(fn () => DB::connection(RsudConnections::ACC2026)->select("
            SELECT RTRIM(cno_acc) as account_no, RTRIM(cnm_acc) as account_name,
                   RTRIM(ckelompok) as kelompok, CAST(nlevel AS int) as level,
                   CAST(ldetail AS int) as is_detail,
                   CAST(nsldodeb AS float) as saldo_debet, CAST(nsldokre AS float) as saldo_kredit,
                   RTRIM(lnrckiri) as normal_balance
            FROM CHARTACC
            WHERE RTRIM(ckelompok) IN ({$inClause})
              AND (lbatal IS NULL OR lbatal <> 1)
              AND CAST(nlevel AS int) <= 4
            ORDER BY cno_acc
        ", $bindings), []);

        $sections = [];
        $totals = [];
        foreach ($kelompokList as $k) {
            $sections[$k] = [];
            $totals[$k] = 0.0;
        }

        foreach ($rows as $r) {
            $kel = trim((string) $r->kelompok);
            $saldo = $this->chartaccSaldo($r);
            if ((int) $r->is_detail === 1 && abs($saldo) < 0.01) {
                continue;
            }
            $sections[$kel][] = [
                'account_no' => trim((string) $r->account_no),
                'account_name' => trim((string) $r->account_name),
                'level' => (int) $r->level,
                'is_detail' => (int) $r->is_detail === 1,
                'saldo' => round($saldo, 2),
            ];
            if ((int) $r->level === 2) {
                $totals[$kel] += $saldo;
            }
        }

        $result = [
            'filters' => ['tahun' => $tahun, 'bulan' => $bulan],
            'source' => 'ACC2026.CHARTACC',
            'report_type' => $type,
            'sections' => collect($sections)->map(fn ($items, $key) => [
                'kelompok' => $key,
                'label' => self::KELOMPOK_LABELS[$key] ?? $key,
                'total' => round($totals[$key] ?? 0, 2),
                'rows' => $items,
            ])->values()->all(),
        ];

        if ($type === 'neraca') {
            $result['summary'] = [
                'total_aset' => round($totals['A'] ?? 0, 2),
                'total_kewajiban' => round($totals['P'] ?? 0, 2),
                'total_ekuitas' => round($totals['M'] ?? 0, 2),
                'balance_check' => round(($totals['A'] ?? 0) - ($totals['P'] ?? 0) - ($totals['M'] ?? 0), 2),
            ];
        } else {
            $result['summary'] = [
                'total_pendapatan' => round($totals['R'] ?? 0, 2),
                'total_beban' => round(abs($totals['B'] ?? 0), 2),
                'surplus_defisit' => round(($totals['R'] ?? 0) + ($totals['B'] ?? 0), 2),
            ];
        }

        return $result;
    }

    /** @return array<string, float> */
    private function saldoByKelompok(): array
    {
        $rows = $this->safeQuery(fn () => DB::connection(RsudConnections::ACC2026)->select("
            SELECT RTRIM(ckelompok) as kelompok,
                   SUM(CASE WHEN lnrckiri='L' THEN CAST(nsldodeb AS float)-CAST(nsldokre AS float)
                            ELSE CAST(nsldokre AS float)-CAST(nsldodeb AS float) END) as saldo
            FROM CHARTACC WHERE ldetail = 1 AND (lbatal IS NULL OR lbatal <> 1)
            GROUP BY RTRIM(ckelompok)
        "), []);

        $result = [];
        foreach ($rows as $r) {
            $result[trim((string) $r->kelompok)] = round((float) $r->saldo, 2);
        }

        return $result;
    }

    /** @return array{total: int, posted: int, unposted: int} */
    private function journalStats(int $tahun, ?int $bulan): array
    {
        $bulanSql = $bulan ? ' AND MONTH(dtgljurnal) = ?' : '';
        $bindings = [$tahun];
        if ($bulan) {
            $bindings[] = $bulan;
        }

        $row = $this->safeQuery(fn () => DB::connection(RsudConnections::ACC2026)->selectOne("
            SELECT COUNT(*) as total,
                   SUM(CASE WHEN lsdhproses = 1 THEN 1 ELSE 0 END) as posted,
                   SUM(CASE WHEN lsdhproses IS NULL OR lsdhproses <> 1 THEN 1 ELSE 0 END) as unposted
            FROM JURNAL_H
            WHERE YEAR(dtgljurnal) = ? AND (lbatal IS NULL OR lbatal <> 1)
            {$bulanSql}
        ", $bindings), null);

        return [
            'total' => (int) ($row->total ?? 0),
            'posted' => (int) ($row->posted ?? 0),
            'unposted' => (int) ($row->unposted ?? 0),
        ];
    }

    /** @return list<array<string, mixed>> */
    private function journalByType(int $tahun, ?int $bulan): array
    {
        $bulanSql = $bulan ? ' AND MONTH(dtgljurnal) = ?' : '';
        $bindings = [$tahun];
        if ($bulan) {
            $bindings[] = $bulan;
        }

        $rows = $this->safeQuery(fn () => DB::connection(RsudConnections::ACC2026)->select("
            SELECT TOP 10 RTRIM(ckeljurnal) as jtype, COUNT(*) as cnt,
                   SUM(CAST(ndebet AS float)) as total_debet
            FROM JURNAL_H
            WHERE YEAR(dtgljurnal) = ? AND (lbatal IS NULL OR lbatal <> 1)
            {$bulanSql}
            GROUP BY RTRIM(ckeljurnal)
            ORDER BY cnt DESC
        ", $bindings), []);

        return array_map(fn ($r) => [
            'journal_type' => trim((string) $r->jtype),
            'label' => self::JOURNAL_TYPE_LABELS[trim((string) $r->jtype)] ?? trim((string) $r->jtype),
            'count' => (int) $r->cnt,
            'total_debet' => round((float) $r->total_debet, 2),
        ], $rows);
    }

    /** @return list<array<string, mixed>> */
    private function monthlyJournalTrend(int $tahun): array
    {
        $rows = $this->safeQuery(fn () => DB::connection(RsudConnections::ACC2026)->select("
            SELECT MONTH(dtgljurnal) as bln, COUNT(*) as cnt,
                   SUM(CAST(ndebet AS float)) as debet, SUM(CAST(nkredit AS float)) as kredit
            FROM JURNAL_H
            WHERE YEAR(dtgljurnal) = ? AND (lbatal IS NULL OR lbatal <> 1)
            GROUP BY MONTH(dtgljurnal) ORDER BY bln
        ", [$tahun]), []);

        $byMonth = collect($rows)->keyBy(fn ($r) => (int) $r->bln);
        $trend = [];
        for ($m = 1; $m <= 12; $m++) {
            $r = $byMonth->get($m);
            $trend[] = [
                'bulan' => $m,
                'label' => self::BULAN_LABELS[$m],
                'count' => (int) ($r->cnt ?? 0),
                'debet' => round((float) ($r->debet ?? 0), 2),
                'kredit' => round((float) ($r->kredit ?? 0), 2),
            ];
        }

        return $trend;
    }

    /** @return list<array<string, mixed>> */
    private function recentJournals(int $tahun, int $limit): array
    {
        $rows = $this->safeQuery(fn () => DB::connection(RsudConnections::ACC2026)->select("
            SELECT TOP {$limit} h.cnojurnal, h.dtgljurnal, h.cket, h.ckeljurnal,
                   CAST(h.ndebet AS float) as debet, h.lsdhproses, h.lvalid
            FROM JURNAL_H h
            WHERE YEAR(h.dtgljurnal) = ? AND (h.lbatal IS NULL OR h.lbatal <> 1)
            ORDER BY h.dtgljurnal DESC, h.cnojurnal DESC
        ", [$tahun]), []);

        return array_map(fn ($r) => $this->formatJournalRow($r), $rows);
    }

    /** @return array{months: list<array<string, mixed>>, closed_count: int, open_count: int, current_open_month: int|null} */
    private function tutupBukuStatus(): array
    {
        $rows = $this->safeQuery(fn () => DB::connection(RsudConnections::ACC2026)
            ->table('TABBULAN')
            ->orderBy('BULAN')
            ->get(['BULAN', 'LTUTUP', 'CKET']), collect());

        $months = $rows->map(fn ($r) => [
            'bulan' => (int) $r->BULAN,
            'label' => trim((string) ($r->CKET ?? self::BULAN_LABELS[(int) $r->BULAN] ?? '')),
            'closed' => ((int) ($r->LTUTUP ?? 0)) === 1,
        ])->values()->all();

        $closedCount = count(array_filter($months, fn ($m) => $m['closed']));
        $openMonths = array_values(array_filter($months, fn ($m) => ! $m['closed']));

        return [
            'months' => $months,
            'closed_count' => $closedCount,
            'open_count' => count($months) - $closedCount,
            'current_open_month' => $openMonths[0]['bulan'] ?? null,
        ];
    }

    private function coaCount(bool $detailOnly = false): int
    {
        $sql = 'SELECT COUNT(*) as cnt FROM CHARTACC WHERE (lbatal IS NULL OR lbatal <> 1)';
        if ($detailOnly) {
            $sql .= ' AND ldetail = 1';
        }

        return (int) ($this->safeQuery(fn () => DB::connection(RsudConnections::ACC2026)->selectOne($sql), null)?->cnt ?? 0);
    }

    private function formatJournalRow(object $r): array
    {
        $type = trim((string) ($r->ckeljurnal ?? ''));

        return [
            'no_jurnal' => trim((string) ($r->cnojurnal ?? '')),
            'tanggal' => isset($r->dtgljurnal) && $r->dtgljurnal
                ? date('Y-m-d', strtotime((string) $r->dtgljurnal))
                : null,
            'keterangan' => trim((string) ($r->cket ?? '')),
            'no_bukti' => trim((string) ($r->cnobukti ?? '')),
            'journal_type' => $type,
            'journal_type_label' => self::JOURNAL_TYPE_LABELS[$type] ?? $type,
            'debet' => round((float) ($r->debet ?? $r->ndebet ?? 0), 2),
            'kredit' => round((float) ($r->kredit ?? $r->nkredit ?? 0), 2),
            'account_no' => trim((string) ($r->cno_acc ?? '')),
            'account_name' => trim((string) ($r->cnm_acc ?? '')),
            'posted' => ((int) ($r->lsdhproses ?? 0)) === 1,
            'valid' => ((int) ($r->lvalid ?? 0)) === 1,
        ];
    }

    private function chartaccSaldo(object $r): float
    {
        $debet = (float) ($r->saldo_debet ?? $r->nsldodeb ?? 0);
        $kredit = (float) ($r->saldo_kredit ?? $r->nsldokre ?? 0);
        $normal = trim((string) ($r->normal_balance ?? $r->lnrckiri ?? 'L'));

        return round($normal === 'L' ? ($debet - $kredit) : ($kredit - $debet), 2);
    }

    /**
     * @param  list<string>  $items
     */
    private function inClause(array $items): string
    {
        return implode(',', array_fill(0, count($items), '?'));
    }

    /**
     * @template T
     * @param  callable(): T  $fn
     * @return T
     */
    private function safeQuery(callable $fn, mixed $fallback = null): mixed
    {
        try {
            return $fn();
        } catch (\Throwable) {
            return $fallback;
        }
    }
}
