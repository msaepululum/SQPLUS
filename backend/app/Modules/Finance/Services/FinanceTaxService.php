<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\BudgetYear;
use App\Support\RsudConnections;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class FinanceTaxService
{
    private const BULAN_LABELS = [
        1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
        7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
    ];

    private const STAGES = [
        'antrian-verifikasi',
        'tagihan-pembelian',
        'tukar-faktur',
        'detail-perhitungan',
        'setoran-pajak',
        'pajak-pengajuan',
        'rekap-bulanan',
    ];

    public function meta(?int $budgetYearId = null): array
    {
        $tahun = $budgetYearId ? $this->resolveTahun($budgetYearId) : null;

        return [
            'tahun' => $tahun,
            'bulan_options' => collect(self::BULAN_LABELS)
                ->map(fn (string $label, int $value) => ['value' => $value, 'label' => $label])
                ->values()
                ->all(),
            'stage_options' => [
                ['value' => 'antrian-verifikasi', 'label' => 'Antrian Verifikasi Pajak'],
                ['value' => 'tagihan-pembelian', 'label' => 'Pajak Tagihan Pembelian'],
                ['value' => 'tukar-faktur', 'label' => 'Pajak Tukar Faktur'],
                ['value' => 'detail-perhitungan', 'label' => 'Detail Perhitungan Pajak'],
                ['value' => 'setoran-pajak', 'label' => 'Setoran Pajak (BKU)'],
                ['value' => 'pajak-pengajuan', 'label' => 'Pajak Pengajuan Belanja'],
                ['value' => 'rekap-bulanan', 'label' => 'Rekap Bulanan'],
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
        $cacheKey = 'finance_tax_dashboard:'.$tahun.':'.($bulan ?? 'all');

        return Cache::remember($cacheKey, 120, function () use ($tahun, $bulan) {
            $inbeli = $this->inbeliTaxTotals($tahun, $bulan);
            $faktur = $this->tkrFktrTaxTotals($tahun, $bulan);
            $detail = $this->tkrFktrdTaxTotals($tahun, $bulan);
            $setoran = $this->bkuTaxTotals($tahun, $bulan);
            $aju = $this->ajuTaxTotals($tahun);

            return [
                'tahun' => $tahun,
                'bulan' => $bulan,
                'kpi' => [
                    'antrian_verifikasi' => $this->countAntrianVerifikasi($tahun, $bulan),
                    'ppn_tagihan' => round($inbeli['ppn'], 2),
                    'pph22_tagihan' => round($inbeli['pph22'], 2),
                    'pph23_tagihan' => round($inbeli['pph23'], 2),
                    'ppn_faktur' => round($faktur['ppn'], 2),
                    'pph22_faktur' => round($detail['pph22'], 2),
                    'pph23_faktur' => round($faktur['pph23'], 2),
                    'setoran_pajak' => round($setoran['total'], 2),
                    'ppn_pengajuan' => round($aju['ppn'], 2),
                ],
                'ringkasan' => [
                    'tagihan' => $inbeli,
                    'tukar_faktur' => $faktur,
                    'detail_faktur' => $detail,
                    'setoran' => $setoran,
                    'pengajuan' => $aju,
                ],
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
                'stage' => ['Tahap pajak tidak valid.'],
            ]);
        }

        $tahun = $this->resolveTahun((int) $filters['budget_year_id']);
        $bulan = isset($filters['bulan']) ? (int) $filters['bulan'] : null;
        $search = trim((string) ($filters['search'] ?? ''));
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(5, (int) ($filters['per_page'] ?? 20)));

        return match ($stage) {
            'antrian-verifikasi' => $this->listAntrianVerifikasi($tahun, $bulan, $search, $page, $perPage),
            'tagihan-pembelian' => $this->listTagihanPembelian($tahun, $bulan, $search, $page, $perPage),
            'tukar-faktur' => $this->listTukarFaktur($tahun, $bulan, $search, $page, $perPage),
            'detail-perhitungan' => $this->listDetailPerhitungan($tahun, $bulan, $search, $page, $perPage),
            'setoran-pajak' => $this->listSetoranPajak($tahun, $bulan, $search, $page, $perPage),
            'pajak-pengajuan' => $this->listPajakPengajuan($tahun, $bulan, $search, $page, $perPage),
            'rekap-bulanan' => $this->listRekapBulanan($tahun),
            default => $this->emptyPage($page, $perPage),
        };
    }

    private function resolveTahun(int $budgetYearId): int
    {
        $year = BudgetYear::query()->findOrFail($budgetYearId);

        return (int) $year->tahun;
    }

    private function simart()
    {
        return DB::connection(RsudConnections::SIMARTDB);
    }

    private function finance()
    {
        return DB::connection(RsudConnections::FINANCE);
    }

    private function applyBulan(string $column, ?int $bulan, array &$bindings, string &$sql): void
    {
        if ($bulan) {
            $sql .= " AND MONTH({$column}) = ?";
            $bindings[] = $bulan;
        }
    }

    private function applySearch(array $columns, string $search, array &$bindings, string &$sql): void
    {
        if ($search === '') {
            return;
        }
        $like = '%'.$search.'%';
        $parts = [];
        foreach ($columns as $col) {
            $parts[] = "{$col} LIKE ?";
            $bindings[] = $like;
        }
        $sql .= ' AND ('.implode(' OR ', $parts).')';
    }

    /**
     * @return array{ppn: float, pph22: float, pph23: float, dpp: float, total: float, jumlah: int}
     */
    private function inbeliTaxTotals(int $tahun, ?int $bulan): array
    {
        $bindings = [$tahun];
        $sql = "
            SELECT
                COUNT(*) as jumlah,
                SUM(CAST(COALESCE(h.NILAI_PPN, h.NPPN, 0) AS float)) as ppn,
                SUM(CAST(COALESCE(h.PPH22, 0) AS float)) as pph22,
                SUM(CAST(COALESCE(h.PPH23, 0) AS float)) as pph23,
                SUM(CAST(COALESCE(h.NTOTAL, 0) AS float) - CAST(COALESCE(h.NILAI_PPN, h.NPPN, 0) AS float)) as dpp,
                SUM(CAST(COALESCE(h.NTOTAL, 0) AS float)) as total
            FROM INBELIH h
            WHERE YEAR(h.DTGBELI) = ? AND (h.LBATAL IS NULL OR h.LBATAL <> 1)
        ";
        $this->applyBulan('h.DTGBELI', $bulan, $bindings, $sql);
        $row = $this->simart()->selectOne($sql, $bindings);

        return [
            'jumlah' => (int) ($row->jumlah ?? 0),
            'ppn' => (float) ($row->ppn ?? 0),
            'pph22' => (float) ($row->pph22 ?? 0),
            'pph23' => (float) ($row->pph23 ?? 0),
            'dpp' => (float) ($row->dpp ?? 0),
            'total' => (float) ($row->total ?? 0),
        ];
    }

    /**
     * @return array{ppn: float, pph23: float, dpp: float, total: float, jumlah: int}
     */
    private function tkrFktrTaxTotals(int $tahun, ?int $bulan): array
    {
        $bindings = [$tahun];
        $sql = "
            SELECT COUNT(*) as jumlah,
                SUM(CAST(COALESCE(t.NTOTDPP, 0) AS float)) as dpp,
                SUM(CAST(COALESCE(t.NTOTFKTR, 0) AS float) - CAST(COALESCE(t.NTOTDPP, 0) AS float)) as ppn,
                SUM(CAST(COALESCE(t.NTOTPPH23, 0) AS float)) as pph23,
                SUM(CAST(COALESCE(t.NTOTAL, 0) AS float)) as total
            FROM TKRFKTR t
            WHERE YEAR(t.DTGLTRMFKTR) = ? AND (t.LBATAL IS NULL OR t.LBATAL <> 1)
        ";
        $this->applyBulan('t.DTGLTRMFKTR', $bulan, $bindings, $sql);
        $row = $this->simart()->selectOne($sql, $bindings);

        return [
            'jumlah' => (int) ($row->jumlah ?? 0),
            'dpp' => (float) ($row->dpp ?? 0),
            'ppn' => max(0, (float) ($row->ppn ?? 0)),
            'pph23' => (float) ($row->pph23 ?? 0),
            'total' => (float) ($row->total ?? 0),
        ];
    }

    /**
     * @return array{ppn: float, pph22: float, pph23: float, dpp: float, total: float, jumlah: int}
     */
    private function tkrFktrdTaxTotals(int $tahun, ?int $bulan): array
    {
        $bindings = [$tahun];
        $sql = "
            SELECT COUNT(*) as jumlah,
                SUM(CAST(COALESCE(d.NDPP, 0) AS float)) as dpp,
                SUM(CAST(COALESCE(d.BYR_PPN, 0) AS float)) as ppn,
                SUM(CAST(COALESCE(d.NPPH22, 0) AS float)) as pph22,
                SUM(CAST(COALESCE(d.NPPH23, 0) AS float)) as pph23,
                SUM(CAST(COALESCE(d.NTOTAL, 0) AS float)) as total
            FROM TKRFKTRD d
            INNER JOIN TKRFKTR t ON t.CKDTRMFKTR = d.CKDTRMFKTR
            WHERE YEAR(t.DTGLTRMFKTR) = ? AND (d.LBATAL IS NULL OR d.LBATAL <> 1)
        ";
        $this->applyBulan('t.DTGLTRMFKTR', $bulan, $bindings, $sql);
        $row = $this->simart()->selectOne($sql, $bindings);

        return [
            'jumlah' => (int) ($row->jumlah ?? 0),
            'dpp' => (float) ($row->dpp ?? 0),
            'ppn' => (float) ($row->ppn ?? 0),
            'pph22' => (float) ($row->pph22 ?? 0),
            'pph23' => (float) ($row->pph23 ?? 0),
            'total' => (float) ($row->total ?? 0),
        ];
    }

    /**
     * @return array{total: float, jumlah: int}
     */
    private function bkuTaxTotals(int $tahun, ?int $bulan): array
    {
        $bindings = [$tahun];
        $sql = "
            SELECT COUNT(*) as jumlah, SUM(CAST(COALESCE(h.nkeluar, 0) AS float)) as total
            FROM BKUH h
            WHERE YEAR(h.dtgtrans) = ? AND (h.lbatal IS NULL OR h.lbatal <> 1)
              AND (h.cket LIKE '%PPN%' OR h.cket LIKE '%PPH%' OR COALESCE(h.Lpajak, 0) = 1)
        ";
        $this->applyBulan('h.dtgtrans', $bulan, $bindings, $sql);
        $row = $this->simart()->selectOne($sql, $bindings);

        return [
            'jumlah' => (int) ($row->jumlah ?? 0),
            'total' => (float) ($row->total ?? 0),
        ];
    }

    /**
     * @return array{ppn: float, dpp: float, total: float, jumlah: int}
     */
    private function ajuTaxTotals(int $tahun): array
    {
        $row = $this->finance()->selectOne("
            SELECT COUNT(DISTINCT a.id) as jumlah,
                SUM(CAST(COALESCE(d.ppn, 0) AS float)) as ppn,
                SUM(CAST(COALESCE(d.subtotal, 0) AS float)) as dpp,
                SUM(CAST(COALESCE(d.total, 0) AS float)) as total
            FROM aju a
            INNER JOIN aju_detail d ON d.aju_id = a.id
            WHERE a.tahun = ? AND a.deleted_at IS NULL
        ", [(string) $tahun]);

        return [
            'jumlah' => (int) ($row->jumlah ?? 0),
            'ppn' => (float) ($row->ppn ?? 0),
            'dpp' => (float) ($row->dpp ?? 0),
            'total' => (float) ($row->total ?? 0),
        ];
    }

    private function countAntrianVerifikasi(int $tahun, ?int $bulan): int
    {
        $bindings = [$tahun];
        $sql = "
            SELECT COUNT(*) as aggregate
            FROM TKRFKTRD d
            INNER JOIN TKRFKTR t ON t.CKDTRMFKTR = d.CKDTRMFKTR
            WHERE YEAR(t.DTGLTRMFKTR) = ?
              AND (d.LBATAL IS NULL OR d.LBATAL <> 1)
              AND d.LRCBYR = 1
              AND (d.LTAX IS NULL OR d.LTAX = 0)
        ";
        $this->applyBulan('t.DTGLTRMFKTR', $bulan, $bindings, $sql);

        return (int) ($this->simart()->selectOne($sql, $bindings)->aggregate ?? 0);
    }

    private function listAntrianVerifikasi(int $tahun, ?int $bulan, string $search, int $page, int $perPage): array
    {
        $bindings = [$tahun];
        $where = "
            WHERE YEAR(t.DTGLTRMFKTR) = ?
              AND (d.LBATAL IS NULL OR d.LBATAL <> 1)
              AND d.LRCBYR = 1
              AND (d.LTAX IS NULL OR d.LTAX = 0)
        ";
        $this->applyBulan('t.DTGLTRMFKTR', $bulan, $bindings, $where);
        $this->applySearch(['d.CNOBELI', 'd.CKDFKTR', 't.CKDTRMFKTR', 't.CNMSUPL'], $search, $bindings, $where);

        return $this->paginateDetailRows($tahun, $bulan, $where, $bindings, $page, $perPage, 't.DTGLTRMFKTR DESC');
    }

    private function listTagihanPembelian(int $tahun, ?int $bulan, string $search, int $page, int $perPage): array
    {
        $bindings = [$tahun];
        $where = "WHERE YEAR(h.DTGBELI) = ? AND (h.LBATAL IS NULL OR h.LBATAL <> 1)";
        $this->applyBulan('h.DTGBELI', $bulan, $bindings, $where);
        $this->applySearch(['h.CNOBELI', 'h.CNMSUPL', 'h.CNOAJU'], $search, $bindings, $where);

        $total = (int) ($this->simart()->selectOne("SELECT COUNT(*) as aggregate FROM INBELIH h {$where}", $bindings)->aggregate ?? 0);
        $offset = ($page - 1) * $perPage;
        $rows = $this->simart()->select("
            SELECT h.CNOBELI as no_beli, h.DTGBELI as tgl, h.CNMSUPL as supplier,
                CAST(COALESCE(h.NTOTAL, 0) - COALESCE(h.NILAI_PPN, h.NPPN, 0) AS float) as dpp,
                CAST(COALESCE(h.NILAI_PPN, h.NPPN, 0) AS float) as ppn,
                CAST(COALESCE(h.PPH22, 0) AS float) as pph22,
                CAST(COALESCE(h.PPH23, 0) AS float) as pph23,
                CAST(COALESCE(h.NTOTAL, 0) AS float) as total,
                h.CNOAJU as no_aju
            FROM INBELIH h {$where}
            ORDER BY h.DTGBELI DESC
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
        ", [...$bindings, $offset, $perPage]);

        return $this->paginatedResponse($rows, $total, $page, $perPage, $this->inbeliTaxTotals($tahun, $bulan), fn ($r) => $this->mapTagihanRow($r));
    }

    private function listTukarFaktur(int $tahun, ?int $bulan, string $search, int $page, int $perPage): array
    {
        $bindings = [$tahun];
        $where = "WHERE YEAR(t.DTGLTRMFKTR) = ? AND (t.LBATAL IS NULL OR t.LBATAL <> 1)";
        $this->applyBulan('t.DTGLTRMFKTR', $bulan, $bindings, $where);
        $this->applySearch(['t.CKDTRMFKTR', 't.CNMSUPL'], $search, $bindings, $where);

        $total = (int) ($this->simart()->selectOne("SELECT COUNT(*) as aggregate FROM TKRFKTR t {$where}", $bindings)->aggregate ?? 0);
        $offset = ($page - 1) * $perPage;
        $rows = $this->simart()->select("
            SELECT t.CKDTRMFKTR as no_tukar_faktur, t.DTGLTRMFKTR as tgl, t.CNMSUPL as supplier,
                CAST(COALESCE(t.NTOTDPP, 0) AS float) as dpp,
                CAST(COALESCE(t.NTOTFKTR, 0) - COALESCE(t.NTOTDPP, 0) AS float) as ppn,
                CAST(COALESCE(t.NTOTPPH23, 0) AS float) as pph23,
                CAST(COALESCE(t.NTOTAL, 0) AS float) as total_bayar,
                (SELECT COUNT(*) FROM TKRFKTRD d WHERE d.CKDTRMFKTR=t.CKDTRMFKTR AND (d.LBATAL IS NULL OR d.LBATAL<>1)) as jumlah_detail,
                (SELECT COUNT(*) FROM TKRFKTRD d WHERE d.CKDTRMFKTR=t.CKDTRMFKTR AND (d.LTAX IS NULL OR d.LTAX=0) AND (d.LBATAL IS NULL OR d.LBATAL<>1)) as belum_verifikasi
            FROM TKRFKTR t {$where}
            ORDER BY t.DTGLTRMFKTR DESC
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
        ", [...$bindings, $offset, $perPage]);

        return $this->paginatedResponse($rows, $total, $page, $perPage, $this->tkrFktrTaxTotals($tahun, $bulan), fn ($r) => [
            'no_tukar_faktur' => trim((string) $r->no_tukar_faktur),
            'tgl' => $this->formatDate($r->tgl),
            'supplier' => (string) ($r->supplier ?? ''),
            'dpp' => round((float) $r->dpp, 2),
            'ppn' => round(max(0, (float) $r->ppn), 2),
            'pph23' => round((float) $r->pph23, 2),
            'total_pajak' => round(max(0, (float) $r->ppn) + (float) $r->pph23, 2),
            'total_bayar' => round((float) $r->total_bayar, 2),
            'jumlah_detail' => (int) $r->jumlah_detail,
            'belum_verifikasi' => (int) $r->belum_verifikasi,
        ]);
    }

    private function listDetailPerhitungan(int $tahun, ?int $bulan, string $search, int $page, int $perPage): array
    {
        $bindings = [$tahun];
        $where = "WHERE YEAR(t.DTGLTRMFKTR) = ? AND (d.LBATAL IS NULL OR d.LBATAL <> 1)";
        $this->applyBulan('t.DTGLTRMFKTR', $bulan, $bindings, $where);
        $this->applySearch(['d.CNOBELI', 'd.CKDFKTR', 't.CKDTRMFKTR', 't.CNMSUPL'], $search, $bindings, $where);

        return $this->paginateDetailRows($tahun, $bulan, $where, $bindings, $page, $perPage, 'd.DTGLFKTR DESC');
    }

    private function paginateDetailRows(int $tahun, ?int $bulan, string $where, array $bindings, int $page, int $perPage, string $orderBy): array
    {
        $from = "
            FROM TKRFKTRD d
            INNER JOIN TKRFKTR t ON t.CKDTRMFKTR = d.CKDTRMFKTR
            {$where}
        ";
        $total = (int) ($this->simart()->selectOne("SELECT COUNT(*) as aggregate {$from}", $bindings)->aggregate ?? 0);
        $offset = ($page - 1) * $perPage;
        $rows = $this->simart()->select("
            SELECT d.CNOBELI as no_beli, d.CKDFKTR as no_faktur, d.DTGLFKTR as tgl,
                t.CKDTRMFKTR as no_tukar_faktur, t.CNMSUPL as supplier,
                CAST(COALESCE(d.NDPP, 0) AS float) as dpp,
                CAST(COALESCE(d.BYR_PPN, 0) AS float) as ppn,
                CAST(COALESCE(d.NPPH22, 0) AS float) as pph22,
                CAST(COALESCE(d.NPPH23, 0) AS float) as pph23,
                CAST(COALESCE(d.NTOTAL, 0) AS float) as total,
                d.LTAX as ltax, d.LRCBYR as lrcbyr
            {$from}
            ORDER BY {$orderBy}
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
        ", [...$bindings, $offset, $perPage]);

        $summary = $this->tkrFktrdTaxTotals($tahun, $bulan);

        return $this->paginatedResponse($rows, $total, $page, $perPage, $summary, fn ($r) => $this->mapDetailRow($r));
    }

    private function listSetoranPajak(int $tahun, ?int $bulan, string $search, int $page, int $perPage): array
    {
        $bindings = [$tahun];
        $where = "
            WHERE YEAR(h.dtgtrans) = ? AND (h.lbatal IS NULL OR h.lbatal <> 1)
              AND (h.cket LIKE '%PPN%' OR h.cket LIKE '%PPH%' OR COALESCE(h.Lpajak, 0) = 1)
        ";
        $this->applyBulan('h.dtgtrans', $bulan, $bindings, $where);
        $this->applySearch(['h.cnobku', 'h.cket', 'h.CKDNOBYR', 'h.cnojurnal'], $search, $bindings, $where);

        $total = (int) ($this->simart()->selectOne("SELECT COUNT(*) as aggregate FROM BKUH h {$where}", $bindings)->aggregate ?? 0);
        $offset = ($page - 1) * $perPage;
        $rows = $this->simart()->select("
            SELECT h.cnobku as no_bku, h.dtgtrans as tgl, h.cket as keterangan,
                CAST(COALESCE(h.nkeluar, 0) AS float) as keluar,
                CAST(COALESCE(h.nterima, 0) AS float) as masuk,
                TRIM(h.cnojurnal) as no_jurnal, h.CKDNOBYR as no_pembayaran
            FROM BKUH h {$where}
            ORDER BY h.dtgtrans DESC
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
        ", [...$bindings, $offset, $perPage]);

        return $this->paginatedResponse($rows, $total, $page, $perPage, $this->bkuTaxTotals($tahun, $bulan), fn ($r) => [
            'no_bku' => (string) $r->no_bku,
            'tgl' => $this->formatDate($r->tgl),
            'keterangan' => (string) ($r->keterangan ?? ''),
            'jenis_pajak' => $this->inferJenisPajak((string) ($r->keterangan ?? '')),
            'nilai' => round((float) $r->keluar > 0 ? (float) $r->keluar : (float) $r->masuk, 2),
            'no_jurnal' => $r->no_jurnal ? (string) $r->no_jurnal : null,
            'no_pembayaran' => $r->no_pembayaran ? trim((string) $r->no_pembayaran) : null,
        ]);
    }

    private function listPajakPengajuan(int $tahun, ?int $bulan, string $search, int $page, int $perPage): array
    {
        $bindings = [(string) $tahun];
        $where = 'WHERE a.tahun = ? AND a.deleted_at IS NULL';
        if ($bulan) {
            $where .= ' AND MONTH(a.tgl) = ?';
            $bindings[] = $bulan;
        }
        $this->applySearch(['a.no_aju', 'a.nama_aju'], $search, $bindings, $where);

        $total = (int) ($this->finance()->selectOne("
            SELECT COUNT(DISTINCT a.id) as aggregate
            FROM aju a
            INNER JOIN aju_detail d ON d.aju_id = a.id
            {$where}
        ", $bindings)->aggregate ?? 0);

        $offset = ($page - 1) * $perPage;
        $rows = $this->finance()->select("
            SELECT a.id, a.no_aju, a.tgl, a.nama_aju, a.status,
                SUM(CAST(COALESCE(d.subtotal, 0) AS float)) as dpp,
                SUM(CAST(COALESCE(d.ppn, 0) AS float)) as ppn,
                SUM(CAST(COALESCE(d.total, 0) AS float)) as total
            FROM aju a
            INNER JOIN aju_detail d ON d.aju_id = a.id
            {$where}
            GROUP BY a.id, a.no_aju, a.tgl, a.nama_aju, a.status
            ORDER BY a.tgl DESC
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
        ", [...$bindings, $offset, $perPage]);

        return $this->paginatedResponse($rows, $total, $page, $perPage, $this->ajuTaxTotals($tahun), fn ($r) => [
            'id' => (int) $r->id,
            'no_aju' => (string) $r->no_aju,
            'tgl' => $this->formatDate($r->tgl),
            'uraian' => (string) $r->nama_aju,
            'status' => (string) $r->status,
            'dpp' => round((float) $r->dpp, 2),
            'ppn' => round((float) $r->ppn, 2),
            'tarif_ppn' => (float) $r->dpp > 0 ? round((float) $r->ppn / (float) $r->dpp * 100, 2) : 0,
            'total' => round((float) $r->total, 2),
        ]);
    }

    private function listRekapBulanan(int $tahun): array
    {
        $rows = [];
        for ($bulan = 1; $bulan <= 12; $bulan++) {
            $inbeli = $this->inbeliTaxTotals($tahun, $bulan);
            $detail = $this->tkrFktrdTaxTotals($tahun, $bulan);
            $setoran = $this->bkuTaxTotals($tahun, $bulan);
            $rows[] = [
                'bulan' => $bulan,
                'bulan_label' => self::BULAN_LABELS[$bulan],
                'ppn_tagihan' => round($inbeli['ppn'], 2),
                'pph22_tagihan' => round($inbeli['pph22'], 2),
                'pph23_tagihan' => round($inbeli['pph23'], 2),
                'ppn_faktur' => round($detail['ppn'], 2),
                'pph22_faktur' => round($detail['pph22'], 2),
                'pph23_faktur' => round($detail['pph23'], 2),
                'setoran_pajak' => round($setoran['total'], 2),
                'jumlah_tagihan' => $inbeli['jumlah'],
                'jumlah_faktur' => $detail['jumlah'],
            ];
        }

        $totals = [
            'ppn_tagihan' => round(array_sum(array_column($rows, 'ppn_tagihan')), 2),
            'pph22_tagihan' => round(array_sum(array_column($rows, 'pph22_tagihan')), 2),
            'pph23_tagihan' => round(array_sum(array_column($rows, 'pph23_tagihan')), 2),
            'ppn_faktur' => round(array_sum(array_column($rows, 'ppn_faktur')), 2),
            'pph22_faktur' => round(array_sum(array_column($rows, 'pph22_faktur')), 2),
            'pph23_faktur' => round(array_sum(array_column($rows, 'pph23_faktur')), 2),
            'setoran_pajak' => round(array_sum(array_column($rows, 'setoran_pajak')), 2),
        ];

        return [
            'rows' => $rows,
            'summary' => $totals,
            'meta' => [
                'total' => 12,
                'page' => 1,
                'per_page' => 12,
                'last_page' => 1,
                'from' => 1,
                'to' => 12,
            ],
        ];
    }

    private function mapTagihanRow(object $r): array
    {
        $dpp = (float) $r->dpp;
        $ppn = (float) $r->ppn;
        $pph22 = (float) $r->pph22;
        $pph23 = (float) $r->pph23;

        return [
            'no_beli' => trim((string) $r->no_beli),
            'tgl' => $this->formatDate($r->tgl),
            'supplier' => (string) ($r->supplier ?? ''),
            'no_aju' => $r->no_aju ? trim((string) $r->no_aju) : null,
            'dpp' => round($dpp, 2),
            'ppn' => round($ppn, 2),
            'tarif_ppn' => $dpp > 0 ? round($ppn / $dpp * 100, 2) : 0,
            'pph22' => round($pph22, 2),
            'pph23' => round($pph23, 2),
            'total_pajak' => round($ppn + $pph22 + $pph23, 2),
            'total' => round((float) $r->total, 2),
        ];
    }

    private function mapDetailRow(object $r): array
    {
        $dpp = (float) $r->dpp;
        $ppn = (float) $r->ppn;
        $pph22 = (float) $r->pph22;
        $pph23 = (float) $r->pph23;

        return [
            'no_beli' => trim((string) $r->no_beli),
            'no_faktur' => trim((string) $r->no_faktur),
            'no_tukar_faktur' => trim((string) $r->no_tukar_faktur),
            'tgl' => $this->formatDate($r->tgl),
            'supplier' => (string) ($r->supplier ?? ''),
            'dpp' => round($dpp, 2),
            'ppn' => round($ppn, 2),
            'tarif_ppn' => $dpp > 0 ? round($ppn / $dpp * 100, 2) : 0,
            'pph22' => round($pph22, 2),
            'pph23' => round($pph23, 2),
            'total_pajak' => round($ppn + $pph22 + $pph23, 2),
            'total' => round((float) $r->total, 2),
            'status_verifikasi' => (int) ($r->ltax ?? 0) === 1 ? 'Sudah' : 'Belum',
            'rencana_bayar' => (int) ($r->lrcbyr ?? 0) === 1,
        ];
    }

    private function inferJenisPajak(string $ket): string
    {
        $upper = strtoupper($ket);
        if (str_contains($upper, 'PPN') && str_contains($upper, 'PPH')) {
            return 'PPN + PPh';
        }
        if (str_contains($upper, 'PPN')) {
            return 'PPN';
        }
        if (str_contains($upper, 'PPH23')) {
            return 'PPh 23';
        }
        if (str_contains($upper, 'PPH22')) {
            return 'PPh 22';
        }
        if (str_contains($upper, 'PPH')) {
            return 'PPh';
        }

        return 'Pajak';
    }

  /**
     * @return array{rows: array, summary: array, meta: array}
     */
    private function emptyPage(int $page, int $perPage): array
    {
        return [
            'rows' => [],
            'summary' => [],
            'meta' => ['total' => 0, 'page' => $page, 'per_page' => $perPage, 'last_page' => 1, 'from' => 0, 'to' => 0],
        ];
    }

    /**
     * @param  list<object>  $rows
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
