<?php

namespace App\Modules\SupplyChain\Services;

use App\Support\RsudConnections;
use Illuminate\Support\Facades\DB;
use Throwable;

class SupplyChainDashboardService
{
    private const COMPOSITION_COLORS = [
        '#14B8A6', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#64748B',
    ];

    public function __construct(
        private readonly SupplyChainDataService $data
    ) {}

    public function dashboard(): array
    {
        $financial = $this->bmdFinancialSummary();
        $inventory = $this->simartInventorySummary();
        $operational = $this->operationalCounts();
        $composition = $this->compositionByKelompok();
        $perolehanTrend = $this->perolehanByYear();
        $kondisi = $this->kondisiBreakdown();

        return [
            'as_of' => now()->toIso8601String(),
            'sources' => [
                ['id' => 'asset', 'label' => 'ASSET_MANAJEMEN', 'connection' => RsudConnections::ASSET],
                ['id' => 'simart', 'label' => 'SIMARTDB', 'connection' => RsudConnections::SIMARTDB],
            ],
            'financial' => $financial,
            'inventory' => $inventory,
            'operational' => $operational,
            'composition' => $composition,
            'perolehan_trend' => $perolehanTrend,
            'kondisi' => $kondisi,
            'depreciation_note' => 'Estimasi penyusutan garis lurus: nilai perolehan ÷ masa manfaat (ms_barang_permen) × umur pemakaian.',
            'alerts' => $this->data->alerts(limit: 8),
        ];
    }

