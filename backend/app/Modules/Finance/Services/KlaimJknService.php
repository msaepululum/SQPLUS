<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\BudgetYear;
use App\Support\RsudConnections;
use Illuminate\Support\Facades\DB;

class KlaimJknService
{
    /** @var list<string> */
    private const TABLE_CANDIDATES = ['klaimbpjs', 'klaim_from_bpjs'];

    public function meta(?int $budgetYearId = null): array
    {
        $tahun = null;
        if ($budgetYearId) {
            $year = BudgetYear::query()->find($budgetYearId);
            $tahun = $year ? (int) $year->tahun : null;
        }

        $statusOptions = $this->statusOptions();

        return [
            'tahun' => $tahun,
            'source_table' => $this->resolveTable(),
            'source_db' => 'SIMRS_V2',
            'status_options' => $statusOptions,
        ];
    }

    /**
     * @param  array{
     *   tahun: int,
     *   status?: string|null,
     *   search?: string|null,
     *   page?: int,
     *   per_page?: int
     * }  $filters
     */
    public function index(array $filters): array
    {
        $tahun = (int) $filters['tahun'];
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(10, (int) ($filters['per_page'] ?? 20)));
        $search = trim((string) ($filters['search'] ?? ''));
        $status = isset($filters['status']) ? trim((string) $filters['status']) : null;

        $table = $this->resolveTable();
        $baseQuery = DB::connection(RsudConnections::SIMRS_V2)->table($table);

        $baseQuery->where(function ($q) use ($tahun) {
            $q->whereYear('tgl_pulang', $tahun)
                ->orWhereYear('tgl_sep', $tahun);
        });

        if ($status) {
            $baseQuery->where('status_kode', $status);
        }

        if ($search !== '') {
            $term = '%'.$search.'%';
            $baseQuery->where(function ($q) use ($term) {
                $q->where('nama', 'like', $term)
                    ->orWhere('no_sep', 'like', $term)
                    ->orWhere('no_mr', 'like', $term)
                    ->orWhere('no_fpk', 'like', $term)
                    ->orWhere('no_kartu', 'like', $term);
            });
        }

        $summaryQuery = clone $baseQuery;
        $summary = $summaryQuery->selectRaw('
            COUNT(*) as jumlah,
            SUM(CAST(by_pengajuan AS bigint)) as total_pengajuan,
            SUM(CAST(by_tarif_gruper AS bigint)) as total_gruper,
            SUM(CAST(by_tarif_rs AS bigint)) as total_tarif_rs,
            SUM(CAST(by_topup AS bigint)) as total_topup,
            SUM(CAST(by_setujui AS bigint)) as total_setujui
        ')->first();

        $total = (int) ($summary->jumlah ?? 0);
        $offset = ($page - 1) * $perPage;

        $rows = (clone $baseQuery)
            ->orderByDesc('tgl_pulang')
            ->orderByDesc('id_klaim')
            ->offset($offset)
            ->limit($perPage)
            ->get([
                'id_klaim',
                'no_fpk',
                'no_sep',
                'tgl_sep',
                'tgl_pulang',
                'no_kartu',
                'nama',
                'no_mr',
                'kelas_rawat',
                'poli',
                'status_kode',
                'by_pengajuan',
                'by_tarif_gruper',
                'by_tarif_rs',
                'by_topup',
                'by_setujui',
                'kode_inacbg',
                'nama_inacbg',
            ])
            ->map(fn ($row) => $this->mapRow($row))
            ->all();

        return [
            'rows' => $rows,
            'summary' => [
                'tahun' => $tahun,
                'jumlah_klaim' => $total,
                'total_pengajuan' => (int) ($summary->total_pengajuan ?? 0),
                'total_gruper' => (int) ($summary->total_gruper ?? 0),
                'total_tarif_rs' => (int) ($summary->total_tarif_rs ?? 0),
                'total_topup' => (int) ($summary->total_topup ?? 0),
                'total_setujui' => (int) ($summary->total_setujui ?? 0),
                'selisih_rs_gruper' => (int) (($summary->total_tarif_rs ?? 0) - ($summary->total_gruper ?? 0)),
            ],
            'meta' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => max(1, (int) ceil($total / $perPage)),
            ],
        ];
    }

    private function resolveTable(): string
    {
        static $resolved = null;
        if ($resolved !== null) {
            return $resolved;
        }

        foreach (self::TABLE_CANDIDATES as $candidate) {
            try {
                $exists = DB::connection(RsudConnections::SIMRS_V2)->select(
                    'SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = ?',
                    [$candidate]
                );
                if ($exists !== []) {
                    $resolved = $candidate;

                    return $resolved;
                }
            } catch (\Throwable) {
                continue;
            }
        }

        $resolved = 'klaim_from_bpjs';

        return $resolved;
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function statusOptions(): array
    {
        try {
            $table = $this->resolveTable();
            $rows = DB::connection(RsudConnections::SIMRS_V2)
                ->table($table)
                ->selectRaw('status_kode, COUNT(*) as cnt')
                ->whereNotNull('status_kode')
                ->whereRaw("RTRIM(status_kode) <> ''")
                ->groupBy('status_kode')
                ->orderByDesc('cnt')
                ->limit(15)
                ->get();

            return $rows->map(function ($row) {
                $code = trim((string) $row->status_kode);
                $label = $this->parseStatusLabel($code);

                return ['value' => $code, 'label' => $label];
            })->all();
        } catch (\Throwable) {
            return [];
        }
    }

    /**
     * @param  object  $row
     * @return array<string, mixed>
     */
    private function mapRow(object $row): array
    {
        $statusKode = trim((string) ($row->status_kode ?? ''));

        return [
            'id_klaim' => (int) $row->id_klaim,
            'no_fpk' => trim((string) ($row->no_fpk ?? '')),
            'no_sep' => trim((string) ($row->no_sep ?? '')),
            'tgl_sep' => $row->tgl_sep ? date('Y-m-d', strtotime((string) $row->tgl_sep)) : null,
            'tgl_pulang' => $row->tgl_pulang ? date('Y-m-d', strtotime((string) $row->tgl_pulang)) : null,
            'no_kartu' => trim((string) ($row->no_kartu ?? '')),
            'nama' => trim((string) ($row->nama ?? '')),
            'no_mr' => trim((string) ($row->no_mr ?? '')),
            'kelas_rawat' => trim((string) ($row->kelas_rawat ?? '')),
            'poli' => trim((string) ($row->poli ?? '')),
            'status_kode' => $statusKode,
            'status_label' => $this->parseStatusLabel($statusKode),
            'by_pengajuan' => (int) ($row->by_pengajuan ?? 0),
            'by_tarif_gruper' => (int) ($row->by_tarif_gruper ?? 0),
            'by_tarif_rs' => (int) ($row->by_tarif_rs ?? 0),
            'by_topup' => (int) ($row->by_topup ?? 0),
            'by_setujui' => (int) ($row->by_setujui ?? 0),
            'selisih_rs_gruper' => (int) (($row->by_tarif_rs ?? 0) - ($row->by_tarif_gruper ?? 0)),
            'kode_inacbg' => trim((string) ($row->kode_inacbg ?? '')),
            'nama_inacbg' => trim((string) ($row->nama_inacbg ?? '')),
        ];
    }

    private function parseStatusLabel(string $statusKode): string
    {
        if ($statusKode === '') {
            return '—';
        }

        if (str_contains($statusKode, '#')) {
            $parts = explode('#', $statusKode, 2);

            return trim($parts[1] ?? $statusKode);
        }

        return $statusKode;
    }
}
