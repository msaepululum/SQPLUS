<?php

namespace App\Modules\SupplyChain\Services;

use App\Support\RsudConnections;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;
use Throwable;

class SupplyChainDataService
{
    /** @var array<string, array{connection: string, table: string, label: string, search?: list<string>, order?: string}> */
    private const STAGES = [
        // master-barang
        'master-barang.permen' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'ms_barang_permen',
            'label' => 'Kode Barang Permen',
            'search' => ['kodeobjek', 'namaobjek', 'akun'],
            'order' => 'kodeobjek',
        ],
        'master-barang.invent-simart' => [
            'connection' => RsudConnections::SIMARTDB,
            'table' => 'INVENT',
            'label' => 'Master Barang SIMART',
            'search' => ['CKDBRG', 'CNMBRG', 'CNMKLASI'],
            'order' => 'CKDBRG',
        ],
        'master-barang.kategori' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'categories',
            'label' => 'Kategori Aset',
            'search' => ['category_name'],
            'order' => 'category_name',
        ],
        'master-barang.merk' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'brands',
            'label' => 'Merk / Brand',
            'search' => ['brand_name'],
            'order' => 'brand_name',
        ],
        'master-barang.satuan' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'units',
            'label' => 'Satuan',
            'search' => ['id', 'unit_name'],
            'order' => 'unit_name',
        ],
        'master-barang.kelompok' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'mskelompok_permen',
            'label' => 'Kelompok Permen',
            'search' => ['nama_kelompok'],
            'order' => 'nama_kelompok',
        ],

        // gudang-stok
        'gudang-stok.gudang' => [
            'connection' => RsudConnections::SIMARTDB,
            'table' => 'GUDANG',
            'label' => 'Master Gudang',
            'search' => ['CKDGUDANG', 'CNMGUDANG'],
            'order' => 'CKDGUDANG',
        ],
        'gudang-stok.stok-invent' => [
            'connection' => RsudConnections::SIMARTDB,
            'table' => 'INVENT',
            'label' => 'Stok Persediaan',
            'search' => ['CKDBRG', 'CNMBRG'],
            'order' => 'CKDBRG',
        ],
        'gudang-stok.lokasi-aset' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'msunitlokasi',
            'label' => 'Unit Lokasi',
            'search' => ['kodeunit', 'namaunit'],
            'order' => 'kodeunit',
        ],
        'gudang-stok.posisi-aset' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'asset_locations',
            'label' => 'Posisi Aset per Lokasi',
            'search' => ['serial_number', 'kodeunit'],
            'order' => 'id',
        ],

        // distribusi-barang
        'distribusi-barang.mutasi-unit' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'asset_mutations',
            'label' => 'Mutasi Unit',
            'search' => ['serial_number', 'from_lokasi', 'to_lokasi'],
            'order' => 'mutation_date',
        ],
        'distribusi-barang.mutasi-massal' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'asset_bulk_mutations',
            'label' => 'Mutasi Massal',
            'search' => ['mutation_no', 'mutation_name', 'pic'],
            'order' => 'mutation_date',
        ],

        // penerimaan-barang
        'penerimaan-barang.penerimaan-blj' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'asset_blj_h',
            'label' => 'Penerimaan BLJ',
            'search' => ['blj_no', 'no_bast', 'no_sp2d'],
            'order' => 'tgl_penerimaan',
        ],
        'penerimaan-barang.pembelian-aset' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'asset_purchases',
            'label' => 'Pembelian Aset',
            'search' => ['purchase_no', 'supplier_code'],
            'order' => 'purchase_date',
        ],
        'penerimaan-barang.transaksi-masuk' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'asset_H',
            'label' => 'Transaksi Masuk Aset',
            'search' => ['NOMOR_REFERENSI', 'NO_BAST', 'NO_PNB'],
            'order' => 'CREATED_AT',
        ],

        // stock-opname
        'stock-opname.sensus-bmd' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'sensus_bmd_hist',
            'label' => 'Riwayat Sensus BMD',
            'search' => ['PETUGAS_SENSUS', 'LOKASI_AKTUAL', 'STATUS_KEBERADAAN'],
            'order' => 'TGL_SENSUS',
        ],
        'stock-opname.verifikasi' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'verval_hist',
            'label' => 'Verifikasi & Validasi',
            'search' => ['user_valid', 'status_asset', 'keterangan'],
            'order' => 'valid_date',
        ],

        // batch-expired
        'batch-expired.stok-minimum' => [
            'connection' => RsudConnections::SIMARTDB,
            'table' => 'INVENT',
            'label' => 'Stok di Bawah Minimum',
            'search' => ['CKDBRG', 'CNMBRG'],
            'order' => 'CKDBRG',
        ],

        // asset-management
        'asset-management.register-bmd' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'Inventaris',
            'label' => 'Register BMD (Inventaris)',
            'search' => ['KOBAR', 'REG', 'JENIS_BARANG', 'KODE_RUANGAN'],
            'order' => 'ID',
        ],
        'asset-management.register-aset' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'assets',
            'label' => 'Register Aset Operasional',
            'search' => ['asset_code', 'asset_name', 'ms_barang_code'],
            'order' => 'asset_code',
        ],
        'asset-management.detail-lokasi' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'asset_locations',
            'label' => 'Detail Lokasi Aset',
            'search' => ['serial_number', 'kodeunit'],
            'order' => 'id',
        ],

        // mutasi-disposal
        'mutasi-disposal.mutasi' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'asset_mutations',
            'label' => 'Mutasi Aset',
            'search' => ['serial_number', 'from_lokasi', 'to_lokasi'],
            'order' => 'mutation_date',
        ],
        'mutasi-disposal.penghapusan' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'disposal_H',
            'label' => 'Berita Acara Penghapusan',
            'search' => ['NO_BERITA_ACARA', 'PIC', 'STATUS'],
            'order' => 'TGL_BERITA_ACARA',
        ],

        // approval
        'approval.mutasi-massal' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'asset_bulk_mutations',
            'label' => 'Approval Mutasi Massal',
            'search' => ['mutation_no', 'mutation_name'],
            'order' => 'submitted_at',
        ],
        'approval.penghapusan' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'disposal_H',
            'label' => 'Approval Penghapusan',
            'search' => ['NO_BERITA_ACARA', 'PIC'],
            'order' => 'SUBMITTED_AT',
        ],

        // laporan
        'laporan.inventaris' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'Inventaris',
            'label' => 'Laporan Inventaris BMD',
            'search' => ['KOBAR', 'JENIS_BARANG', 'KODE_RUANGAN'],
            'order' => 'KOBAR',
        ],
        'laporan.stok' => [
            'connection' => RsudConnections::SIMARTDB,
            'table' => 'INVENT',
            'label' => 'Laporan Stok Persediaan',
            'search' => ['CKDBRG', 'CNMBRG', 'CNMKLASI'],
            'order' => 'CKDBRG',
        ],
        'laporan.mutasi' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'asset_mutations',
            'label' => 'Laporan Mutasi',
            'search' => ['serial_number', 'from_lokasi', 'to_lokasi'],
            'order' => 'mutation_date',
        ],
        'laporan.penghapusan' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'disposal_H',
            'label' => 'Laporan Penghapusan',
            'search' => ['NO_BERITA_ACARA', 'STATUS'],
            'order' => 'TGL_PENGHAPUSAN',
        ],

        // pengaturan
        'pengaturan.gedung' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'msgedung',
            'label' => 'Master Gedung',
            'search' => ['kode_gedung', 'nama_gedung'],
            'order' => 'kode_gedung',
        ],
        'pengaturan.lantai' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'mslantai',
            'label' => 'Master Lantai',
            'search' => ['kodelantai', 'namalantai'],
            'order' => 'kodelantai',
        ],
        'pengaturan.ruangan' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'msruangan',
            'label' => 'Master Ruangan',
            'search' => ['kode_ruangan', 'nama_ruangan'],
            'order' => 'kode_ruangan',
        ],
        'pengaturan.kib' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'mskib',
            'label' => 'KIB / Jenis Barang',
            'search' => ['nama_jenis'],
            'order' => 'nama_jenis',
        ],
        'pengaturan.status' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'statuses',
            'label' => 'Status Aset',
            'search' => ['id', 'status_name'],
            'order' => 'status_name',
        ],
        'pengaturan.bahan' => [
            'connection' => RsudConnections::ASSET,
            'table' => 'msbahan',
            'label' => 'Master Bahan',
            'search' => ['NAMA'],
            'order' => 'NAMA',
        ],
    ];

    /** @var array<string, list<string>> */
    private const COLUMN_WHITELIST = [
        'INVENT' => [
            'CKDBRG', 'CNMBRG', 'CSATUAN1', 'CNMKLASI', 'NQTY1', 'NQTYMIN', 'NHRGNETTO',
            'NHPP', 'LSTOCK', 'NMAXORDER', 'CKDASET', 'CNMASET', 'LAKTIF', 'CATATAN',
        ],
        'Inventaris' => [
            'ID', 'KOBAR', 'REG', 'JENIS_BARANG', 'UKURAN', 'SATUAN', 'TGLOLEH', 'MERK',
            'HARGA', 'TOTAL', 'KODE_RUANGAN', 'KONDISI', 'STAT_VERIF', 'SENSUS_BMD', 'STATUS_PENGHAPUSAN',
        ],
    ];

    /** @return list<array<string, mixed>> */
    public function moduleMeta(): array
    {
        return [
            ['slug' => 'master-barang', 'stages' => $this->stagesForSlug('master-barang')],
            ['slug' => 'gudang-stok', 'stages' => $this->stagesForSlug('gudang-stok')],
            ['slug' => 'permintaan-barang', 'stages' => [], 'source' => 'sqplus'],
            ['slug' => 'distribusi-barang', 'stages' => $this->stagesForSlug('distribusi-barang')],
            ['slug' => 'penerimaan-barang', 'stages' => $this->stagesForSlug('penerimaan-barang')],
            ['slug' => 'stock-opname', 'stages' => $this->stagesForSlug('stock-opname')],
            ['slug' => 'batch-expired', 'stages' => $this->stagesForSlug('batch-expired')],
            ['slug' => 'asset-management', 'stages' => $this->stagesForSlug('asset-management')],
            ['slug' => 'maintenance-kalibrasi', 'stages' => [], 'source' => 'sqplus'],
            ['slug' => 'mutasi-disposal', 'stages' => $this->stagesForSlug('mutasi-disposal')],
            ['slug' => 'monitoring', 'stages' => []],
            ['slug' => 'approval', 'stages' => $this->stagesForSlug('approval')],
            ['slug' => 'laporan', 'stages' => $this->stagesForSlug('laporan')],
            ['slug' => 'pengaturan', 'stages' => $this->stagesForSlug('pengaturan')],
        ];
    }

    public function meta(): array
    {
        return [
            'stages' => array_map(
                fn (array $cfg, string $key) => [
                    'id' => substr($key, strpos($key, '.') + 1),
                    'slug' => explode('.', $key, 2)[0],
                    'label' => $cfg['label'],
                    'connection' => $cfg['connection'],
                    'table' => $cfg['table'],
                ],
                self::STAGES,
                array_keys(self::STAGES)
            ),
            'modules' => $this->moduleMeta(),
        ];
    }

    /**
     * @param  array{slug: string, stage: string, search?: string, page?: int, per_page?: int}  $filters
     */
    public function list(array $filters): array
    {
        $slug = $filters['slug'];
        $stage = $filters['stage'];
        $key = "{$slug}.{$stage}";

        if (! isset(self::STAGES[$key])) {
            return $this->emptyList("Stage {$key} belum dikonfigurasi.");
        }

        $cfg = self::STAGES[$key];
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(5, (int) ($filters['per_page'] ?? 20)));
        $search = trim((string) ($filters['search'] ?? ''));

        try {
            $query = DB::connection($cfg['connection'])->table($cfg['table']);
            $this->applyStageFilters($query, $key, $cfg);
            $this->applySearch($query, $cfg, $search);

            $total = (clone $query)->count();
            $order = $cfg['order'] ?? 'id';

            $rows = $query
                ->orderByDesc($order)
                ->forPage($page, $perPage)
                ->get()
                ->map(fn ($row) => $this->normalizeRow((array) $row, $cfg['table']))
                ->values()
                ->all();

            $columns = $rows !== []
                ? array_keys($rows[0])
                : $this->defaultColumns($cfg['table']);

            return [
                'data' => $rows,
                'columns' => $columns,
                'meta' => [
                    'slug' => $slug,
                    'stage' => $stage,
                    'label' => $cfg['label'],
                    'source' => RsudConnections::databaseName($cfg['connection']).'.'.$cfg['table'],
                    'connection' => $cfg['connection'],
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total' => $total,
                    'last_page' => max(1, (int) ceil($total / $perPage)),
                    'from' => $total === 0 ? 0 : (($page - 1) * $perPage) + 1,
                    'to' => min($total, $page * $perPage),
                ],
            ];
        } catch (Throwable $e) {
            return $this->emptyList('Gagal membaca data: '.$e->getMessage(), $slug, $stage, $cfg);
        }
    }

    /** @return list<array<string, mixed>> */
    public function alerts(int $limit = 10): array
    {
        $alerts = [];

        try {
            $lowStock = DB::connection(RsudConnections::SIMARTDB)
                ->table('INVENT')
                ->whereRaw('NQTY1 < NQTYMIN AND NQTYMIN > 0')
                ->count();
            if ($lowStock > 0) {
                $alerts[] = [
                    'jenis' => 'Stok',
                    'deskripsi' => 'Barang di bawah stok minimum',
                    'prioritas' => 'Tinggi',
                    'jumlah' => $lowStock,
                    'href' => '/supply-chain/batch-expired?tab=stok-minimum',
                ];
            }
        } catch (Throwable) {
            // ignore
        }

        try {
            $pendingMutasi = DB::connection(RsudConnections::ASSET)
                ->table('asset_bulk_mutations')
                ->whereIn('mutation_status', ['draft', 'submitted', 'pending'])
                ->count();
            if ($pendingMutasi > 0) {
                $alerts[] = [
                    'jenis' => 'Mutasi',
                    'deskripsi' => 'Mutasi massal menunggu approval',
                    'prioritas' => 'Sedang',
                    'jumlah' => $pendingMutasi,
                    'href' => '/supply-chain/approval?tab=mutasi-massal',
                ];
            }
        } catch (Throwable) {
            // ignore
        }

        try {
            $belumVerif = DB::connection(RsudConnections::ASSET)
                ->table('Inventaris')
                ->where(function (Builder $q) {
                    $q->whereNull('STAT_VERIF')->orWhere('STAT_VERIF', '!=', '1');
                })
                ->count();
            if ($belumVerif > 0) {
                $alerts[] = [
                    'jenis' => 'BMD',
                    'deskripsi' => 'Inventaris belum terverifikasi',
                    'prioritas' => 'Sedang',
                    'jumlah' => $belumVerif,
                    'href' => '/supply-chain/stock-opname?tab=verifikasi',
                ];
            }
        } catch (Throwable) {
            // ignore
        }

        try {
            $disposalDraft = DB::connection(RsudConnections::ASSET)
                ->table('disposal_H')
                ->whereIn('STATUS', ['draft', 'submitted'])
                ->count();
            if ($disposalDraft > 0) {
                $alerts[] = [
                    'jenis' => 'Penghapusan',
                    'deskripsi' => 'BA penghapusan menunggu proses',
                    'prioritas' => 'Rendah',
                    'jumlah' => $disposalDraft,
                    'href' => '/supply-chain/mutasi-disposal?tab=penghapusan',
                ];
            }
        } catch (Throwable) {
            // ignore
        }

        return array_slice($alerts, 0, $limit);
    }

    public function monitoring(): array
    {
        return [
            'alerts' => $this->alerts(limit: 20),
            'summary' => [
                'inventaris_by_kondisi' => $this->groupCount(RsudConnections::ASSET, 'Inventaris', 'KONDISI'),
                'invent_by_klasifikasi' => $this->topGroupCount(RsudConnections::SIMARTDB, 'INVENT', 'CNMKLASI', 8),
            ],
        ];
    }

    /** @return list<array{id: string, label: string, connection: string, table: string}> */
    private function stagesForSlug(string $slug): array
    {
        $out = [];
        foreach (self::STAGES as $key => $cfg) {
            if (! str_starts_with($key, "{$slug}.")) {
                continue;
            }
            $out[] = [
                'id' => substr($key, strlen($slug) + 1),
                'label' => $cfg['label'],
                'connection' => $cfg['connection'],
                'table' => $cfg['table'],
            ];
        }

        return $out;
    }

    private function applyStageFilters(Builder $query, string $key, array $cfg): void
    {
        if ($key === 'batch-expired.stok-minimum') {
            $query->whereRaw('NQTY1 < NQTYMIN AND NQTYMIN > 0');
        }

        if ($key === 'approval.mutasi-massal') {
            $query->whereIn('mutation_status', ['draft', 'submitted', 'pending']);
        }

        if ($key === 'approval.penghapusan') {
            $query->whereIn('STATUS', ['draft', 'submitted', 'pending']);
        }
    }

    private function applySearch(Builder $query, array $cfg, string $search): void
    {
        if ($search === '' || empty($cfg['search'])) {
            return;
        }

        $query->where(function (Builder $q) use ($cfg, $search) {
            foreach ($cfg['search'] as $col) {
                $q->orWhere($col, 'like', '%'.$search.'%');
            }
        });
    }

    /** @param  array<string, mixed>  $row */
    private function normalizeRow(array $row, string $table): array
    {
        $whitelist = self::COLUMN_WHITELIST[$table] ?? null;
        if ($whitelist === null) {
            return array_map(fn ($v) => is_string($v) ? trim($v) : $v, $row);
        }

        $out = [];
        foreach ($whitelist as $col) {
            if (array_key_exists($col, $row)) {
                $val = $row[$col];
                $out[$col] = is_string($val) ? trim($val) : $val;
            }
        }

        return $out;
    }

    /** @return list<string> */
    private function defaultColumns(string $table): array
    {
        return self::COLUMN_WHITELIST[$table] ?? ['id'];
    }

    /** @return list<array{label: string, count: int}> */
    private function groupCount(string $connection, string $table, string $column): array
    {
        try {
            return DB::connection($connection)
                ->table($table)
                ->selectRaw("COALESCE(NULLIF(LTRIM(RTRIM(CAST([{$column}] AS NVARCHAR(200)))), ''), '(kosong)') as label, COUNT(*) as cnt")
                ->groupBy($column)
                ->orderByDesc('cnt')
                ->limit(6)
                ->get()
                ->map(fn ($r) => ['label' => (string) $r->label, 'count' => (int) $r->cnt])
                ->all();
        } catch (Throwable) {
            return [];
        }
    }

    /** @return list<array{label: string, count: int}> */
    private function topGroupCount(string $connection, string $table, string $column, int $limit): array
    {
        try {
            return DB::connection($connection)
                ->table($table)
                ->selectRaw("COALESCE(NULLIF(LTRIM(RTRIM(CAST([{$column}] AS NVARCHAR(200)))), ''), '(kosong)') as label, COUNT(*) as cnt")
                ->groupBy($column)
                ->orderByDesc('cnt')
                ->limit($limit)
                ->get()
                ->map(fn ($r) => ['label' => (string) $r->label, 'count' => (int) $r->cnt])
                ->all();
        } catch (Throwable) {
            return [];
        }
    }

    private function emptyList(
        string $message,
        ?string $slug = null,
        ?string $stage = null,
        ?array $cfg = null
    ): array {
        return [
            'data' => [],
            'columns' => [],
            'meta' => [
                'slug' => $slug,
                'stage' => $stage,
                'label' => $cfg['label'] ?? null,
                'source' => isset($cfg)
                    ? RsudConnections::databaseName($cfg['connection']).'.'.$cfg['table']
                    : null,
                'connection' => $cfg['connection'] ?? null,
                'current_page' => 1,
                'per_page' => 20,
                'total' => 0,
                'last_page' => 1,
                'from' => 0,
                'to' => 0,
                'error' => $message,
            ],
        ];
    }
}
