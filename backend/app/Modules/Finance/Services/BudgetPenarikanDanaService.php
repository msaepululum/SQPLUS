<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\BudgetMonthlyWithdrawal;
use App\Modules\Finance\Models\BudgetYear;
use App\Support\RsudConnections;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BudgetPenarikanDanaService
{
    private const BULAN_LABELS = [
        1 => 'Jan',
        2 => 'Feb',
        3 => 'Mar',
        4 => 'Apr',
        5 => 'Mei',
        6 => 'Jun',
        7 => 'Jul',
        8 => 'Agu',
        9 => 'Sep',
        10 => 'Okt',
        11 => 'Nov',
        12 => 'Des',
    ];

    /**
     * @param  array{budget_year_id: int, ptk_id?: int, kelompok_belanja_id?: int, jenis_belanja_id?: int}  $filters
     * @return array{rows: array<int, array<string, mixed>>, summary: array<string, mixed>, bulan_labels: array<int, string>}
     */
    public function list(array $filters): array
    {
        $year = BudgetYear::query()->findOrFail($filters['budget_year_id']);
        $tahun = (string) $year->tahun;

        $query = DB::connection(RsudConnections::FINANCE)
            ->table('pagu_ksro as pk')
            ->join('ksro as k', 'k.id', '=', 'pk.ksro_id')
            ->join('pagu_jenis_belanja as pjb', 'pjb.id', '=', 'pk.pagu_jenis_belanja_id')
            ->join('pagu_kelompok_belanja as pkb', 'pkb.id', '=', 'pjb.pagu_kelompok_belanja_id')
            ->join('pagu as p', 'p.id', '=', 'pkb.pagu_id')
            ->join('ptk as pt', 'pt.id', '=', 'p.ptk_id')
            ->join('jenis_belanja as jb', 'jb.id', '=', 'pjb.jenis_belanja_id')
            ->join('kelompok_belanja as kb', 'kb.id', '=', 'pkb.kelompok_belanja_id')
            ->whereNull('pk.deleted_at')
            ->whereNull('k.deleted_at')
            ->whereNull('pjb.deleted_at')
            ->where('p.tahun', $tahun)
            ->select([
                'pk.id as pagu_ksro_id',
                'k.id as ksro_id',
                'k.kode_ksro',
                'k.nama_ksro',
                'p.ptk_id',
                'pt.nama_satuan_ptk',
                'pkb.kelompok_belanja_id',
                'kb.kode_kelompok_belanja',
                'pjb.jenis_belanja_id',
                'jb.kode_jenis_belanja',
                'pk.total_pagu as pagu_ksro_total',
                'pjb.total_pagu as pagu_induk_total',
            ])
            ->orderBy('pt.nama_satuan_ptk')
            ->orderBy('k.kode_ksro');

        if (! empty($filters['ptk_id'])) {
            $query->where('p.ptk_id', $filters['ptk_id']);
        }
        if (! empty($filters['kelompok_belanja_id'])) {
            $query->where('pkb.kelompok_belanja_id', $filters['kelompok_belanja_id']);
        }
        if (! empty($filters['jenis_belanja_id'])) {
            $query->where('pjb.jenis_belanja_id', $filters['jenis_belanja_id']);
        }

        $lines = $query->get();
        $paguKsroIds = $lines->pluck('pagu_ksro_id')->map(fn ($id) => (int) $id)->all();
        $ksroIds = $lines->pluck('ksro_id')->map(fn ($id) => (int) $id)->unique()->values()->all();

        $rencanaMap = $this->rencanaMap($year->id, $paguKsroIds);
        $realisasiMap = $this->realisasiMap($tahun, $ksroIds);

        $rows = [];
        $summaryMonths = array_fill(1, 12, ['rencana' => 0.0, 'realisasi' => 0.0]);

        foreach ($lines as $line) {
            $paguKsroId = (int) $line->pagu_ksro_id;
            $ksroId = (int) $line->ksro_id;
            $months = [];
            $totalRencana = 0.0;
            $totalRealisasi = 0.0;

            for ($bulan = 1; $bulan <= 12; $bulan++) {
                $rencana = (float) ($rencanaMap[$paguKsroId][$bulan] ?? 0);
                $realisasi = (float) ($realisasiMap[$ksroId][$bulan] ?? 0);
                $months[] = [
                    'bulan' => $bulan,
                    'nama_bulan' => self::BULAN_LABELS[$bulan],
                    'rencana' => $rencana,
                    'realisasi' => $realisasi,
                ];
                $totalRencana += $rencana;
                $totalRealisasi += $realisasi;
                $summaryMonths[$bulan]['rencana'] += $rencana;
                $summaryMonths[$bulan]['realisasi'] += $realisasi;
            }

            $rows[] = [
                'pagu_ksro_id' => $paguKsroId,
                'ksro_id' => $ksroId,
                'kode_ksro' => $line->kode_ksro,
                'nama_ksro' => $line->nama_ksro,
                'ptk_id' => (int) $line->ptk_id,
                'nama_satuan_ptk' => $line->nama_satuan_ptk,
                'kelompok_belanja_id' => (int) $line->kelompok_belanja_id,
                'kode_kelompok_belanja' => $line->kode_kelompok_belanja,
                'jenis_belanja_id' => (int) $line->jenis_belanja_id,
                'kode_jenis_belanja' => $line->kode_jenis_belanja,
                'pagu_ksro_total' => (float) $line->pagu_ksro_total,
                'pagu_induk_total' => (float) $line->pagu_induk_total,
                'months' => $months,
                'total_rencana' => $totalRencana,
                'total_realisasi' => $totalRealisasi,
            ];
        }

        $summaryMonthList = [];
        for ($bulan = 1; $bulan <= 12; $bulan++) {
            $summaryMonthList[] = [
                'bulan' => $bulan,
                'nama_bulan' => self::BULAN_LABELS[$bulan],
                'rencana' => $summaryMonths[$bulan]['rencana'],
                'realisasi' => $summaryMonths[$bulan]['realisasi'],
            ];
        }

        return [
            'rows' => $rows,
            'summary' => [
                'tahun' => (int) $year->tahun,
                'jumlah_baris' => count($rows),
                'total_rencana' => array_sum(array_map(fn ($m) => $m['rencana'], $summaryMonthList)),
                'total_realisasi' => array_sum(array_map(fn ($m) => $m['realisasi'], $summaryMonthList)),
                'months' => $summaryMonthList,
            ],
            'bulan_labels' => self::BULAN_LABELS,
        ];
    }

    /**
     * @param  array<int, array{pagu_ksro_id: int, bulan: int, rencana_penarikan: float|string}>  $items
     */
    public function bulkUpsert(int $budgetYearId, array $items): void
    {
        BudgetYear::query()->findOrFail($budgetYearId);

        foreach ($items as $item) {
            $bulan = (int) $item['bulan'];
            if ($bulan < 1 || $bulan > 12) {
                throw ValidationException::withMessages([
                    'bulan' => 'Bulan harus antara 1 dan 12.',
                ]);
            }

            $amount = (float) $item['rencana_penarikan'];
            if ($amount < 0) {
                throw ValidationException::withMessages([
                    'rencana_penarikan' => 'Rencana penarikan tidak boleh negatif.',
                ]);
            }

            BudgetMonthlyWithdrawal::query()->updateOrCreate(
                [
                    'budget_year_id' => $budgetYearId,
                    'pagu_ksro_id' => (int) $item['pagu_ksro_id'],
                    'bulan' => $bulan,
                ],
                ['rencana_penarikan' => $amount]
            );
        }
    }

    /**
     * @param  array<int>  $paguKsroIds
     * @return array<int, array<int, float>>
     */
    private function rencanaMap(int $budgetYearId, array $paguKsroIds): array
    {
        if ($paguKsroIds === []) {
            return [];
        }

        $rows = BudgetMonthlyWithdrawal::query()
            ->where('budget_year_id', $budgetYearId)
            ->whereIn('pagu_ksro_id', $paguKsroIds)
            ->get(['pagu_ksro_id', 'bulan', 'rencana_penarikan']);

        $map = [];
        foreach ($rows as $row) {
            $map[(int) $row->pagu_ksro_id][(int) $row->bulan] = (float) $row->rencana_penarikan;
        }

        return $map;
    }

    /**
     * @param  array<int>  $ksroIds
     * @return array<int, array<int, float>>
     */
    private function realisasiMap(string $tahun, array $ksroIds): array
    {
        if ($ksroIds === []) {
            return [];
        }

        $rows = DB::connection(RsudConnections::FINANCE)
            ->table('aju')
            ->whereNull('deleted_at')
            ->where('tahun', $tahun)
            ->whereIn('ksro_id', $ksroIds)
            ->whereNotNull('tgl')
            ->selectRaw('ksro_id, MONTH(tgl) as bulan, SUM(CAST(total AS FLOAT)) as realisasi')
            ->groupByRaw('ksro_id, MONTH(tgl)')
            ->get();

        $map = [];
        foreach ($rows as $row) {
            $map[(int) $row->ksro_id][(int) $row->bulan] = (float) $row->realisasi;
        }

        return $map;
    }
}