    /** @return array<string, float|int|string|null> */
    private function bmdFinancialSummary(): array
    {
        try {
            $row = DB::connection(RsudConnections::ASSET)->selectOne("
                SELECT
                    COUNT(*) as item_count,
                    SUM(perolehan) as nilai_perolehan,
                    SUM(akumulasi_penyusutan) as akumulasi_penyusutan,
                    SUM(nilai_buku) as nilai_buku,
                    SUM(penyusutan_tahun_ini) as estimasi_penyusutan_tahun_ini,
                    SUM(CASE WHEN masa_manfaat > 0 THEN 1 ELSE 0 END) as item_dengan_masa_manfaat
                FROM (
                    SELECT
                        TRY_CAST(REPLACE(LTRIM(RTRIM(COALESCE(NULLIF(i.TOTAL, ''), i.HARGA))), ',', '') AS DECIMAL(18,2)) as perolehan,
                        TRY_CAST(NULLIF(LTRIM(RTRIM(p.masa_manfaat)), '') AS INT) as masa_manfaat,
                        CASE
                            WHEN p.masa_manfaat IS NULL OR LTRIM(RTRIM(p.masa_manfaat)) IN ('', 'Tidak Disusutkan')
                                OR TRY_CAST(p.masa_manfaat AS INT) <= 0 THEN 0
                            ELSE
                                (TRY_CAST(REPLACE(LTRIM(RTRIM(COALESCE(NULLIF(i.TOTAL, ''), i.HARGA))), ',', '') AS DECIMAL(18,2))
                                    / TRY_CAST(p.masa_manfaat AS INT))
                                * (
                                    CASE
                                        WHEN DATEDIFF(MONTH, i.TGLOLEH, GETDATE()) / 12.0 > TRY_CAST(p.masa_manfaat AS INT)
                                            THEN TRY_CAST(p.masa_manfaat AS INT)
                                        ELSE DATEDIFF(MONTH, i.TGLOLEH, GETDATE()) / 12.0
                                    END
                                )
                        END as akumulasi_penyusutan,
                        CASE
                            WHEN p.masa_manfaat IS NULL OR LTRIM(RTRIM(p.masa_manfaat)) IN ('', 'Tidak Disusutkan')
                                OR TRY_CAST(p.masa_manfaat AS INT) <= 0
                                THEN TRY_CAST(REPLACE(LTRIM(RTRIM(COALESCE(NULLIF(i.TOTAL, ''), i.HARGA))), ',', '') AS DECIMAL(18,2))
                            ELSE
                                TRY_CAST(REPLACE(LTRIM(RTRIM(COALESCE(NULLIF(i.TOTAL, ''), i.HARGA))), ',', '') AS DECIMAL(18,2))
                                - (
                                    (TRY_CAST(REPLACE(LTRIM(RTRIM(COALESCE(NULLIF(i.TOTAL, ''), i.HARGA))), ',', '') AS DECIMAL(18,2))
                                        / TRY_CAST(p.masa_manfaat AS INT))
                                    * (
                                        CASE
                                            WHEN DATEDIFF(MONTH, i.TGLOLEH, GETDATE()) / 12.0 > TRY_CAST(p.masa_manfaat AS INT)
                                                THEN TRY_CAST(p.masa_manfaat AS INT)
                                            ELSE DATEDIFF(MONTH, i.TGLOLEH, GETDATE()) / 12.0
                                        END
                                    )
                                )
                        END as nilai_buku,
                        CASE
                            WHEN p.masa_manfaat IS NULL OR LTRIM(RTRIM(p.masa_manfaat)) IN ('', 'Tidak Disusutkan')
                                OR TRY_CAST(p.masa_manfaat AS INT) <= 0 THEN 0
                            WHEN DATEDIFF(MONTH, i.TGLOLEH, GETDATE()) / 12.0 >= TRY_CAST(p.masa_manfaat AS INT) THEN 0
                            ELSE TRY_CAST(REPLACE(LTRIM(RTRIM(COALESCE(NULLIF(i.TOTAL, ''), i.HARGA))), ',', '') AS DECIMAL(18,2))
                                / TRY_CAST(p.masa_manfaat AS INT)
                        END as penyusutan_tahun_ini
                    FROM Inventaris i
                    LEFT JOIN ms_barang_permen p ON LTRIM(RTRIM(i.KOBAR)) = LTRIM(RTRIM(p.kodeobjek))
                    WHERE (i.STATUS_PENGHAPUSAN IS NULL OR LTRIM(RTRIM(i.STATUS_PENGHAPUSAN)) = '' OR i.STATUS_PENGHAPUSAN = '0')
                        AND i.TGLOLEH IS NOT NULL
                        AND TRY_CAST(REPLACE(LTRIM(RTRIM(COALESCE(NULLIF(i.TOTAL, ''), i.HARGA))), ',', '') AS DECIMAL(18,2)) > 0
                ) sub
            ");

            $perolehan = (float) ($row->nilai_perolehan ?? 0);
            $akumulasi = (float) ($row->akumulasi_penyusutan ?? 0);
            $buku = (float) ($row->nilai_buku ?? 0);

            return [
                'nilai_perolehan_bmd' => round($perolehan, 2),
                'akumulasi_penyusutan' => round($akumulasi, 2),
                'nilai_buku_bmd' => round($buku, 2),
                'estimasi_penyusutan_tahun_ini' => round((float) ($row->estimasi_penyusutan_tahun_ini ?? 0), 2),
                'penyusutan_pct' => $perolehan > 0 ? round(($akumulasi / $perolehan) * 100, 1) : 0,
                'nilai_buku_pct' => $perolehan > 0 ? round(($buku / $perolehan) * 100, 1) : 0,
                'item_bmd_aktif' => (int) ($row->item_count ?? 0),
                'item_dengan_masa_manfaat' => (int) ($row->item_dengan_masa_manfaat ?? 0),
                'source' => 'ASSET_MANAJEMEN.Inventaris + ms_barang_permen',
            ];
        } catch (Throwable $e) {
            return $this->emptyFinancial($e->getMessage());
        }
    }

    /** @return array<string, float|int|string|null> */
    private function simartInventorySummary(): array
    {
        try {
            $row = DB::connection(RsudConnections::SIMARTDB)->selectOne("
                SELECT
                    COUNT(*) as master_barang,
                    SUM(CASE WHEN (LAKTIF = 1 OR LAKTIF IS NULL) AND NQTY1 > 0 THEN 1 ELSE 0 END) as item_aktif,
                    SUM(CASE WHEN (LAKTIF = 1 OR LAKTIF IS NULL) AND NQTY1 > 0 THEN NHPP * NQTY1 ELSE 0 END) as nilai_hpp,
                    SUM(CASE WHEN (LAKTIF = 1 OR LAKTIF IS NULL) AND NQTY1 > 0 THEN NHRGNETTO * NQTY1 ELSE 0 END) as nilai_netto,
                    SUM(CASE WHEN NQTY1 < NQTYMIN AND NQTYMIN > 0 THEN 1 ELSE 0 END) as stok_kritis
                FROM INVENT
            ");

            return [
                'master_barang' => (int) ($row->master_barang ?? 0),
                'item_aktif' => (int) ($row->item_aktif ?? 0),
                'nilai_persediaan_hpp' => round((float) ($row->nilai_hpp ?? 0), 2),
                'nilai_persediaan_netto' => round((float) ($row->nilai_netto ?? 0), 2),
                'stok_kritis' => (int) ($row->stok_kritis ?? 0),
                'source' => 'SIMARTDB.INVENT',
            ];
        } catch (Throwable $e) {
            return [
                'master_barang' => 0,
                'item_aktif' => 0,
                'nilai_persediaan_hpp' => 0,
                'nilai_persediaan_netto' => 0,
                'stok_kritis' => 0,
                'source' => 'SIMARTDB.INVENT',
                'error' => $e->getMessage(),
            ];
        }
    }

    /** @return array<string, int> */
    private function operationalCounts(): array
    {
        $out = [
            'register_bmd' => 0,
            'belum_verifikasi' => 0,
            'sudah_verifikasi' => 0,
            'mutasi_pending' => 0,
            'disposal_pending' => 0,
            'ruangan' => 0,
            'kode_permen' => 0,
        ];

        try {
            $verif = DB::connection(RsudConnections::ASSET)->selectOne("
                SELECT
                    COUNT(*) as total,
                    SUM(CASE WHEN LTRIM(RTRIM(COALESCE(STAT_VERIF, ''))) = '1' THEN 1 ELSE 0 END) as verified
                FROM Inventaris
                WHERE STATUS_PENGHAPUSAN IS NULL OR LTRIM(RTRIM(COALESCE(STATUS_PENGHAPUSAN, ''))) = '' OR STATUS_PENGHAPUSAN = '0'
            ");
            $out['register_bmd'] = (int) ($verif->total ?? 0);
            $out['sudah_verifikasi'] = (int) ($verif->verified ?? 0);
            $out['belum_verifikasi'] = $out['register_bmd'] - $out['sudah_verifikasi'];
        } catch (Throwable) {
            // ignore
        }

        foreach ([
            'mutasi_pending' => ['table' => 'asset_bulk_mutations', 'col' => 'mutation_status', 'vals' => ['draft', 'submitted', 'pending']],
            'disposal_pending' => ['table' => 'disposal_H', 'col' => 'STATUS', 'vals' => ['draft', 'submitted', 'pending']],
        ] as $key => $cfg) {
            try {
                $out[$key] = (int) DB::connection(RsudConnections::ASSET)
                    ->table($cfg['table'])
                    ->whereIn($cfg['col'], $cfg['vals'])
                    ->count();
            } catch (Throwable) {
                // ignore
            }
        }

        foreach ([
            'ruangan' => 'msruangan',
            'kode_permen' => 'ms_barang_permen',
        ] as $key => $table) {
            try {
                $out[$key] = (int) DB::connection(RsudConnections::ASSET)->table($table)->count();
            } catch (Throwable) {
                // ignore
            }
        }

        return $out;
    }

    /** @return list<array{label: string, count: int, value: float, pct: float, color: string}> */
    private function compositionByKelompok(): array
    {
        try {
            $rows = DB::connection(RsudConnections::ASSET)->select("
                SELECT
                    COALESCE(k.nama_kelompok, 'Tidak terklasifikasi') as label,
                    COUNT(*) as cnt,
                    SUM(TRY_CAST(REPLACE(LTRIM(RTRIM(i.TOTAL)), ',', '') AS DECIMAL(18,2))) as nilai
                FROM Inventaris i
                LEFT JOIN ms_barang_permen bp ON LTRIM(RTRIM(i.KOBAR)) = LTRIM(RTRIM(bp.kodeobjek))
                LEFT JOIN mskelompok_permen k ON bp.kelompok = k.id
                WHERE TRY_CAST(REPLACE(LTRIM(RTRIM(i.TOTAL)), ',', '') AS DECIMAL(18,2)) > 0
                GROUP BY k.nama_kelompok
                ORDER BY nilai DESC
            ");

            $total = array_sum(array_map(fn ($r) => (float) $r->nilai, $rows));
            $out = [];

            foreach ($rows as $i => $row) {
                $value = (float) ($row->nilai ?? 0);
                $out[] = [
                    'label' => (string) $row->label,
                    'count' => (int) $row->cnt,
                    'value' => round($value, 2),
                    'pct' => $total > 0 ? round(($value / $total) * 100, 1) : 0,
                    'color' => self::COMPOSITION_COLORS[$i % count(self::COMPOSITION_COLORS)],
                ];
            }

            return $out;
        } catch (Throwable) {
            return [];
        }
    }

    /** @return list<array{year: int, count: int, value: float}> */
    private function perolehanByYear(): array
    {
        try {
            $rows = DB::connection(RsudConnections::ASSET)->select("
                SELECT
                    YEAR(TGLOLEH) as yr,
                    COUNT(*) as cnt,
                    SUM(TRY_CAST(REPLACE(LTRIM(RTRIM(TOTAL)), ',', '') AS DECIMAL(18,2))) as nilai
                FROM Inventaris
                WHERE TGLOLEH IS NOT NULL
                    AND YEAR(TGLOLEH) >= YEAR(GETDATE()) - 7
                GROUP BY YEAR(TGLOLEH)
                ORDER BY yr ASC
            ");

            return array_map(fn ($r) => [
                'year' => (int) $r->yr,
                'count' => (int) $r->cnt,
                'value' => round((float) ($r->nilai ?? 0), 2),
            ], $rows);
        } catch (Throwable) {
            return [];
        }
    }

    /** @return list<array{label: string, count: int}> */
    private function kondisiBreakdown(): array
    {
        try {
            return DB::connection(RsudConnections::ASSET)
                ->select("
                    SELECT
                        COALESCE(NULLIF(LTRIM(RTRIM(KONDISI)), ''), 'Belum diisi') as label,
                        COUNT(*) as cnt
                    FROM Inventaris
                    GROUP BY KONDISI
                    ORDER BY cnt DESC
                ")
                ->map(fn ($r) => ['label' => (string) $r->label, 'count' => (int) $r->cnt])
                ->all();
        } catch (Throwable) {
            return [];
        }
    }

    /** @return array<string, float|int|string|null> */
    private function emptyFinancial(string $error): array
    {
        return [
            'nilai_perolehan_bmd' => 0,
            'akumulasi_penyusutan' => 0,
            'nilai_buku_bmd' => 0,
            'estimasi_penyusutan_tahun_ini' => 0,
            'penyusutan_pct' => 0,
            'nilai_buku_pct' => 0,
            'item_bmd_aktif' => 0,
            'item_dengan_masa_manfaat' => 0,
            'source' => 'ASSET_MANAJEMEN.Inventaris',
            'error' => $error,
        ];
    }
}
