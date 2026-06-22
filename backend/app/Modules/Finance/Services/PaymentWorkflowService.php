<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\BudgetYear;
use App\Support\RsudConnections;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class PaymentWorkflowService
{
    private const BULAN_LABELS = [
        1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
        7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
    ];

    private const STAGES = [
        'belum-proses-tagihan',
        'permintaan-bayar',
        'rencana-bayar',
        'verifikasi-pajak',
        'pembayaran-selesai',
    ];

    public function meta(?int $budgetYearId = null): array
    {
        $tahun = $this->resolveTahun($budgetYearId);

        return [
            'tahun' => $tahun,
            'bulan_options' => collect(self::BULAN_LABELS)
                ->map(fn (string $label, int $value) => ['value' => $value, 'label' => $label])
                ->values()
                ->all(),
            'stage_options' => [
                ['value' => 'belum-proses-tagihan', 'label' => 'Belum Proses Tagihan'],
                ['value' => 'permintaan-bayar', 'label' => 'Permintaan Bayar'],
                ['value' => 'rencana-bayar', 'label' => 'Rencana Bayar'],
                ['value' => 'verifikasi-pajak', 'label' => 'Verifikasi Pajak'],
                ['value' => 'pembayaran-selesai', 'label' => 'Pembayaran Selesai'],
            ],
        ];
    }

    /**
     * @param  array{budget_year_id: int, bulan?: int|null}  $filters
     */
    public function dashboard(array $filters): array
    {
        $tahun = $this->resolveTahun((int) $filters['budget_year_id']);
        $bulan = isset($filters['bulan']) ? (int) $filters['bulan'] : null;
        $cacheKey = 'payment_workflow_dashboard:'.$tahun.':'.($bulan ?? 'all');

        return Cache::remember($cacheKey, 120, function () use ($tahun, $bulan) {
            $counts = [];
            foreach (self::STAGES as $stage) {
                $counts[$stage] = $this->countStage($stage, $tahun, $bulan);
            }

            return [
                'tahun' => $tahun,
                'bulan' => $bulan,
                'kpi' => [
                    'belum_proses_tagihan' => $counts['belum-proses-tagihan'],
                    'permintaan_bayar' => $counts['permintaan-bayar'],
                    'rencana_bayar' => $counts['rencana-bayar'],
                    'verifikasi_pajak' => $counts['verifikasi-pajak'],
                    'pembayaran_selesai' => $counts['pembayaran-selesai'],
                    'total_antrian' => $counts['belum-proses-tagihan']
                        + $counts['permintaan-bayar']
                        + $counts['rencana-bayar']
                        + $counts['verifikasi-pajak'],
                ],
                'stages' => collect(self::STAGES)->map(fn (string $stage) => [
                    'stage' => $stage,
                    'count' => $counts[$stage],
                ])->all(),
            ];
        });
    }

    /**
     * @param  array{
     *   budget_year_id: int,
     *   stage: string,
     *   bulan?: int|null,
     *   search?: string,
     *   page?: int,
     *   per_page?: int
     * }  $filters
     */
    public function list(array $filters): array
    {
        $stage = (string) $filters['stage'];
        if (! in_array($stage, self::STAGES, true)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'stage' => ['Tahap pembayaran tidak valid.'],
            ]);
        }

        $tahun = $this->resolveTahun((int) $filters['budget_year_id']);
        $bulan = isset($filters['bulan']) ? (int) $filters['bulan'] : null;
        $search = trim((string) ($filters['search'] ?? ''));
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(5, (int) ($filters['per_page'] ?? 20)));

        return match ($stage) {
            'belum-proses-tagihan' => $this->listBelumProsesTagihan($tahun, $bulan, $search, $page, $perPage),
            'permintaan-bayar' => $this->listTkrFktrStage($tahun, $bulan, $search, $page, $perPage, 'permintaan'),
            'rencana-bayar' => $this->listTkrFktrStage($tahun, $bulan, $search, $page, $perPage, 'rencana'),
            'verifikasi-pajak' => $this->listTkrFktrStage($tahun, $bulan, $search, $page, $perPage, 'verifikasi-pajak'),
            'pembayaran-selesai' => $this->listPembayaranSelesai($tahun, $bulan, $search, $page, $perPage),
            default => ['rows' => [], 'summary' => [], 'meta' => ['total' => 0, 'page' => 1, 'per_page' => $perPage, 'last_page' => 1, 'from' => 0, 'to' => 0]],
        };
    }

    private function resolveTahun(?int $budgetYearId): int
    {
        if (! $budgetYearId) {
            return (int) date('Y');
        }

        $year = BudgetYear::query()->findOrFail($budgetYearId);

        return (int) $year->tahun;
    }

    private function countStage(string $stage, int $tahun, ?int $bulan): int
    {
        return match ($stage) {
            'belum-proses-tagihan' => $this->countBelumProsesTagihan($tahun, $bulan),
            'permintaan-bayar' => $this->countTkrFktrStage($tahun, $bulan, 'permintaan'),
            'rencana-bayar' => $this->countTkrFktrStage($tahun, $bulan, 'rencana'),
            'verifikasi-pajak' => $this->countTkrFktrStage($tahun, $bulan, 'verifikasi-pajak'),
            'pembayaran-selesai' => $this->countPembayaranSelesai($tahun, $bulan),
            default => 0,
        };
    }

    private function db()
    {
        return DB::connection(RsudConnections::SIMARTDB);
    }

    private function paidExistsSql(string $detailAlias = 'd'): string
    {
        return "EXISTS (
            SELECT 1 FROM BKUD bd
            WHERE bd.cnobeli = {$detailAlias}.CNOBELI
              AND (bd.lbatal IS NULL OR bd.lbatal <> 1)
        )";
    }

    private function notPaidExistsSql(string $detailAlias = 'd'): string
    {
        return "NOT {$this->paidExistsSql($detailAlias)}";
    }

    private function applyBulanFilter(string $column, ?int $bulan, array &$bindings, string &$sql): void
    {
        if ($bulan) {
            $sql .= " AND MONTH({$column}) = ?";
            $bindings[] = $bulan;
        }
    }

    private function applySearchFilter(array $columns, string $search, array &$bindings, string &$sql): void
    {
        if ($search === '') {
            return;
        }

        $like = '%'.$search.'%';
        $parts = [];
        foreach ($columns as $column) {
            $parts[] = "{$column} LIKE ?";
            $bindings[] = $like;
        }
        $sql .= ' AND ('.implode(' OR ', $parts).')';
    }

    private function countBelumProsesTagihan(int $tahun, ?int $bulan): int
    {
        $bindings = [$tahun];
        $sql = "
            SELECT COUNT(*) as aggregate
            FROM INBELIH h
            WHERE YEAR(h.DTGBELI) = ?
              AND (h.LBATAL IS NULL OR h.LBATAL <> 1)
              AND NOT EXISTS (
                SELECT 1 FROM TKRFKTRD d
                WHERE d.CNOBELI = h.CNOBELI
                  AND (d.LBATAL IS NULL OR d.LBATAL <> 1)
              )
        ";
        $this->applyBulanFilter('h.DTGBELI', $bulan, $bindings, $sql);

        $row = $this->db()->selectOne($sql, $bindings);

        return (int) ($row->aggregate ?? 0);
    }

    private function countTkrFktrStage(int $tahun, ?int $bulan, string $mode): int
    {
        $bindings = [$tahun];
        $sql = "
            SELECT COUNT(*) as aggregate
            FROM TKRFKTR t
            WHERE YEAR(t.DTGLTRMFKTR) = ?
              AND (t.LBATAL IS NULL OR t.LBATAL <> 1)
        ";
        $this->applyBulanFilter('t.DTGLTRMFKTR', $bulan, $bindings, $sql);
        $sql .= ' AND '.$this->stageConditionSql($mode, 't');

        $row = $this->db()->selectOne($sql, $bindings);

        return (int) ($row->aggregate ?? 0);
    }

    private function countPembayaranSelesai(int $tahun, ?int $bulan): int
    {
        $bindings = [$tahun];
        $sql = "
            SELECT COUNT(DISTINCT t.CKDTRMFKTR) as aggregate
            FROM TKRFKTR t
            INNER JOIN TKRFKTRD d ON d.CKDTRMFKTR = t.CKDTRMFKTR AND (d.LBATAL IS NULL OR d.LBATAL <> 1)
            INNER JOIN BKUD bd ON bd.cnobeli = d.CNOBELI AND (bd.lbatal IS NULL OR bd.lbatal <> 1)
            INNER JOIN BKUH bh ON bh.cnobku = bd.cnobku AND (bh.lbatal IS NULL OR bh.lbatal <> 1)
            WHERE YEAR(bh.dtgtrans) = ?
              AND (t.LBATAL IS NULL OR t.LBATAL <> 1)
        ";
        $this->applyBulanFilter('bh.dtgtrans', $bulan, $bindings, $sql);

        $row = $this->db()->selectOne($sql, $bindings);

        return (int) ($row->aggregate ?? 0);
    }

    private function stageConditionSql(string $mode, string $headerAlias = 't'): string
    {
        $notPaid = "NOT EXISTS (
            SELECT 1 FROM TKRFKTRD d2
            WHERE d2.CKDTRMFKTR = {$headerAlias}.CKDTRMFKTR
              AND (d2.LBATAL IS NULL OR d2.LBATAL <> 1)
              AND {$this->paidExistsSql('d2')}
        )";

        return match ($mode) {
            'permintaan' => "
                {$notPaid}
                AND EXISTS (
                    SELECT 1 FROM TKRFKTRD d3
                    WHERE d3.CKDTRMFKTR = {$headerAlias}.CKDTRMFKTR
                      AND (d3.LBATAL IS NULL OR d3.LBATAL <> 1)
                )
                AND NOT EXISTS (
                    SELECT 1 FROM TKRFKTRD d4
                    WHERE d4.CKDTRMFKTR = {$headerAlias}.CKDTRMFKTR
                      AND d4.LRCBYR = 1
                      AND (d4.LBATAL IS NULL OR d4.LBATAL <> 1)
                )
            ",
            'rencana' => "
                {$notPaid}
                AND EXISTS (
                    SELECT 1 FROM TKRFKTRD d5
                    WHERE d5.CKDTRMFKTR = {$headerAlias}.CKDTRMFKTR
                      AND d5.LRCBYR = 1
                      AND (d5.LBATAL IS NULL OR d5.LBATAL <> 1)
                )
            ",
            'verifikasi-pajak' => "
                {$notPaid}
                AND EXISTS (
                    SELECT 1 FROM TKRFKTRD d6
                    WHERE d6.CKDTRMFKTR = {$headerAlias}.CKDTRMFKTR
                      AND d6.LRCBYR = 1
                      AND (d6.LTAX IS NULL OR d6.LTAX = 0)
                      AND (d6.LBATAL IS NULL OR d6.LBATAL <> 1)
                )
            ",
            default => '1=1',
        };
    }

    /**
     * @return array{rows: list<array<string, mixed>>, summary: array<string, mixed>, meta: array<string, int>}
     */
    private function listBelumProsesTagihan(int $tahun, ?int $bulan, string $search, int $page, int $perPage): array
    {
        $bindings = [$tahun];
        $where = "
            WHERE YEAR(h.DTGBELI) = ?
              AND (h.LBATAL IS NULL OR h.LBATAL <> 1)
              AND NOT EXISTS (
                SELECT 1 FROM TKRFKTRD d
                WHERE d.CNOBELI = h.CNOBELI
                  AND (d.LBATAL IS NULL OR d.LBATAL <> 1)
              )
        ";
        $this->applyBulanFilter('h.DTGBELI', $bulan, $bindings, $where);
        $this->applySearchFilter(
            ['h.CNOBELI', 'h.CNMSUPL', 'h.CNMKELBLJ', 'h.CNOAJU', 'h.Uraian_Belanja', 'h.CNODOK'],
            $search,
            $bindings,
            $where
        );

        $total = (int) ($this->db()->selectOne("SELECT COUNT(*) as aggregate FROM INBELIH h {$where}", $bindings)->aggregate ?? 0);
        $offset = ($page - 1) * $perPage;
        $bindingsPage = [...$bindings, $offset, $perPage];

        $rows = $this->db()->select("
            SELECT
                h.CNOBELI as no_beli,
                h.DTGBELI as tgl_beli,
                h.CNMSUPL as nama_supplier,
                h.CKDSUPL as kode_supplier,
                h.CNMKELBLJ as kelompok_belanja,
                h.CNOAJU as no_aju,
                h.Uraian_Belanja as uraian,
                CAST(h.NTOTAL AS float) as total,
                CAST(h.NPPN AS float) as ppn,
                CAST(h.PPH23 AS float) as pph23,
                h.DTGJTTEMPO as jatuh_tempo,
                h.CNODOK as no_dokumen,
                h.CNOPOLOG as no_po
            FROM INBELIH h
            {$where}
            ORDER BY h.DTGBELI DESC, h.CNOBELI DESC
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
        ", $bindingsPage);

        $totalNilai = (float) ($this->db()->selectOne(
            "SELECT SUM(CAST(h.NTOTAL AS float)) as aggregate FROM INBELIH h {$where}",
            $bindings
        )->aggregate ?? 0);

        return $this->paginatedResponse($rows, $total, $page, $perPage, [
            'total_nilai' => round($totalNilai, 2),
            'jumlah_tagihan' => $total,
        ], fn ($row) => [
            'no_beli' => (string) $row->no_beli,
            'tgl_beli' => $this->formatDate($row->tgl_beli),
            'nama_supplier' => (string) ($row->nama_supplier ?? ''),
            'kode_supplier' => (string) ($row->kode_supplier ?? ''),
            'kelompok_belanja' => (string) ($row->kelompok_belanja ?? ''),
            'no_aju' => $row->no_aju ? (string) $row->no_aju : null,
            'uraian' => (string) ($row->uraian ?? ''),
            'total' => round((float) $row->total, 2),
            'ppn' => round((float) $row->ppn, 2),
            'pph23' => round((float) $row->pph23, 2),
            'jatuh_tempo' => $this->formatDate($row->jatuh_tempo),
            'no_dokumen' => $row->no_dokumen ? (string) $row->no_dokumen : null,
            'no_po' => $row->no_po ? (string) $row->no_po : null,
        ]);
    }

    /**
     * @return array{rows: list<array<string, mixed>>, summary: array<string, mixed>, meta: array<string, int>}
     */
    private function listTkrFktrStage(int $tahun, ?int $bulan, string $search, int $page, int $perPage, string $mode): array
    {
        $bindings = [$tahun];
        $where = "
            WHERE YEAR(t.DTGLTRMFKTR) = ?
              AND (t.LBATAL IS NULL OR t.LBATAL <> 1)
        ";
        $this->applyBulanFilter('t.DTGLTRMFKTR', $bulan, $bindings, $where);
        $where .= ' AND '.$this->stageConditionSql($mode, 't');
        $this->applySearchFilter(
            ['t.CKDTRMFKTR', 't.CNMSUPL', 't.CKDSUPL'],
            $search,
            $bindings,
            $where
        );

        $total = (int) ($this->db()->selectOne("SELECT COUNT(*) as aggregate FROM TKRFKTR t {$where}", $bindings)->aggregate ?? 0);
        $offset = ($page - 1) * $perPage;
        $bindingsPage = [...$bindings, $offset, $perPage];

        $rows = $this->db()->select("
            SELECT
                t.CKDTRMFKTR as no_tukar_faktur,
                t.DTGLTRMFKTR as tgl_tukar_faktur,
                t.CNMSUPL as nama_supplier,
                t.CKDSUPL as kode_supplier,
                CAST(t.NTOTAL AS float) as total_bayar,
                CAST(t.NTOTFKTR AS float) as total_faktur,
                CAST(t.NTOTDPP AS float) as total_dpp,
                CAST(t.NTOTPPH23 AS float) as total_pph23,
                t.DTGLRCBYR as tgl_rencana_bayar,
                t.LRCBYR as flag_rencana,
                (
                    SELECT COUNT(*) FROM TKRFKTRD d
                    WHERE d.CKDTRMFKTR = t.CKDTRMFKTR AND (d.LBATAL IS NULL OR d.LBATAL <> 1)
                ) as jumlah_faktur,
                (
                    SELECT COUNT(*) FROM TKRFKTRD d
                    WHERE d.CKDTRMFKTR = t.CKDTRMFKTR AND d.LRCBYR = 1 AND (d.LBATAL IS NULL OR d.LBATAL <> 1)
                ) as jumlah_rencana,
                (
                    SELECT COUNT(*) FROM TKRFKTRD d
                    WHERE d.CKDTRMFKTR = t.CKDTRMFKTR AND (d.LTAX IS NULL OR d.LTAX = 0) AND d.LRCBYR = 1 AND (d.LBATAL IS NULL OR d.LBATAL <> 1)
                ) as jumlah_belum_pajak
            FROM TKRFKTR t
            {$where}
            ORDER BY t.DTGLTRMFKTR DESC, t.CKDTRMFKTR DESC
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
        ", $bindingsPage);

        $totalNilai = (float) ($this->db()->selectOne(
            "SELECT SUM(CAST(t.NTOTAL AS float)) as aggregate FROM TKRFKTR t {$where}",
            $bindings
        )->aggregate ?? 0);

        return $this->paginatedResponse($rows, $total, $page, $perPage, [
            'total_nilai' => round($totalNilai, 2),
            'jumlah_tukar_faktur' => $total,
        ], fn ($row) => [
            'no_tukar_faktur' => (string) $row->no_tukar_faktur,
            'tgl_tukar_faktur' => $this->formatDate($row->tgl_tukar_faktur),
            'nama_supplier' => (string) ($row->nama_supplier ?? ''),
            'kode_supplier' => (string) ($row->kode_supplier ?? ''),
            'total_bayar' => round((float) $row->total_bayar, 2),
            'total_faktur' => round((float) $row->total_faktur, 2),
            'total_dpp' => round((float) $row->total_dpp, 2),
            'total_pph23' => round((float) $row->total_pph23, 2),
            'tgl_rencana_bayar' => $this->formatDate($row->tgl_rencana_bayar),
            'flag_rencana' => (int) ($row->flag_rencana ?? 0) === 1,
            'jumlah_faktur' => (int) $row->jumlah_faktur,
            'jumlah_rencana' => (int) $row->jumlah_rencana,
            'jumlah_belum_pajak' => (int) $row->jumlah_belum_pajak,
        ]);
    }

    /**
     * @return array{rows: list<array<string, mixed>>, summary: array<string, mixed>, meta: array<string, int>}
     */
    private function listPembayaranSelesai(int $tahun, ?int $bulan, string $search, int $page, int $perPage): array
    {
        $bindings = [$tahun];
        $where = "
            WHERE YEAR(bh.dtgtrans) = ?
              AND (t.LBATAL IS NULL OR t.LBATAL <> 1)
              AND (bh.lbatal IS NULL OR bh.lbatal <> 1)
              AND (bd.lbatal IS NULL OR bd.lbatal <> 1)
        ";
        $this->applyBulanFilter('bh.dtgtrans', $bulan, $bindings, $where);
        $this->applySearchFilter(
            ['t.CKDTRMFKTR', 'bh.cnobku', 'bh.CKDNOBYR', 'bh.cket', 't.CNMSUPL', 'bd.cnobeli'],
            $search,
            $bindings,
            $where
        );

        $baseFrom = "
            FROM TKRFKTR t
            INNER JOIN TKRFKTRD d ON d.CKDTRMFKTR = t.CKDTRMFKTR AND (d.LBATAL IS NULL OR d.LBATAL <> 1)
            INNER JOIN BKUD bd ON bd.cnobeli = d.CNOBELI AND (bd.lbatal IS NULL OR bd.lbatal <> 1)
            INNER JOIN BKUH bh ON bh.cnobku = bd.cnobku AND (bh.lbatal IS NULL OR bh.lbatal <> 1)
        ";

        $total = (int) ($this->db()->selectOne(
            "SELECT COUNT(*) as aggregate FROM (
                SELECT DISTINCT t.CKDTRMFKTR, bh.cnobku
                {$baseFrom}
                {$where}
            ) paid_rows",
            $bindings
        )->aggregate ?? 0);

        $offset = ($page - 1) * $perPage;
        $bindingsPage = [...$bindings, $offset, $perPage];

        $rows = $this->db()->select("
            SELECT DISTINCT
                t.CKDTRMFKTR as no_tukar_faktur,
                t.DTGLTRMFKTR as tgl_tukar_faktur,
                t.CNMSUPL as nama_supplier,
                bh.cnobku as no_bku,
                bh.dtgtrans as tgl_bayar,
                bh.CKDNOBYR as no_pembayaran,
                bh.cket as keterangan,
                CAST(bh.nkeluar AS float) as nilai_keluar,
                bh.cnojurnal as no_jurnal,
                bd.cnobeli as no_beli,
                bd.CNMKELBLJ as kelompok_belanja,
                bd.uraian_belanja as uraian
            {$baseFrom}
            {$where}
            ORDER BY bh.dtgtrans DESC, t.CKDTRMFKTR DESC
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
        ", $bindingsPage);

        $totalNilai = (float) ($this->db()->selectOne(
            "SELECT SUM(nilai) as aggregate FROM (
                SELECT DISTINCT bh.cnobku, CAST(bh.nkeluar AS float) as nilai
                {$baseFrom}
                {$where}
            ) paid_amounts",
            $bindings
        )->aggregate ?? 0);

        return $this->paginatedResponse($rows, $total, $page, $perPage, [
            'total_nilai' => round($totalNilai, 2),
            'jumlah_pembayaran' => $total,
        ], fn ($row) => [
            'no_tukar_faktur' => (string) $row->no_tukar_faktur,
            'tgl_tukar_faktur' => $this->formatDate($row->tgl_tukar_faktur),
            'nama_supplier' => (string) ($row->nama_supplier ?? ''),
            'no_bku' => (string) $row->no_bku,
            'tgl_bayar' => $this->formatDate($row->tgl_bayar),
            'no_pembayaran' => $row->no_pembayaran ? (string) $row->no_pembayaran : null,
            'keterangan' => (string) ($row->keterangan ?? ''),
            'nilai_keluar' => round((float) $row->nilai_keluar, 2),
            'no_jurnal' => $row->no_jurnal ? trim((string) $row->no_jurnal) : null,
            'no_beli' => (string) ($row->no_beli ?? ''),
            'kelompok_belanja' => (string) ($row->kelompok_belanja ?? ''),
            'uraian' => (string) ($row->uraian ?? ''),
        ]);
    }

    /**
     * @param  list<object>  $rows
     * @param  callable(object): array<string, mixed>  $mapper
     * @return array{rows: list<array<string, mixed>>, summary: array<string, mixed>, meta: array<string, int>}
     */
    private function paginatedResponse(array $rows, int $total, int $page, int $perPage, array $summary, callable $mapper): array
    {
        $mapped = array_map($mapper, $rows);
        $from = $total === 0 ? 0 : (($page - 1) * $perPage) + 1;
        $to = min($page * $perPage, $total);

        return [
            'rows' => $mapped,
            'summary' => $summary,
            'meta' => [
                'total' => $total,
                'page' => $page,
                'per_page' => $perPage,
                'last_page' => max(1, (int) ceil($total / $perPage)),
                'from' => $from,
                'to' => $to,
            ],
        ];
    }

    private function formatDate(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        try {
            return (new \DateTime((string) $value))->format('Y-m-d');
        } catch (\Throwable) {
            return (string) $value;
        }
    }
}
