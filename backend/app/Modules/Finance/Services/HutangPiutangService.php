<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\BudgetYear;
use App\Support\RsudConnections;
use Illuminate\Support\Facades\DB;

class HutangPiutangService
{
    private const BULAN_LABELS = [
        1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'Mei', 6 => 'Jun',
        7 => 'Jul', 8 => 'Agu', 9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des',
    ];

    /** @var array<string, list<string>> */
    private const HUTANG_JENIS_COA = [
        'vendor' => ['2.1.01.04.01.01.04', '2.1.01.04.01.01.02', '2.1.01.04.01.01.03'],
        'bekkes' => ['2.1.01.03.01.01.06', '2.1.01.04.01.01.02', '2.1.01.04.01.01.03'],
        'jasa' => ['2.1.01.03.01.01.03', '2.1.01.03.01.01.01', '2.1.01.03.01.01.05', '2.1.01.03.01.01.02'],
    ];

    /** @var array<string, list<string>> */
    private const PIUTANG_JENIS_COA = [
        'bpjs' => ['1.1.02.01.01.01.01', '1.1.02.01.02.01.01'],
        'tunai' => ['1.1.02.01.01.01.04'],
        'asuransi' => ['1.1.02.01.01.01.03', '1.1.02.01.01.01.06', '1.1.02.01.01.01.05', '1.1.02.01.01.01.07'],
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
            'bulan_options' => collect(self::BULAN_LABELS)
                ->map(fn (string $label, int $value) => ['value' => $value, 'label' => $label])
                ->values()->all(),
            'hutang_jenis_options' => [
                ['value' => 'vendor', 'label' => 'Vendor / Pihak Ketiga'],
                ['value' => 'bekkes', 'label' => 'Bekkes / Persediaan Medis'],
                ['value' => 'jasa', 'label' => 'Jasa'],
            ],
            'piutang_jenis_options' => [
                ['value' => 'bpjs', 'label' => 'BPJS / JKN'],
                ['value' => 'tunai', 'label' => 'Tunai / Pasien Umum'],
                ['value' => 'asuransi', 'label' => 'Asuransi / Jaminan Perusahaan'],
            ],
            'sources' => [
                'hutang' => 'ACC2026.JURNAL_H/E — akun kewajiban 2.1.01.03/04',
                'piutang' => 'ACC2026.JURNAL_H/E — akun piutang 1.1.02.01',
            ],
        ];
    }

    /**
     * @param  array{tahun: int, bulan?: int|null}  $filters
     */
    public function dashboard(array $filters): array
    {
        $tahun = (int) $filters['tahun'];
        $bulan = isset($filters['bulan']) ? (int) $filters['bulan'] : null;

        $hutangCoa = $this->allHutangCoa();
        $piutangCoa = $this->allPiutangCoa();

        $hutangSaldo = $this->netSaldoHutang($hutangCoa, $tahun, $bulan);
        $piutangSaldo = $this->netSaldoPiutang($piutangCoa, $tahun, $bulan);

        $hutangByJenis = [];
        foreach (self::HUTANG_JENIS_COA as $jenis => $coaList) {
            $hutangByJenis[] = [
                'jenis' => $jenis,
                'saldo' => $this->netSaldoHutang($coaList, $tahun, $bulan),
            ];
        }

        $piutangByJenis = [];
        foreach (self::PIUTANG_JENIS_COA as $jenis => $coaList) {
            $piutangByJenis[] = [
                'jenis' => $jenis,
                'saldo' => $this->netSaldoPiutang($coaList, $tahun, $bulan),
            ];
        }

        return [
            'filters' => ['tahun' => $tahun, 'bulan' => $bulan],
            'kpis' => [
                'total_hutang' => $hutangSaldo,
                'total_piutang' => $piutangSaldo,
                'net_posisi' => round($piutangSaldo - $hutangSaldo, 2),
                'hutang_vendor' => $this->netSaldoHutang(self::HUTANG_JENIS_COA['vendor'], $tahun, $bulan),
                'piutang_bpjs' => $this->netSaldoPiutang(self::PIUTANG_JENIS_COA['bpjs'], $tahun, $bulan),
                'piutang_tunai' => $this->netSaldoPiutang(self::PIUTANG_JENIS_COA['tunai'], $tahun, $bulan),
            ],
            'hutang_composition' => $hutangByJenis,
            'piutang_composition' => $piutangByJenis,
            'trend' => $this->monthlyTrend($tahun),
            'aging' => $this->piutangAging($piutangCoa, $tahun),
            'hutang_per_akun' => $this->saldoPerCoa($hutangCoa, $tahun, $bulan, 'hutang'),
            'piutang_per_akun' => $this->saldoPerCoa($piutangCoa, $tahun, $bulan, 'piutang'),
        ];
    }

    /**
     * @param  array{
     *   tahun: int, bulan?: int|null, jenis?: string|null, periode?: string|null,
     *   search?: string|null, page?: int, per_page?: int
     * }  $filters
     */
    public function hutangDaftar(array $filters): array
    {
        $coaList = $this->resolveHutangCoa($filters['jenis'] ?? null);

        return $this->journalLinesPaginated($coaList, $filters, 'hutang');
    }

    /**
     * @param  array{tahun: int, bulan?: int|null, jenis?: string|null, periode?: string|null}  $filters
     */
    public function hutangPerAkun(array $filters): array
    {
        $coaList = $this->resolveHutangCoa($filters['jenis'] ?? null);
        $rows = $this->saldoPerCoa($coaList, (int) $filters['tahun'], $filters['bulan'] ?? null, 'hutang');

        return [
            'rows' => $rows,
            'summary' => [
                'tahun' => (int) $filters['tahun'],
                'total_saldo' => round(array_sum(array_column($rows, 'saldo')), 2),
                'jumlah_akun' => count($rows),
            ],
        ];
    }

    /**
     * @param  array{
     *   tahun: int, bulan?: int|null, jenis?: string|null,
     *   search?: string|null, page?: int, per_page?: int
     * }  $filters
     */
    public function piutangDaftar(array $filters): array
    {
        $coaList = $this->resolvePiutangCoa($filters['jenis'] ?? null);

        return $this->journalLinesPaginated($coaList, $filters, 'piutang');
    }

    /**
     * @param  array{tahun: int, jenis?: string|null}  $filters
     */
    public function piutangUmur(array $filters): array
    {
        $coaList = $this->resolvePiutangCoa($filters['jenis'] ?? null);
        $aging = $this->piutangAgingDetail($coaList, (int) $filters['tahun']);

        return [
            'buckets' => $aging['buckets'],
            'rows' => $aging['rows'],
            'summary' => [
                'tahun' => (int) $filters['tahun'],
                'total_outstanding' => $aging['total_outstanding'],
                'jumlah_faktur' => count($aging['rows']),
            ],
        ];
    }

    /**
     * @param  array{
     *   tahun: int, bulan?: int|null, jenis?: string|null,
     *   search?: string|null, page?: int, per_page?: int
     * }  $filters
     */
    public function rekonsiliasiHutang(array $filters): array
    {
        $result = $this->journalLinesPaginated(
            $this->resolveHutangCoa($filters['jenis'] ?? null),
            array_merge($filters, ['per_page' => $filters['per_page'] ?? 20]),
            'hutang'
        );

        $matched = 0;
        $pending = 0;
        foreach ($result['rows'] as &$row) {
            $hasBku = trim((string) ($row['no_bku'] ?? '')) !== '';
            $hasBeli = trim((string) ($row['no_beli'] ?? '')) !== '';
            $row['rekon_status'] = ($hasBku || $hasBeli) ? 'matched' : 'pending';
            $row['rekon_status'] === 'matched' ? $matched++ : $pending++;
        }
        unset($row);

        return [
            'rows' => $result['rows'],
            'summary' => [
                'total_matched' => $matched,
                'total_pending' => $pending,
                'total_items' => $result['meta']['total'],
            ],
            'meta' => $result['meta'],
        ];
    }

    /**
     * @param  array{
     *   tahun: int, bulan?: int|null, jenis?: string|null,
     *   search?: string|null, page?: int, per_page?: int
     * }  $filters
     */
    public function rekonsiliasiPiutang(array $filters): array
    {
        $result = $this->journalLinesPaginated(
            $this->resolvePiutangCoa($filters['jenis'] ?? null),
            array_merge($filters, ['per_page' => $filters['per_page'] ?? 20]),
            'piutang'
        );

        $matched = 0;
        $pending = 0;
        foreach ($result['rows'] as &$row) {
            $hasReg = trim((string) ($row['no_reg'] ?? '')) !== '';
            $row['rekon_status'] = $hasReg ? 'matched' : 'pending';
            $row['rekon_status'] === 'matched' ? $matched++ : $pending++;
        }
        unset($row);

        return [
            'rows' => $result['rows'],
            'summary' => [
                'total_matched' => $matched,
                'total_pending' => $pending,
                'total_items' => $result['meta']['total'],
            ],
            'meta' => $result['meta'],
        ];
    }

    /**
     * @param  array{
     *   tahun: int, bulan?: int|null, tipe?: string|null,
     *   search?: string|null, page?: int, per_page?: int
     * }  $filters
     */
    public function riwayat(array $filters): array
    {
        $hutang = $this->fetchJournalLines($this->allHutangCoa(), $filters, 'hutang');
        $piutang = $this->fetchJournalLines($this->allPiutangCoa(), $filters, 'piutang');

        $all = array_merge(
            array_map(fn ($r) => [...$r, 'tipe' => 'hutang'], $hutang),
            array_map(fn ($r) => [...$r, 'tipe' => 'piutang'], $piutang)
        );

        usort($all, fn ($a, $b) => strcmp($b['tanggal'] ?? '', $a['tanggal'] ?? ''));

        $tipeFilter = $filters['tipe'] ?? null;
        if ($tipeFilter && in_array($tipeFilter, ['hutang', 'piutang'], true)) {
            $all = array_values(array_filter($all, fn ($r) => $r['tipe'] === $tipeFilter));
        }

        $total = count($all);
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(10, (int) ($filters['per_page'] ?? 20)));
        $offset = ($page - 1) * $perPage;

        return [
            'rows' => array_slice($all, $offset, $perPage),
            'meta' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => max(1, (int) ceil($total / $perPage)),
            ],
        ];
    }

    /** @return list<string> */
    private function allHutangCoa(): array
    {
        return array_values(array_unique(array_merge(...array_values(self::HUTANG_JENIS_COA))));
    }

    /** @return list<string> */
    private function allPiutangCoa(): array
    {
        return array_values(array_unique(array_merge(...array_values(self::PIUTANG_JENIS_COA))));
    }

    /** @return list<string> */
    private function resolveHutangCoa(?string $jenis): array
    {
        if ($jenis && isset(self::HUTANG_JENIS_COA[$jenis])) {
            return self::HUTANG_JENIS_COA[$jenis];
        }

        return $this->allHutangCoa();
    }

    /** @return list<string> */
    private function resolvePiutangCoa(?string $jenis): array
    {
        if ($jenis && isset(self::PIUTANG_JENIS_COA[$jenis])) {
            return self::PIUTANG_JENIS_COA[$jenis];
        }

        return $this->allPiutangCoa();
    }

    /**
     * @param  list<string>  $coaList
     */
    private function netSaldoHutang(array $coaList, int $tahun, ?int $bulan): float
    {
        if ($coaList === []) {
            return 0.0;
        }

        [$yearSql, $yearBindings] = $this->yearFilterSql($tahun, null, 'h');
        $bulanSql = '';
        $bindings = $coaList;
        if ($bulan) {
            $bulanSql = ' AND MONTH(h.dtgljurnal) = ?';
        }

        $inClause = $this->inClause($coaList);
        $bindings = array_merge($bindings, $yearBindings);
        if ($bulan) {
            $bindings[] = $bulan;
        }

        $row = DB::connection(RsudConnections::ACC2026)->selectOne("
            SELECT SUM(CAST(e.nkredit AS float)) - SUM(CAST(e.ndebet AS float)) as saldo
            FROM JURNAL_E e INNER JOIN JURNAL_H h ON h.cnojurnal = e.cnojurnal
            WHERE RTRIM(e.cno_acc) IN ({$inClause})
              AND {$yearSql}
              AND (h.lbatal IS NULL OR h.lbatal <> 1)
              {$bulanSql}
        ", $bindings);

        return round((float) ($row->saldo ?? 0), 2);
    }

    /**
     * @param  list<string>  $coaList
     */
    private function netSaldoPiutang(array $coaList, int $tahun, ?int $bulan): float
    {
        if ($coaList === []) {
            return 0.0;
        }

        [$yearSql, $yearBindings] = $this->yearFilterSql($tahun, null, 'h');
        $bulanSql = '';
        $bindings = $coaList;
        if ($bulan) {
            $bulanSql = ' AND MONTH(h.dtgljurnal) = ?';
        }

        $inClause = $this->inClause($coaList);
        $bindings = array_merge($bindings, $yearBindings);
        if ($bulan) {
            $bindings[] = $bulan;
        }

        $row = DB::connection(RsudConnections::ACC2026)->selectOne("
            SELECT SUM(CAST(e.ndebet AS float)) - SUM(CAST(e.nkredit AS float)) as saldo
            FROM JURNAL_E e INNER JOIN JURNAL_H h ON h.cnojurnal = e.cnojurnal
            WHERE RTRIM(e.cno_acc) IN ({$inClause})
              AND {$yearSql}
              AND (h.lbatal IS NULL OR h.lbatal <> 1)
              {$bulanSql}
        ", $bindings);

        return round((float) ($row->saldo ?? 0), 2);
    }

    /**
     * @param  list<string>  $coaList
     * @return list<array<string, mixed>>
     */
    private function saldoPerCoa(array $coaList, int $tahun, ?int $bulan, string $type): array
    {
        if ($coaList === []) {
            return [];
        }

        [$yearSql, $yearBindings] = $this->yearFilterSql($tahun, null, 'h');
        $bulanSql = '';
        $bindings = $coaList;
        if ($bulan) {
            $bulanSql = ' AND MONTH(h.dtgljurnal) = ?';
        }

        $inClause = $this->inClause($coaList);
        $bindings = array_merge($bindings, $yearBindings);
        if ($bulan) {
            $bindings[] = $bulan;
        }

        $saldoExpr = $type === 'hutang'
            ? 'SUM(CAST(e.nkredit AS float)) - SUM(CAST(e.ndebet AS float))'
            : 'SUM(CAST(e.ndebet AS float)) - SUM(CAST(e.nkredit AS float))';

        $rows = DB::connection(RsudConnections::ACC2026)->select("
            SELECT RTRIM(e.cno_acc) as account_no, MAX(e.cnm_acc) as account_name,
                   COUNT(*) as jumlah, {$saldoExpr} as saldo
            FROM JURNAL_E e INNER JOIN JURNAL_H h ON h.cnojurnal = e.cnojurnal
            WHERE RTRIM(e.cno_acc) IN ({$inClause})
              AND {$yearSql}
              AND (h.lbatal IS NULL OR h.lbatal <> 1)
              {$bulanSql}
            GROUP BY RTRIM(e.cno_acc)
            HAVING {$saldoExpr} <> 0
            ORDER BY saldo DESC
        ", $bindings);

        return array_map(fn ($r) => [
            'account_no' => trim((string) $r->account_no),
            'account_name' => trim((string) $r->account_name),
            'jumlah' => (int) $r->jumlah,
            'saldo' => round((float) $r->saldo, 2),
        ], $rows);
    }

    /**
     * @param  list<string>  $coaList
     * @param  array<string, mixed>  $filters
     * @return array{rows: list<array<string, mixed>>, meta: array<string, int>}
     */
    private function journalLinesPaginated(array $coaList, array $filters, string $type): array
    {
        $all = $this->fetchJournalLines($coaList, $filters, $type);
        $total = count($all);
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(10, (int) ($filters['per_page'] ?? 20)));
        $offset = ($page - 1) * $perPage;

        return [
            'rows' => array_slice($all, $offset, $perPage),
            'meta' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => max(1, (int) ceil($total / $perPage)),
            ],
        ];
    }

    /**
     * @param  list<string>  $coaList
     * @param  array<string, mixed>  $filters
     * @return list<array<string, mixed>>
     */
    private function fetchJournalLines(array $coaList, array $filters, string $type): array
    {
        if ($coaList === []) {
            return [];
        }

        $tahun = (int) $filters['tahun'];
        $periode = $filters['periode'] ?? null;
        [$yearSql, $yearBindings] = $this->yearFilterSql($tahun, $periode, 'h');

        $bindings = $coaList;
        $bulanSql = '';
        if (! empty($filters['bulan'])) {
            $bulanSql = ' AND MONTH(h.dtgljurnal) = ?';
        }

        $searchSql = '';
        if (! empty($filters['search'])) {
            $searchSql = ' AND (h.cnojurnal LIKE ? OR h.cket LIKE ? OR h.cnobeli LIKE ? OR h.cnobku LIKE ?)';
        }

        $inClause = $this->inClause($coaList);
        $bindings = array_merge($bindings, $yearBindings);
        if (! empty($filters['bulan'])) {
            $bindings[] = (int) $filters['bulan'];
        }
        if (! empty($filters['search'])) {
            $term = '%'.$filters['search'].'%';
            array_push($bindings, $term, $term, $term, $term);
        }

        $rows = DB::connection(RsudConnections::ACC2026)->select("
            SELECT h.cnojurnal, h.dtgljurnal, h.cket, h.ckeljurnal, h.cnobeli, h.cnobku,
                   h.cnoreg, h.cnomr, RTRIM(e.cno_acc) as cno_acc, e.cnm_acc,
                   CAST(e.ndebet AS float) as ndebet, CAST(e.nkredit AS float) as nkredit
            FROM JURNAL_H h INNER JOIN JURNAL_E e ON h.cnojurnal = e.cnojurnal
            WHERE RTRIM(e.cno_acc) IN ({$inClause})
              AND {$yearSql}
              AND (h.lbatal IS NULL OR h.lbatal <> 1)
              {$bulanSql}
              {$searchSql}
            ORDER BY h.dtgljurnal DESC, h.cnojurnal DESC
        ", $bindings);

        $result = [];
        foreach ($rows as $row) {
            $debet = round((float) ($row->ndebet ?? 0), 2);
            $kredit = round((float) ($row->nkredit ?? 0), 2);
            $jenis = $this->resolveJenisFromCoa(trim((string) $row->cno_acc), $type);

            if ($type === 'hutang') {
                $amount = $kredit > 0 ? $kredit : $debet;
                $status = $debet > $kredit ? 'dibayar' : ($kredit > $debet ? 'terutang' : 'netral');
            } else {
                $amount = $debet > 0 ? $debet : $kredit;
                $status = $kredit > $debet ? 'lunas' : ($debet > $kredit ? 'outstanding' : 'netral');
            }

            $result[] = [
                'no_jurnal' => trim((string) $row->cnojurnal),
                'tanggal' => $row->dtgljurnal ? date('Y-m-d', strtotime((string) $row->dtgljurnal)) : null,
                'keterangan' => trim((string) ($row->cket ?? '')),
                'jenis_jurnal' => trim((string) ($row->ckeljurnal ?? '')),
                'account_no' => trim((string) $row->cno_acc),
                'account_name' => trim((string) $row->cnm_acc),
                'jenis' => $jenis,
                'debet' => $debet,
                'kredit' => $kredit,
                'amount' => $amount,
                'status' => $status,
                'no_beli' => trim((string) ($row->cnobeli ?? '')),
                'no_bku' => trim((string) ($row->cnobku ?? '')),
                'no_reg' => trim((string) ($row->cnoreg ?? '')),
                'no_mr' => trim((string) ($row->cnomr ?? '')),
            ];
        }

        return $result;
    }

    /**
     * @param  list<string>  $coaList
     * @return array{buckets: list<array<string, mixed>>, rows: list<array<string, mixed>>, total_outstanding: float}
     */
    private function piutangAgingDetail(array $coaList, int $tahun): array
    {
        $filters = ['tahun' => $tahun];
        $lines = $this->fetchJournalLines($coaList, $filters, 'piutang');

        $openLines = array_values(array_filter($lines, fn ($l) => $l['status'] === 'outstanding' && $l['debet'] > $l['kredit']));

        $bucketDefs = [
            ['key' => '0-30', 'label' => '0–30 hari', 'min' => 0, 'max' => 30],
            ['key' => '31-60', 'label' => '31–60 hari', 'min' => 31, 'max' => 60],
            ['key' => '61-90', 'label' => '61–90 hari', 'min' => 61, 'max' => 90],
            ['key' => '91-180', 'label' => '91–180 hari', 'min' => 91, 'max' => 180],
            ['key' => '180+', 'label' => '>180 hari', 'min' => 181, 'max' => 99999],
        ];

        $buckets = array_fill_keys(array_column($bucketDefs, 'key'), 0.0);
        $agingRows = [];
        $today = new \DateTimeImmutable('today');

        foreach ($openLines as $line) {
            if (! $line['tanggal']) {
                continue;
            }
            $dt = new \DateTimeImmutable($line['tanggal']);
            $days = (int) $today->diff($dt)->days;
            $outstanding = round($line['debet'] - $line['kredit'], 2);

            foreach ($bucketDefs as $b) {
                if ($days >= $b['min'] && $days <= $b['max']) {
                    $buckets[$b['key']] += $outstanding;
                    $agingRows[] = [
                        ...$line,
                        'umur_hari' => $days,
                        'bucket' => $b['key'],
                        'bucket_label' => $b['label'],
                        'outstanding' => $outstanding,
                    ];
                    break;
                }
            }
        }

        usort($agingRows, fn ($a, $b) => $b['umur_hari'] <=> $a['umur_hari']);

        return [
            'buckets' => array_map(fn ($b) => [
                'key' => $b['key'],
                'label' => $b['label'],
                'amount' => round($buckets[$b['key']], 2),
            ], $bucketDefs),
            'rows' => array_slice($agingRows, 0, 100),
            'total_outstanding' => round(array_sum($buckets), 2),
        ];
    }

    /**
     * @param  list<string>  $coaList
     * @return list<array<string, mixed>>
     */
    private function piutangAging(array $coaList, int $tahun): array
    {
        return $this->piutangAgingDetail($coaList, $tahun)['buckets'];
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function monthlyTrend(int $tahun): array
    {
        $hutangCoa = $this->allHutangCoa();
        $piutangCoa = $this->allPiutangCoa();
        $trend = [];

        for ($m = 1; $m <= 12; $m++) {
            $trend[] = [
                'bulan' => $m,
                'month' => self::BULAN_LABELS[$m],
                'hutang' => $this->netSaldoHutang($hutangCoa, $tahun, $m),
                'piutang' => $this->netSaldoPiutang($piutangCoa, $tahun, $m),
            ];
        }

        return $trend;
    }

    /**
     * @return array{0: string, 1: list<mixed>}
     */
    private function yearFilterSql(int $tahun, ?string $periode, string $alias): array
    {
        if ($periode === 'sebelumnya') {
            return ["YEAR({$alias}.dtgljurnal) < ?", [$tahun]];
        }

        return ["YEAR({$alias}.dtgljurnal) = ?", [$tahun]];
    }

    /** @param  list<string>  $items */
    private function inClause(array $items): string
    {
        return implode(',', array_fill(0, count($items), '?'));
    }

    private function resolveJenisFromCoa(string $coa, string $type): string
    {
        $map = $type === 'hutang' ? self::HUTANG_JENIS_COA : self::PIUTANG_JENIS_COA;
        foreach ($map as $jenis => $list) {
            if (in_array($coa, $list, true)) {
                return $jenis;
            }
        }

        return 'lainnya';
    }
}
