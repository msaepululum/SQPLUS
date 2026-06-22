<?php

namespace App\Modules\Procurement\Services;

use App\Modules\Finance\Models\BudgetYear;
use App\Modules\Finance\Services\ExpenditureAjuService;
use App\Modules\Procurement\Services\Concerns\InteractsWithRsudPagination;
use App\Support\RsudConnections;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ProcurementService
{
  use InteractsWithRsudPagination;

  private const BULAN_LABELS = [
    1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
    7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
  ];

  /** Tahap pengadaan (setelah AJU disetujui di Keuangan) */
  private const PROCUREMENT_STAGES = [
    'disetujui',
    'negosiasi',
    'surat-pesanan',
    'penerimaan-barang',
    'verifikasi-berkas',
    'rencana-bayar',
    'pembayaran-berhasil',
  ];

  public function __construct(
    private readonly ExpenditureAjuService $expenditureAjuService,
  ) {}

  public function meta(?int $budgetYearId = null): array
  {
    $tahun = $this->resolveTahun($budgetYearId);

    return [
      'tahun' => $tahun,
      'bulan_options' => collect(self::BULAN_LABELS)
        ->map(fn (string $label, int $value) => ['value' => $value, 'label' => $label])
        ->values()
        ->all(),
      'queue_options' => [
        ['value' => 'antrian', 'label' => 'Antrian Pengadaan (AJU Approved)'],
        ['value' => 'close', 'label' => 'AJU Close (Keuangan)'],
        ['value' => 'all', 'label' => 'Semua (Non Draft/Batal)'],
      ],
      'nego_status_options' => [
        ['value' => 'DRAFT', 'label' => 'Draft'],
        ['value' => 'SUBMITTED', 'label' => 'Diajukan'],
        ['value' => 'ORDERED', 'label' => 'Ordered / SP'],
        ['value' => 'VALIDATED', 'label' => 'Validated'],
        ['value' => 'CANCELED', 'label' => 'Dibatalkan'],
      ],
      'po_jenis_options' => [
        ['value' => 'all', 'label' => 'Semua Jenis'],
        ['value' => 'po', 'label' => 'Purchase Order'],
        ['value' => 'spk', 'label' => 'SPK'],
        ['value' => 'kontrak', 'label' => 'Kontrak'],
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
    $cacheKey = 'procurement_dashboard:'.$tahun.':'.($bulan ?? 'all');

    return Cache::remember($cacheKey, 120, function () use ($tahun, $bulan) {
      $ajuAntrian = $this->countFinanceAju($tahun, 'APPROVED', $bulan);
      $ajuClose = $this->countFinanceAju($tahun, 'CLOSE', $bulan);
      $negoAktif = $this->countNegoByStatus($tahun, ['DRAFT', 'SUBMITTED'], $bulan);
      $poAktif = $this->countPoh($tahun, $bulan, false);
      $penerimaan = $this->countInbelih($tahun, $bulan);
      $belumTagihan = $this->countInbelihBelumTukarFaktur($tahun, $bulan);

      return [
        'tahun' => $tahun,
        'bulan' => $bulan,
        'kpi' => [
          'aju_antrian' => $ajuAntrian,
          'aju_close' => $ajuClose,
          'negosiasi_aktif' => $negoAktif,
          'po_aktif' => $poAktif,
          'penerimaan' => $penerimaan,
          'belum_tukar_faktur' => $belumTagihan,
        ],
        'sources' => [
          'permintaan' => 'FINANCE.aju',
          'negosiasi' => 'FINANCE.nego_harga',
          'po' => 'SIMARTDB.POH / POD',
          'penerimaan' => 'SIMARTDB.INBELIH / INBELID',
          'vendor' => 'SIMARTDB.SUPL',
        ],
      ];
    });
  }

  /**
   * Permintaan barang/jasa — sumber FINANCE.aju (modul Keuangan).
   *
   * @param  array{
   *   budget_year_id: int,
   *   queue?: string,
   *   bulan?: int|null,
   *   search?: string,
   *   page?: int,
   *   per_page?: int
   * }  $filters
   */
  public function listPermintaan(array $filters): array
  {
    $queue = (string) ($filters['queue'] ?? 'antrian');

    if ($queue === 'close') {
      return $this->expenditureAjuService->list([
        'budget_year_id' => (int) $filters['budget_year_id'],
        'bulan' => $filters['bulan'] ?? null,
        'search' => $filters['search'] ?? null,
        'page' => $filters['page'] ?? 1,
        'per_page' => $filters['per_page'] ?? 20,
        'status' => 'sudah-dibayar',
      ]);
    }

    $result = $this->expenditureAjuService->list([
      'budget_year_id' => (int) $filters['budget_year_id'],
      'bulan' => $filters['bulan'] ?? null,
      'search' => $filters['search'] ?? null,
      'page' => 1,
      'per_page' => 5000,
    ]);

    $rows = collect($result['rows']);

    if ($queue === 'antrian') {
      $rows = $rows->filter(function (array $row) {
        if (($row['status_db'] ?? '') === 'APPROVED') {
          return true;
        }

        return in_array($row['tahap_proses'] ?? '', self::PROCUREMENT_STAGES, true)
          && ($row['status_db'] ?? '') !== 'CLOSE';
      });
    } else {
      $rows = $rows->reject(fn (array $row) => in_array($row['status_db'] ?? '', ['DRAFT', 'BATAL'], true)
        || ($row['tahap_proses'] ?? '') === 'ditolak');
    }

    $page = max(1, (int) ($filters['page'] ?? 1));
    $perPage = min(100, max(5, (int) ($filters['per_page'] ?? 20)));
    $total = $rows->count();
    $paged = $rows->slice(($page - 1) * $perPage, $perPage)->values();

    $noAjuList = $paged->pluck('no_pengajuan')->filter()->values()->all();
    $simartMap = $this->simartLinkageByAju($noAjuList);

    $enriched = $paged->map(function (array $row) use ($simartMap) {
      $noAju = (string) ($row['no_pengajuan'] ?? '');
      $link = $simartMap[$noAju] ?? null;

      return array_merge($row, [
        'sumber' => 'FINANCE',
        'no_po_simart' => $link['no_po'] ?? null,
        'no_beli_simart' => $link['no_beli'] ?? null,
        'jumlah_po' => $link['jumlah_po'] ?? 0,
        'jumlah_penerimaan' => $link['jumlah_penerimaan'] ?? 0,
      ]);
    })->all();

    return [
      'rows' => $enriched,
      'summary' => [
        'total_pengajuan' => $total,
        'total_nilai' => (float) $rows->sum('total'),
        'queue' => $queue,
        'sumber' => 'FINANCE.aju — permintaan dari modul Keuangan & Belanja',
      ],
      'meta' => [
        'total' => $total,
        'page' => $page,
        'per_page' => $perPage,
        'last_page' => max(1, (int) ceil($total / $perPage)),
        'from' => $total === 0 ? 0 : (($page - 1) * $perPage) + 1,
        'to' => min($page * $perPage, $total),
      ],
    ];
  }

  /**
   * @param  array{budget_year_id: int, bulan?: int|null, search?: string, page?: int, per_page?: int}  $filters
   */
  public function listNegosiasi(array $filters): array
  {
    $tahun = $this->resolveTahun((int) $filters['budget_year_id']);
    $bulan = isset($filters['bulan']) ? (int) $filters['bulan'] : null;
    $search = trim((string) ($filters['search'] ?? ''));
    $page = max(1, (int) ($filters['page'] ?? 1));
    $perPage = min(100, max(5, (int) ($filters['per_page'] ?? 20)));

    $bindings = [$tahun];
    $where = "
      WHERE a.deleted_at IS NULL
        AND a.tahun = ?
        AND n.no_nego IS NOT NULL
    ";
    $this->applyBulanFilter('n.created_at', $bulan, $bindings, $where);
    $this->applySearchFilter(
      ['n.no_nego', 'n.no_aju', 'a.nama_aju', 'a.catatan'],
      $search,
      $bindings,
      $where
    );

    $total = (int) (DB::connection(RsudConnections::FINANCE)->selectOne("
      SELECT COUNT(*) as aggregate
      FROM nego_harga n
      INNER JOIN aju a ON a.no_aju = n.no_aju AND a.deleted_at IS NULL
      {$where}
    ", $bindings)->aggregate ?? 0);

    $offset = ($page - 1) * $perPage;
    $bindingsPage = [...$bindings, $offset, $perPage];

    $rows = DB::connection(RsudConnections::FINANCE)->select("
      SELECT
        n.no_nego,
        n.no_aju,
        n.status as nego_status,
        n.created_at as tgl_nego,
        a.nama_aju,
        a.total as nilai_aju,
        a.status as aju_status,
        a.tgl as tgl_aju
      FROM nego_harga n
      INNER JOIN aju a ON a.no_aju = n.no_aju AND a.deleted_at IS NULL
      {$where}
      ORDER BY n.created_at DESC, n.no_nego DESC
      OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
    ", $bindingsPage);

    $totalNilai = (float) (DB::connection(RsudConnections::FINANCE)->selectOne("
      SELECT SUM(CAST(a.total AS float)) as aggregate
      FROM nego_harga n
      INNER JOIN aju a ON a.no_aju = n.no_aju AND a.deleted_at IS NULL
      {$where}
    ", $bindings)->aggregate ?? 0);

    return $this->paginatedResponse($rows, $total, $page, $perPage, [
      'total_nilai' => round($totalNilai, 2),
      'jumlah_nego' => $total,
      'sumber' => 'FINANCE.nego_harga',
    ], fn ($row) => [
      'no_nego' => (string) $row->no_nego,
      'no_aju' => (string) $row->no_aju,
      'nego_status' => (string) $row->nego_status,
      'nego_status_label' => $this->negoStatusLabel((string) $row->nego_status),
      'tgl_nego' => $this->formatDate($row->tgl_nego),
      'nama_aju' => (string) ($row->nama_aju ?? ''),
      'nilai_aju' => round((float) $row->nilai_aju, 2),
      'aju_status' => (string) $row->aju_status,
      'tgl_aju' => $this->formatDate($row->tgl_aju),
    ]);
  }

  /**
   * PO / SPK / Kontrak — SIMARTDB.POH + POD.
   *
   * @param  array{budget_year_id: int, jenis?: string, bulan?: int|null, search?: string, page?: int, per_page?: int}  $filters
   */
  public function listPo(array $filters): array
  {
    $tahun = $this->resolveTahun((int) $filters['budget_year_id']);
    $bulan = isset($filters['bulan']) ? (int) $filters['bulan'] : null;
    $search = trim((string) ($filters['search'] ?? ''));
    $jenis = (string) ($filters['jenis'] ?? 'all');
    $page = max(1, (int) ($filters['page'] ?? 1));
    $perPage = min(100, max(5, (int) ($filters['per_page'] ?? 20)));

    $bindings = [$tahun];
    $where = "
      WHERE YEAR(h.DTGPO) = ?
        AND (h.LBATAL IS NULL OR h.LBATAL <> 1)
    ";
    $this->applyBulanFilter('h.DTGPO', $bulan, $bindings, $where);
    $this->applySearchFilter(
      ['h.CNOPOLOG', 'h.CNOAJU', 'h.CNMSUPL', 'h.Uraian_Belanja', 'h.NO_SPK', 'h.NO_KONTRAK', 'h.CNODOK'],
      $search,
      $bindings,
      $where
    );
    $where .= $this->poJenisCondition($jenis);

    $total = (int) ($this->simart()->selectOne("SELECT COUNT(*) as aggregate FROM POH h {$where}", $bindings)->aggregate ?? 0);
    $offset = ($page - 1) * $perPage;
    $bindingsPage = [...$bindings, $offset, $perPage];

    $rows = $this->simart()->select("
      SELECT
        h.CNOPOLOG as no_po,
        h.DTGPO as tgl_po,
        h.CNOAJU as no_aju,
        h.CNMSUPL as nama_supplier,
        h.CKDSUPL as kode_supplier,
        h.CNMKELBLJ as kelompok_belanja,
        h.Uraian_Belanja as uraian,
        CAST(h.NTOTAL AS float) as total,
        CAST(h.NJMLBRG AS float) as jumlah_item,
        h.jenis_po,
        h.NO_SPK as no_spk,
        h.NO_KONTRAK as no_kontrak,
        h.NO_SPP as no_spp,
        h.CNOBELI as no_beli,
        h.LSDHTUTUP as tutup,
        h.LVALID as valid
      FROM POH h
      {$where}
      ORDER BY h.DTGPO DESC, h.CNOPOLOG DESC
      OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
    ", $bindingsPage);

    $totalNilai = (float) ($this->simart()->selectOne(
      "SELECT SUM(CAST(h.NTOTAL AS float)) as aggregate FROM POH h {$where}",
      $bindings
    )->aggregate ?? 0);

    return $this->paginatedResponse($rows, $total, $page, $perPage, [
      'total_nilai' => round($totalNilai, 2),
      'jumlah_po' => $total,
      'sumber' => 'SIMARTDB.POH / POD',
    ], fn ($row) => [
      'no_po' => (string) $row->no_po,
      'tgl_po' => $this->formatDate($row->tgl_po),
      'no_aju' => $row->no_aju ? (string) $row->no_aju : null,
      'nama_supplier' => (string) ($row->nama_supplier ?? ''),
      'kode_supplier' => (string) ($row->kode_supplier ?? ''),
      'kelompok_belanja' => (string) ($row->kelompok_belanja ?? ''),
      'uraian' => (string) ($row->uraian ?? ''),
      'total' => round((float) $row->total, 2),
      'jumlah_item' => (int) $row->jumlah_item,
      'jenis_po' => $row->jenis_po ? (string) $row->jenis_po : null,
      'jenis_label' => $this->poJenisLabel($row),
      'no_spk' => $row->no_spk ? (string) $row->no_spk : null,
      'no_kontrak' => $row->no_kontrak ? (string) $row->no_kontrak : null,
      'no_spp' => $row->no_spp ? (string) $row->no_spp : null,
      'no_beli' => $row->no_beli ? (string) $row->no_beli : null,
      'status_tutup' => ((int) ($row->tutup ?? 0)) === 1,
      'valid' => ((int) ($row->valid ?? 0)) === 1,
    ]);
  }

  /**
   * @return array{header: array<string, mixed>, lines: list<array<string, mixed>>}
   */
  public function poDetail(string $noPo): array
  {
    $header = $this->simart()->selectOne("
      SELECT
        h.CNOPOLOG as no_po,
        h.DTGPO as tgl_po,
        h.CNOAJU as no_aju,
        h.CNMSUPL as nama_supplier,
        h.CKDSUPL as kode_supplier,
        h.CNMKELBLJ as kelompok_belanja,
        h.Uraian_Belanja as uraian,
        CAST(h.NTOTAL AS float) as total,
        CAST(h.NPPN AS float) as ppn,
        CAST(h.PPH22 AS float) as pph22,
        CAST(h.PPH23 AS float) as pph23,
        h.jenis_po,
        h.NO_SPK as no_spk,
        h.NO_KONTRAK as no_kontrak,
        h.CNOBELI as no_beli,
        h.DTGJTTEMPO as jatuh_tempo,
        h.CNODOK as no_dokumen
      FROM POH h
      WHERE h.CNOPOLOG = ?
        AND (h.LBATAL IS NULL OR h.LBATAL <> 1)
    ", [$noPo]);

    if (! $header) {
      abort(404, 'Purchase order tidak ditemukan.');
    }

    $lines = $this->simart()->select("
      SELECT
        d.NURUT as urut,
        d.CKDBRG as kode_barang,
        d.CNMBRG as nama_barang,
        d.CSATUAN as satuan,
        CAST(d.NQTYPO AS float) as qty_po,
        CAST(d.NQTY_NEGO AS float) as qty_nego,
        CAST(d.NHRGBELI AS float) as harga,
        CAST(d.NSUBTOTAL AS float) as subtotal,
        CAST(d.NTOTAL AS float) as total,
        d.CMERK as merk,
        d.CTIPE as tipe,
        d.CSPESIFIKASI as spesifikasi
      FROM POD d
      WHERE d.CNOPOLOG = ?
        AND (d.LBATAL IS NULL OR d.LBATAL <> 1)
      ORDER BY d.NURUT
    ", [$noPo]);

    return [
      'header' => [
        'no_po' => (string) $header->no_po,
        'tgl_po' => $this->formatDate($header->tgl_po),
        'no_aju' => $header->no_aju ? (string) $header->no_aju : null,
        'nama_supplier' => (string) ($header->nama_supplier ?? ''),
        'kode_supplier' => (string) ($header->kode_supplier ?? ''),
        'kelompok_belanja' => (string) ($header->kelompok_belanja ?? ''),
        'uraian' => (string) ($header->uraian ?? ''),
        'total' => round((float) $header->total, 2),
        'ppn' => round((float) $header->ppn, 2),
        'pph22' => round((float) $header->pph22, 2),
        'pph23' => round((float) $header->pph23, 2),
        'jenis_label' => $this->poJenisLabel($header),
        'no_spk' => $header->no_spk ? (string) $header->no_spk : null,
        'no_kontrak' => $header->no_kontrak ? (string) $header->no_kontrak : null,
        'no_beli' => $header->no_beli ? (string) $header->no_beli : null,
        'jatuh_tempo' => $this->formatDate($header->jatuh_tempo),
        'no_dokumen' => $header->no_dokumen ? (string) $header->no_dokumen : null,
      ],
      'lines' => array_map(fn ($row) => [
        'urut' => (int) $row->urut,
        'kode_barang' => (string) ($row->kode_barang ?? ''),
        'nama_barang' => (string) ($row->nama_barang ?? ''),
        'satuan' => (string) ($row->satuan ?? ''),
        'qty_po' => round((float) $row->qty_po, 2),
        'qty_nego' => round((float) $row->qty_nego, 2),
        'harga' => round((float) $row->harga, 2),
        'subtotal' => round((float) $row->subtotal, 2),
        'total' => round((float) $row->total, 2),
        'merk' => $row->merk ? (string) $row->merk : null,
        'tipe' => $row->tipe ? (string) $row->tipe : null,
        'spesifikasi' => $row->spesifikasi ? (string) $row->spesifikasi : null,
      ], $lines),
    ];
  }

  /**
   * Penerimaan barang/jasa — SIMARTDB.INBELIH + INBELID.
   *
   * @param  array{budget_year_id: int, bulan?: int|null, search?: string, page?: int, per_page?: int}  $filters
   */
  public function listPenerimaan(array $filters): array
  {
    $tahun = $this->resolveTahun((int) $filters['budget_year_id']);
    $bulan = isset($filters['bulan']) ? (int) $filters['bulan'] : null;
    $search = trim((string) ($filters['search'] ?? ''));
    $page = max(1, (int) ($filters['page'] ?? 1));
    $perPage = min(100, max(5, (int) ($filters['per_page'] ?? 20)));

    $bindings = [$tahun];
    $where = "
      WHERE YEAR(h.DTGBELI) = ?
        AND (h.LBATAL IS NULL OR h.LBATAL <> 1)
    ";
    $this->applyBulanFilter('h.DTGBELI', $bulan, $bindings, $where);
    $this->applySearchFilter(
      ['h.CNOBELI', 'h.CNOAJU', 'h.CNOPOLOG', 'h.CNMSUPL', 'h.Uraian_Belanja', 'h.CNODOK'],
      $search,
      $bindings,
      $where
    );

    $total = (int) ($this->simart()->selectOne("SELECT COUNT(*) as aggregate FROM INBELIH h {$where}", $bindings)->aggregate ?? 0);
    $offset = ($page - 1) * $perPage;
    $bindingsPage = [...$bindings, $offset, $perPage];

    $rows = $this->simart()->select("
      SELECT
        h.CNOBELI as no_beli,
        h.DTGBELI as tgl_beli,
        h.CNOAJU as no_aju,
        h.CNOPOLOG as no_po,
        h.CNMSUPL as nama_supplier,
        h.CKDSUPL as kode_supplier,
        h.CNMKELBLJ as kelompok_belanja,
        h.Uraian_Belanja as uraian,
        CAST(h.NTOTAL AS float) as total,
        CAST(h.NJMLBRG AS float) as jumlah_item,
        h.NOMOR_BAST as no_bast,
        h.LSDHPROSES as sudah_proses
      FROM INBELIH h
      {$where}
      ORDER BY h.DTGBELI DESC, h.CNOBELI DESC
      OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
    ", $bindingsPage);

    $totalNilai = (float) ($this->simart()->selectOne(
      "SELECT SUM(CAST(h.NTOTAL AS float)) as aggregate FROM INBELIH h {$where}",
      $bindings
    )->aggregate ?? 0);

    return $this->paginatedResponse($rows, $total, $page, $perPage, [
      'total_nilai' => round($totalNilai, 2),
      'jumlah_penerimaan' => $total,
      'sumber' => 'SIMARTDB.INBELIH / INBELID',
    ], fn ($row) => [
      'no_beli' => (string) $row->no_beli,
      'tgl_beli' => $this->formatDate($row->tgl_beli),
      'no_aju' => $row->no_aju ? (string) $row->no_aju : null,
      'no_po' => $row->no_po ? (string) $row->no_po : null,
      'nama_supplier' => (string) ($row->nama_supplier ?? ''),
      'kode_supplier' => (string) ($row->kode_supplier ?? ''),
      'kelompok_belanja' => (string) ($row->kelompok_belanja ?? ''),
      'uraian' => (string) ($row->uraian ?? ''),
      'total' => round((float) $row->total, 2),
      'jumlah_item' => (int) $row->jumlah_item,
      'no_bast' => $row->no_bast ? (string) $row->no_bast : null,
      'sudah_proses' => ((int) ($row->sudah_proses ?? 0)) === 1,
    ]);
  }

  /**
   * @return array{header: array<string, mixed>, lines: list<array<string, mixed>>}
   */
  public function penerimaanDetail(string $noBeli): array
  {
    $header = $this->simart()->selectOne("
      SELECT
        h.CNOBELI as no_beli,
        h.DTGBELI as tgl_beli,
        h.CNOAJU as no_aju,
        h.CNOPOLOG as no_po,
        h.CNMSUPL as nama_supplier,
        h.CKDSUPL as kode_supplier,
        h.CNMKELBLJ as kelompok_belanja,
        h.Uraian_Belanja as uraian,
        CAST(h.NTOTAL AS float) as total,
        CAST(h.NPPN AS float) as ppn,
        CAST(h.PPH22 AS float) as pph22,
        CAST(h.PPH23 AS float) as pph23,
        h.NOMOR_BAST as no_bast,
        h.NOMOR_BAPP as no_bapp,
        h.DTGJTTEMPO as jatuh_tempo,
        h.CNODOK as no_dokumen
      FROM INBELIH h
      WHERE h.CNOBELI = ?
        AND (h.LBATAL IS NULL OR h.LBATAL <> 1)
    ", [$noBeli]);

    if (! $header) {
      abort(404, 'Penerimaan barang tidak ditemukan.');
    }

    $lines = $this->simart()->select("
      SELECT
        d.NURUT as urut,
        d.CKDBRG as kode_barang,
        d.CNMBRG as nama_barang,
        d.CSATUAN as satuan,
        CAST(d.NQTY AS float) as qty,
        CAST(d.NQTYTERIMA AS float) as qty_terima,
        CAST(d.NHRGBELI AS float) as harga,
        CAST(d.NSUBTOTAL AS float) as subtotal,
        CAST(d.NTOTAL AS float) as total,
        d.CNPOLOG as no_po,
        d.EXPDATE as exp_date,
        d.CNOBATCH as no_batch
      FROM INBELID d
      WHERE d.CNOBELI = ?
        AND (d.LBATAL IS NULL OR d.LBATAL <> 1)
      ORDER BY d.NURUT
    ", [$noBeli]);

    return [
      'header' => [
        'no_beli' => (string) $header->no_beli,
        'tgl_beli' => $this->formatDate($header->tgl_beli),
        'no_aju' => $header->no_aju ? (string) $header->no_aju : null,
        'no_po' => $header->no_po ? (string) $header->no_po : null,
        'nama_supplier' => (string) ($header->nama_supplier ?? ''),
        'kode_supplier' => (string) ($header->kode_supplier ?? ''),
        'kelompok_belanja' => (string) ($header->kelompok_belanja ?? ''),
        'uraian' => (string) ($header->uraian ?? ''),
        'total' => round((float) $header->total, 2),
        'ppn' => round((float) $header->ppn, 2),
        'pph22' => round((float) $header->pph22, 2),
        'pph23' => round((float) $header->pph23, 2),
        'no_bast' => $header->no_bast ? (string) $header->no_bast : null,
        'no_bapp' => $header->no_bapp ? (string) $header->no_bapp : null,
        'jatuh_tempo' => $this->formatDate($header->jatuh_tempo),
        'no_dokumen' => $header->no_dokumen ? (string) $header->no_dokumen : null,
      ],
      'lines' => array_map(fn ($row) => [
        'urut' => (int) $row->urut,
        'kode_barang' => (string) ($row->kode_barang ?? ''),
        'nama_barang' => (string) ($row->nama_barang ?? ''),
        'satuan' => (string) ($row->satuan ?? ''),
        'qty' => round((float) $row->qty, 2),
        'qty_terima' => round((float) $row->qty_terima, 2),
        'harga' => round((float) $row->harga, 2),
        'subtotal' => round((float) $row->subtotal, 2),
        'total' => round((float) $row->total, 2),
        'no_po' => $row->no_po ? (string) $row->no_po : null,
        'exp_date' => $this->formatDate($row->exp_date),
        'no_batch' => $row->no_batch ? (string) $row->no_batch : null,
      ], $lines),
    ];
  }

  /**
   * @param  array{search?: string, aktif?: string, page?: int, per_page?: int}  $filters
   */
  public function listVendor(array $filters): array
  {
    $search = trim((string) ($filters['search'] ?? ''));
    $aktif = (string) ($filters['aktif'] ?? 'aktif');
    $page = max(1, (int) ($filters['page'] ?? 1));
    $perPage = min(100, max(5, (int) ($filters['per_page'] ?? 20)));

    $bindings = [];
    $where = ' WHERE (s.LBATAL IS NULL OR s.LBATAL <> 1) ';

    if ($aktif === 'aktif') {
      $where .= ' AND (s.LAKTIF IS NULL OR s.LAKTIF = 1) ';
    } elseif ($aktif === 'nonaktif') {
      $where .= ' AND s.LAKTIF = 0 ';
    }

    $this->applySearchFilter(
      ['s.CKDSUPL', 's.CNMSUPL', 's.CNPWP', 's.CALSUPL1', 's.CPERSONSPL'],
      $search,
      $bindings,
      $where
    );

    $total = (int) ($this->simart()->selectOne("SELECT COUNT(*) as aggregate FROM SUPL s {$where}", $bindings)->aggregate ?? 0);
    $offset = ($page - 1) * $perPage;
    $bindingsPage = [...$bindings, $offset, $perPage];

    $rows = $this->simart()->select("
      SELECT
        s.CKDSUPL as kode_supplier,
        s.CNMSUPL as nama_supplier,
        s.LAKTIF as aktif,
        s.CNPWP as npwp,
        s.CPKP as pkp,
        s.CALSUPL1 as alamat,
        s.CTLPSUPL as telepon,
        s.CPERSONSPL as contact_person,
        s.CNMBANK as bank,
        s.CNOREK as rekening,
        s.FLAG_DAFTAR_HITAM as blacklist,
        s.ALASAN_DAFTAR_HITAM as alasan_blacklist
      FROM SUPL s
      {$where}
      ORDER BY s.CNMSUPL
      OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
    ", $bindingsPage);

    return $this->paginatedResponse($rows, $total, $page, $perPage, [
      'jumlah_vendor' => $total,
      'sumber' => 'SIMARTDB.SUPL',
    ], fn ($row) => [
      'kode_supplier' => (string) $row->kode_supplier,
      'nama_supplier' => (string) ($row->nama_supplier ?? ''),
      'aktif' => ((int) ($row->aktif ?? 0)) === 1,
      'npwp' => $row->npwp ? (string) $row->npwp : null,
      'pkp' => $row->pkp ? (string) $row->pkp : null,
      'alamat' => (string) ($row->alamat ?? ''),
      'telepon' => $row->telepon ? (string) $row->telepon : null,
      'contact_person' => $row->contact_person ? (string) $row->contact_person : null,
      'bank' => $row->bank ? (string) $row->bank : null,
      'rekening' => $row->rekening ? (string) $row->rekening : null,
      'blacklist' => ((int) ($row->blacklist ?? 0)) === 1,
      'alasan_blacklist' => $row->alasan_blacklist ? (string) $row->alasan_blacklist : null,
    ]);
  }

  /**
   * Monitoring pipeline: gabungan AJU → PO → Penerimaan.
   *
   * @param  array{budget_year_id: int, stage?: string|null, bulan?: int|null, search?: string, page?: int, per_page?: int}  $filters
   */
  public function listMonitoring(array $filters): array
  {
    $filters['queue'] = 'all';
    $result = $this->listPermintaan($filters);
    $stage = $filters['stage'] ?? null;

    if ($stage) {
      $result['rows'] = array_values(array_filter(
        $result['rows'],
        fn (array $row) => ($row['tahap_proses'] ?? '') === $stage
      ));
      $result['meta']['total'] = count($result['rows']);
    }

    $result['summary']['stage'] = $stage;
    $result['summary']['sumber'] = 'FINANCE.aju + SIMARTDB.POH/INBELIH';

    return $result;
  }

  private function resolveTahun(?int $budgetYearId): int
  {
    if (! $budgetYearId) {
      return (int) date('Y');
    }

    return (int) BudgetYear::query()->findOrFail($budgetYearId)->tahun;
  }

  private function simart()
  {
    return DB::connection(RsudConnections::SIMARTDB);
  }

  private function countFinanceAju(int $tahun, string $status, ?int $bulan): int
  {
    $bindings = [$tahun, $status];
    $sql = "SELECT COUNT(*) as aggregate FROM aju WHERE deleted_at IS NULL AND tahun = ? AND status = ?";
    if ($bulan) {
      $sql .= ' AND MONTH(tgl) = ?';
      $bindings[] = $bulan;
    }

    return (int) (DB::connection(RsudConnections::FINANCE)->selectOne($sql, $bindings)->aggregate ?? 0);
  }

  private function countNegoByStatus(int $tahun, array $statuses, ?int $bulan): int
  {
    $placeholders = implode(',', array_fill(0, count($statuses), '?'));
    $bindings = [$tahun, ...$statuses];
    $sql = "
      SELECT COUNT(*) as aggregate
      FROM nego_harga n
      INNER JOIN aju a ON a.no_aju = n.no_aju AND a.deleted_at IS NULL
      WHERE a.tahun = ? AND n.status IN ({$placeholders})
    ";
    if ($bulan) {
      $sql .= ' AND MONTH(n.created_at) = ?';
      $bindings[] = $bulan;
    }

    return (int) (DB::connection(RsudConnections::FINANCE)->selectOne($sql, $bindings)->aggregate ?? 0);
  }

  private function countPoh(int $tahun, ?int $bulan, bool $onlyOpen): int
  {
    $bindings = [$tahun];
    $sql = "
      SELECT COUNT(*) as aggregate FROM POH h
      WHERE YEAR(h.DTGPO) = ? AND (h.LBATAL IS NULL OR h.LBATAL <> 1)
    ";
    if ($onlyOpen) {
      $sql .= ' AND (h.LSDHTUTUP IS NULL OR h.LSDHTUTUP <> 1)';
    }
    $this->applyBulanFilter('h.DTGPO', $bulan, $bindings, $sql);

    return (int) ($this->simart()->selectOne($sql, $bindings)->aggregate ?? 0);
  }

  private function countInbelih(int $tahun, ?int $bulan): int
  {
    $bindings = [$tahun];
    $sql = "
      SELECT COUNT(*) as aggregate FROM INBELIH h
      WHERE YEAR(h.DTGBELI) = ? AND (h.LBATAL IS NULL OR h.LBATAL <> 1)
    ";
    $this->applyBulanFilter('h.DTGBELI', $bulan, $bindings, $sql);

    return (int) ($this->simart()->selectOne($sql, $bindings)->aggregate ?? 0);
  }

  private function countInbelihBelumTukarFaktur(int $tahun, ?int $bulan): int
  {
    $bindings = [$tahun];
    $sql = "
      SELECT COUNT(*) as aggregate FROM INBELIH h
      WHERE YEAR(h.DTGBELI) = ?
        AND (h.LBATAL IS NULL OR h.LBATAL <> 1)
        AND NOT EXISTS (
          SELECT 1 FROM TKRFKTRD d
          WHERE d.CNOBELI = h.CNOBELI AND (d.LBATAL IS NULL OR d.LBATAL <> 1)
        )
    ";
    $this->applyBulanFilter('h.DTGBELI', $bulan, $bindings, $sql);

    return (int) ($this->simart()->selectOne($sql, $bindings)->aggregate ?? 0);
  }

  /**
   * @param  list<string>  $noAjuList
   * @return array<string, array{no_po: ?string, no_beli: ?string, jumlah_po: int, jumlah_penerimaan: int}>
   */
  private function simartLinkageByAju(array $noAjuList): array
  {
    if ($noAjuList === []) {
      return [];
    }

    $placeholders = implode(',', array_fill(0, count($noAjuList), '?'));
    $poRows = $this->simart()->select("
      SELECT CNOAJU as no_aju, CNOPOLOG as no_po
      FROM POH
      WHERE CNOAJU IN ({$placeholders}) AND (LBATAL IS NULL OR LBATAL <> 1)
    ", $noAjuList);

    $beliRows = $this->simart()->select("
      SELECT CNOAJU as no_aju, CNOBELI as no_beli
      FROM INBELIH
      WHERE CNOAJU IN ({$placeholders}) AND (LBATAL IS NULL OR LBATAL <> 1)
    ", $noAjuList);

    $map = [];
    foreach ($noAjuList as $noAju) {
      $map[$noAju] = [
        'no_po' => null,
        'no_beli' => null,
        'jumlah_po' => 0,
        'jumlah_penerimaan' => 0,
      ];
    }

    foreach ($poRows as $row) {
      $key = (string) $row->no_aju;
      if (! isset($map[$key])) {
        continue;
      }
      $map[$key]['jumlah_po']++;
      $map[$key]['no_po'] ??= (string) $row->no_po;
    }

    foreach ($beliRows as $row) {
      $key = (string) $row->no_aju;
      if (! isset($map[$key])) {
        continue;
      }
      $map[$key]['jumlah_penerimaan']++;
      $map[$key]['no_beli'] ??= (string) $row->no_beli;
    }

    return $map;
  }

  private function poJenisCondition(string $jenis): string
  {
    return match ($jenis) {
      'spk' => " AND (h.NO_SPK IS NOT NULL AND LTRIM(RTRIM(h.NO_SPK)) <> '') ",
      'kontrak' => " AND (h.NO_KONTRAK IS NOT NULL AND LTRIM(RTRIM(h.NO_KONTRAK)) <> '') ",
      'po' => " AND (h.NO_SPK IS NULL OR LTRIM(RTRIM(h.NO_SPK)) = '') AND (h.NO_KONTRAK IS NULL OR LTRIM(RTRIM(h.NO_KONTRAK)) = '') ",
      default => '',
    };
  }

  private function poJenisLabel(object $row): string
  {
    if (! empty($row->no_kontrak)) {
      return 'Kontrak';
    }
    if (! empty($row->no_spk)) {
      return 'SPK';
    }
    $jenis = strtolower(trim((string) ($row->jenis_po ?? '')));
    if (str_contains($jenis, 'spk')) {
      return 'SPK';
    }
    if (str_contains($jenis, 'kontrak')) {
      return 'Kontrak';
    }

    return 'Purchase Order';
  }

  private function negoStatusLabel(string $status): string
  {
    return match (strtoupper($status)) {
      'DRAFT' => 'Draft',
      'SUBMITTED' => 'Diajukan',
      'ORDERED' => 'Surat Pesanan',
      'VALIDATED' => 'Tervalidasi',
      'CANCELED' => 'Dibatalkan',
      default => $status,
    };
  }
}
