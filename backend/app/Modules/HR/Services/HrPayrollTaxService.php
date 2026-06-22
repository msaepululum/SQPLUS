<?php

namespace App\Modules\HR\Services;

use App\Support\RsudConnections;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class HrPayrollTaxService
{
    public function schema(): array
    {
        $config = config('hr_ter');
        $categories = [];

        foreach ($config['categories'] as $code => $cat) {
            $categories[] = [
                'code' => $code,
                'label' => $cat['label'],
                'description' => $cat['description'],
                'ptkp_codes' => $cat['ptkp_codes'],
                'brackets' => collect($cat['brackets'])
                    ->take(15)
                    ->values()
                    ->map(fn ($b, $i) => [
                        'tier' => $i + 1,
                        'max_bruto' => $b['max'] === PHP_INT_MAX ? null : $b['max'],
                        'rate' => $b['rate'],
                    ])
                    ->all(),
                'bracket_count' => count($cat['brackets']),
            ];
        }

        return [
            'scheme' => $config['scheme'],
            'effective_year' => $config['effective_year'],
            'formula' => 'PPh 21 = Penghasilan Bruto Bulanan × Tarif TER (%)',
            'categories' => $categories,
            'ptkp_reference' => $this->ptkpReference(),
            'finance_link' => [
                'module' => 'finance.tax',
                'path' => '/finance/tax/rekap-bulanan',
                'label' => 'Rekap Pajak Keuangan',
                'note' => 'Total PPh 21 pegawai dari payroll akan dicocokkan dengan setoran pajak di modul Keuangan.',
            ],
        ];
    }

    /**
     * @param  array{tahun?: int, bulan?: int, search?: string, page?: int, per_page?: int}  $filters
     */
    public function periodSummary(array $filters = []): array
    {
        $tahun = (int) ($filters['tahun'] ?? now()->year);
        $bulan = (int) ($filters['bulan'] ?? now()->month);
        $cacheKey = "hr_payroll_tax_summary:{$tahun}:{$bulan}";

        return Cache::remember($cacheKey, 120, fn () => $this->buildPeriodSummary($tahun, $bulan));
    }

    /**
     * @param  array{tahun?: int, bulan?: int, search?: string, page?: int, per_page?: int}  $filters
     */
    public function employeeList(array $filters = []): array
    {
        $tahun = (int) ($filters['tahun'] ?? now()->year);
        $bulan = (int) ($filters['bulan'] ?? now()->month);
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(50, max(10, (int) ($filters['per_page'] ?? 20)));
        $search = trim((string) ($filters['search'] ?? ''));

        $result = $this->fetchGajianRows($tahun, $bulan, $search, $page, $perPage);

        if ($result !== null) {
            return $result;
        }

        return [
            'data' => [],
            'total' => 0,
            'current_page' => $page,
            'last_page' => 1,
            'per_page' => $perPage,
            'source' => 'sqplus',
            'tahun' => $tahun,
            'bulan' => $bulan,
        ];
    }

    public function employeeMe(?string $noAbsen, ?string $employeeCode): ?array
    {
        $code = trim((string) ($employeeCode ?? $noAbsen ?? ''));
        if ($code === '') {
            return null;
        }

        $tahun = (int) now()->year;
        $bulan = (int) now()->month;

        $row = $this->safeQuery(
            fn () => DB::connection(RsudConnections::PAYROLL)->selectOne("
                SELECT TOP 1
                    g.cnrp,
                    g.ntahun,
                    g.nbulan,
                    g.nkotor,
                    g.npotong,
                    g.npph21,
                    g.npph21_k,
                    g.npph21_p,
                    g.nptkpthn,
                    g.ckdptkp,
                    g.nbersih,
                    p.cnmpeg AS name,
                    p.cnmptkp,
                    p.cnmsubunit AS unit
                FROM GAJIAN g
                LEFT JOIN PEGAWAI p ON LTRIM(RTRIM(p.cnrp)) = LTRIM(RTRIM(g.cnrp))
                WHERE LTRIM(RTRIM(g.cnrp)) = ?
                ORDER BY g.ntahun DESC, g.nbulan DESC
            ", [$code]),
            null
        );

        if ($row === null) {
            return null;
        }

        return $this->mapTaxRow($row);
    }

    public function calculateTer(float $grossMonthly, string $ptkpCode): array
    {
        $category = $this->terCategoryFromPtkp($ptkpCode);
        $rate = $this->terRate($grossMonthly, $category);
        $tax = round($grossMonthly * $rate / 100, 0);

        return [
            'penghasilan_bruto' => $grossMonthly,
            'ptkp_code' => strtoupper(trim($ptkpCode)),
            'ter_category' => $category,
            'ter_rate' => $rate,
            'pph21_ter' => $tax,
            'penghasilan_netto' => max(0, $grossMonthly - $tax),
        ];
    }

    private function buildPeriodSummary(int $tahun, int $bulan): array
    {
        $row = $this->safeQuery(
            fn () => DB::connection(RsudConnections::PAYROLL)->selectOne("
                SELECT
                    COUNT(*) AS jumlah_pegawai,
                    SUM(CAST(ISNULL(nkotor, 0) AS FLOAT)) AS total_bruto,
                    SUM(CAST(ISNULL(npph21, 0) AS FLOAT)) AS total_pph21,
                    SUM(CAST(ISNULL(npph21_k, 0) AS FLOAT)) AS total_pph21_kinerja,
                    SUM(CAST(ISNULL(npph21_p, 0) AS FLOAT)) AS total_pph21_pks,
                    SUM(CAST(ISNULL(npotong, 0) AS FLOAT)) AS total_potongan,
                    SUM(CAST(ISNULL(nbersih, 0) AS FLOAT)) AS total_bersih
                FROM GAJIAN
                WHERE ntahun = ? AND nbulan = ?
            ", [$tahun, $bulan]),
            null
        );

        $bulanLabel = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
            7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ][$bulan] ?? (string) $bulan;

        if ($row === null) {
            return [
                'tahun' => $tahun,
                'bulan' => $bulan,
                'bulan_label' => $bulanLabel,
                'period_code' => sprintf('%04d-%02d', $tahun, $bulan),
                'period_name' => "Gaji {$bulanLabel} {$tahun}",
                'source' => 'sqplus',
                'kpi' => [
                    'jumlah_pegawai' => 0,
                    'total_bruto' => 0,
                    'total_pph21' => 0,
                    'total_pph21_kinerja' => 0,
                    'total_pph21_pks' => 0,
                    'total_potongan' => 0,
                    'total_bersih' => 0,
                ],
                'finance_link' => $this->financeLinkPayload($tahun, $bulan, 0),
            ];
        }

        $totalPph21 = (float) ($row->total_pph21 ?? 0)
            + (float) ($row->total_pph21_kinerja ?? 0)
            + (float) ($row->total_pph21_pks ?? 0);

        return [
            'tahun' => $tahun,
            'bulan' => $bulan,
            'bulan_label' => $bulanLabel,
            'period_code' => sprintf('%04d-%02d', $tahun, $bulan),
            'period_name' => "Gaji {$bulanLabel} {$tahun}",
            'source' => 'payroll',
            'scheme' => 'TER',
            'kpi' => [
                'jumlah_pegawai' => (int) ($row->jumlah_pegawai ?? 0),
                'total_bruto' => round((float) ($row->total_bruto ?? 0), 2),
                'total_pph21' => round((float) ($row->total_pph21 ?? 0), 2),
                'total_pph21_kinerja' => round((float) ($row->total_pph21_kinerja ?? 0), 2),
                'total_pph21_pks' => round((float) ($row->total_pph21_pks ?? 0), 2),
                'total_pph21_all' => round($totalPph21, 2),
                'total_potongan' => round((float) ($row->total_potongan ?? 0), 2),
                'total_bersih' => round((float) ($row->total_bersih ?? 0), 2),
            ],
            'finance_link' => $this->financeLinkPayload($tahun, $bulan, $totalPph21),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function fetchGajianRows(int $tahun, int $bulan, string $search, int $page, int $perPage): ?array
    {
        $offset = ($page - 1) * $perPage;
        $where = 'WHERE g.ntahun = ? AND g.nbulan = ?';
        $bindings = [$tahun, $bulan];

        if ($search !== '') {
            $where .= ' AND (p.cnmpeg LIKE ? OR g.cnrp LIKE ?)';
            $like = '%'.$search.'%';
            $bindings[] = $like;
            $bindings[] = $like;
        }

        $result = $this->safeQuery(function () use ($where, $bindings, $offset, $perPage) {
            $countRow = DB::connection(RsudConnections::PAYROLL)->selectOne("
                SELECT COUNT(*) AS cnt
                FROM GAJIAN g
                LEFT JOIN PEGAWAI p ON LTRIM(RTRIM(p.cnrp)) = LTRIM(RTRIM(g.cnrp))
                {$where}
            ", $bindings);

            $rows = DB::connection(RsudConnections::PAYROLL)->select("
                SELECT
                    g.cnrp,
                    g.ntahun,
                    g.nbulan,
                    g.nkotor,
                    g.npotong,
                    g.npph21,
                    g.npph21_k,
                    g.npph21_p,
                    g.nptkpthn,
                    g.ckdptkp,
                    g.nbersih,
                    p.cnmpeg AS name,
                    p.cnmptkp,
                    p.cnmsubunit AS unit
                FROM GAJIAN g
                LEFT JOIN PEGAWAI p ON LTRIM(RTRIM(p.cnrp)) = LTRIM(RTRIM(g.cnrp))
                {$where}
                ORDER BY p.cnmpeg
                OFFSET {$offset} ROWS FETCH NEXT {$perPage} ROWS ONLY
            ", $bindings);

            return ['total' => (int) ($countRow->cnt ?? 0), 'rows' => $rows];
        }, null);

        if ($result === null) {
            return null;
        }

        return [
            'data' => array_map(fn ($row) => $this->mapTaxRow($row), $result['rows']),
            'total' => $result['total'],
            'current_page' => $page,
            'last_page' => max(1, (int) ceil($result['total'] / $perPage)),
            'per_page' => $perPage,
            'source' => 'payroll',
            'tahun' => $tahun,
            'bulan' => $bulan,
            'scheme' => 'TER',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function mapTaxRow(object $row): array
    {
        $gross = (float) ($row->nkotor ?? 0);
        $pph21 = (float) ($row->npph21 ?? 0);
        $pph21K = (float) ($row->npph21_k ?? 0);
        $pph21P = (float) ($row->npph21_p ?? 0);
        $ptkpCode = strtoupper(trim((string) ($row->ckdptkp ?? 'S')));
        $category = $this->terCategoryFromPtkp($ptkpCode);
        $terRate = $this->terRate($gross, $category);
        $terCalc = round($gross * $terRate / 100, 0);

        return [
            'employee_code' => trim((string) ($row->cnrp ?? '')),
            'name' => trim((string) ($row->name ?? '')),
            'unit' => trim((string) ($row->unit ?? '')),
            'tahun' => (int) ($row->ntahun ?? 0),
            'bulan' => (int) ($row->nbulan ?? 0),
            'penghasilan_bruto' => $gross,
            'potongan_lain' => (float) ($row->npotong ?? 0),
            'pph21' => $pph21,
            'pph21_kinerja' => $pph21K,
            'pph21_pks' => $pph21P,
            'pph21_total' => $pph21 + $pph21K + $pph21P,
            'penghasilan_bersih' => (float) ($row->nbersih ?? 0),
            'ptkp_code' => $ptkpCode,
            'ptkp_name' => trim((string) ($row->cnmptkp ?? '')),
            'ptkp_tahunan' => (float) ($row->nptkpthn ?? 0),
            'ter_category' => $category,
            'ter_rate' => $terRate,
            'pph21_ter_simulasi' => $terCalc,
            'selisih_payroll' => round($pph21 - $terCalc, 0),
            'source' => 'payroll',
        ];
    }

    /**
     * @return list<array{code: string, name: string, ptkp_tahunan: float}>
     */
    private function ptkpReference(): array
    {
        $rows = $this->safeQuery(
            fn () => DB::connection(RsudConnections::PAYROLL)->select('
                SELECT LTRIM(RTRIM(ckdptkp)) AS code, LTRIM(RTRIM(cnmptkp)) AS name, nptkpthn
                FROM PTKP
                ORDER BY ckdptkp
            '),
            []
        );

        return array_map(fn ($r) => [
            'code' => (string) $r->code,
            'name' => (string) $r->name,
            'ptkp_tahunan' => (float) ($r->nptkpthn ?? 0),
            'ter_category' => $this->terCategoryFromPtkp((string) $r->code),
        ], $rows);
    }

    private function terCategoryFromPtkp(string $code): string
    {
        $code = strtoupper(preg_replace('/\s+/', '', trim($code)) ?? '');

        return match ($code) {
            'K1', 'K2' => 'B',
            'K3' => 'C',
            default => 'A',
        };
    }

    private function terRate(float $gross, string $category): float
    {
        $brackets = config("hr_ter.categories.{$category}.brackets", []);

        foreach ($brackets as $bracket) {
            if ($gross <= $bracket['max']) {
                return (float) $bracket['rate'];
            }
        }

        return 30.0;
    }

    /**
     * @return array<string, mixed>
     */
    private function financeLinkPayload(int $tahun, int $bulan, float $totalPph21): array
    {
        return [
            'module' => 'finance.tax',
            'path' => '/finance/tax/rekap-bulanan',
            'query' => ['tahun' => $tahun, 'bulan' => $bulan],
            'label' => 'Lihat Rekap Pajak Keuangan',
            'total_pph21_payroll' => round($totalPph21, 2),
            'reconciliation_key' => sprintf('PPh21-PAYROLL-%04d-%02d', $tahun, $bulan),
            'status' => 'pending_sync',
            'note' => 'Nilai PPh 21 pegawai ini akan dicocokkan dengan setoran pajak di modul Keuangan → Pajak.',
        ];
    }

    private function safeQuery(callable $fn, mixed $fallback = null): mixed
    {
        try {
            return $fn();
        } catch (\Throwable) {
            return $fallback;
        }
    }
}
