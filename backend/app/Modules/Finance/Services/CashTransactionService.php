<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\BudgetYear;
use App\Modules\Finance\Models\CashTransaction;
use App\Modules\Finance\Models\CashTransactionLine;
use App\Support\RsudConnections;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CashTransactionService
{
    /** @var list<string> */
    private const MASUK_TYPES = ['BKM', 'BBM'];

    /** @var list<string> */
    private const KELUAR_TYPES = ['BBK', 'BKK'];

    /** @var list<string> */
    private const RIWAYAT_TYPES = ['BKM', 'BBM', 'BBK', 'BKK', 'BBA', 'BKA'];

    /** @var array<string, string> */
    private const JOURNAL_TYPE_LABELS = [
        'BKM' => 'Bukti Kas Masuk',
        'BBM' => 'Bukti Bank Masuk',
        'BKK' => 'Bukti Kas Keluar',
        'BBK' => 'Bukti Bank Keluar',
        'BBA' => 'Beban Administrasi Bank',
        'BKA' => 'Bukti Kas Adjust',
        'BIL' => 'Billing',
        'BIF' => 'Billing Farmasi',
    ];

    private const BULAN_LABELS = [
        1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
        7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
    ];

    /** @var list<string>|null */
    private ?array $kasAccountNos = null;

    public function meta(?int $budgetYearId = null): array
    {
        $tahun = null;
        if ($budgetYearId) {
            $year = BudgetYear::query()->find($budgetYearId);
            $tahun = $year ? (int) $year->tahun : null;
        }

        return [
            'journal_type_options' => collect(self::JOURNAL_TYPE_LABELS)
                ->map(fn (string $label, string $value) => ['value' => $value, 'label' => $label])
                ->values()
                ->all(),
            'flow_type_options' => [
                ['value' => CashTransaction::FLOW_MASUK, 'label' => 'Kas Masuk'],
                ['value' => CashTransaction::FLOW_KELUAR, 'label' => 'Kas Keluar'],
            ],
            'bulan_options' => collect(self::BULAN_LABELS)
                ->map(fn (string $label, int $value) => ['value' => $value, 'label' => $label])
                ->values()
                ->all(),
            'kas_account_options' => $this->kasAccountOptions(),
            'bank_account_options' => $this->bankAccountOptions(),
            'source_options' => [
                ['value' => 'all', 'label' => 'Semua Sumber'],
                ['value' => CashTransaction::SOURCE_ACC2026, 'label' => 'ACC2026 (Akuntansi)'],
                ['value' => CashTransaction::SOURCE_MANUAL, 'label' => 'Input Manual SQ+'],
            ],
            'tahun' => $tahun,
            'acc_connection' => 'ACC2026',
        ];
    }

    /**
     * @param  array{
     *   budget_year_id: int,
     *   flow_type?: string,
     *   bulan?: int,
     *   kas_account_no?: string,
     *   journal_type?: string,
     *   source?: string,
     *   search?: string,
     *   tanggal_from?: string,
     *   tanggal_to?: string,
     *   page?: int,
     *   per_page?: int
     * }  $filters
     */
    public function list(array $filters): array
    {
        $year = BudgetYear::query()->findOrFail($filters['budget_year_id']);
        $tahun = (int) $year->tahun;
        $requestedFlow = $filters['flow_type'] ?? null;
        $accFlow = $requestedFlow === 'riwayat' ? null : $requestedFlow;
        $rowFlowFilter = $requestedFlow === 'riwayat' ? null : $requestedFlow;
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(5, (int) ($filters['per_page'] ?? 15)));
        $sourceFilter = $filters['source'] ?? 'all';

        $accFilters = array_merge($filters, ['flow_type' => $accFlow]);

        $accRows = $sourceFilter !== CashTransaction::SOURCE_MANUAL
            ? $this->fetchAccRows($tahun, $accFilters)
            : collect();

        $manualRows = $sourceFilter !== CashTransaction::SOURCE_ACC2026
            ? $this->fetchManualRows($year->id, $accFilters)
            : collect();

        $merged = $accRows
            ->concat($manualRows)
            ->sortByDesc(fn (array $row) => $row['tanggal'].'#'.$row['id'])
            ->values();

        if ($rowFlowFilter) {
            $merged = $merged->filter(fn (array $row) => $row['flow_type'] === $rowFlowFilter)->values();
        }

        $total = $merged->count();
        $rows = $merged->slice(($page - 1) * $perPage, $perPage)->values()->all();

        $totalMasuk = $merged->where('flow_type', CashTransaction::FLOW_MASUK)->sum('amount');
        $totalKeluar = $merged->where('flow_type', CashTransaction::FLOW_KELUAR)->sum('amount');

        return [
            'rows' => $rows,
            'summary' => [
                'budget_year_id' => $year->id,
                'tahun' => $tahun,
                'jumlah_baris' => $total,
                'total_masuk' => round((float) $totalMasuk, 4),
                'total_keluar' => round((float) $totalKeluar, 4),
                'saldo_netto' => round((float) $totalMasuk - (float) $totalKeluar, 4),
            ],
            'meta' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => max(1, (int) ceil($total / $perPage)),
            ],
        ];
    }

    public function show(string $id, int $budgetYearId): array
    {
        if (str_starts_with($id, 'acc:')) {
            $noJurnal = substr($id, 4);

            return $this->formatAccDetail($noJurnal, $budgetYearId);
        }

        $row = CashTransaction::query()
            ->with('lines')
            ->where('budget_year_id', $budgetYearId)
            ->findOrFail((int) $id);

        return $this->formatManualDetail($row);
    }

    /**
     * @param  array{
     *   budget_year_id: int,
     *   flow_type: string,
     *   journal_type: string,
     *   tanggal: string,
     *   keterangan?: string|null,
     *   no_bukti?: string|null,
     *   kas_account_no: string,
     *   kas_account_name?: string|null,
     *   lines: list<array{account_no: string, account_name?: string|null, keterangan?: string|null, debet: float|int|string, kredit: float|int|string}>
     * }  $data
     */
    public function create(array $data, ?string $createdBy = null): array
    {
        $this->assertBalancedLines($data['lines']);
        $year = BudgetYear::query()->findOrFail($data['budget_year_id']);
        $flowType = $data['flow_type'];
        $journalType = $data['journal_type'];

        $this->assertJournalTypeForFlow($flowType, $journalType);

        $kasLine = $this->resolveKasLine($data['lines'], $data['kas_account_no']);
        $amount = $flowType === CashTransaction::FLOW_MASUK
            ? (float) $kasLine['debet']
            : (float) $kasLine['kredit'];

        if ($amount <= 0) {
            throw ValidationException::withMessages([
                'amount' => ['Nominal transaksi kas harus lebih dari nol.'],
            ]);
        }

        return DB::transaction(function () use ($data, $year, $flowType, $journalType, $amount, $createdBy) {
            $noJurnal = $this->nextManualJournalNo($year->id, $journalType, (int) $year->tahun);

            $transaction = CashTransaction::query()->create([
                'budget_year_id' => $year->id,
                'flow_type' => $flowType,
                'journal_type' => $journalType,
                'tanggal' => $data['tanggal'],
                'no_jurnal' => $noJurnal,
                'keterangan' => $data['keterangan'] ?? null,
                'no_bukti' => $data['no_bukti'] ?? null,
                'kas_account_no' => trim($data['kas_account_no']),
                'kas_account_name' => $data['kas_account_name'] ?? null,
                'amount' => $amount,
                'source' => CashTransaction::SOURCE_MANUAL,
                'status' => CashTransaction::STATUS_DRAFT,
                'created_by' => $createdBy,
            ]);

            $this->syncLines($transaction, $data['lines']);

            return $this->formatManualDetail($transaction->fresh('lines'));
        });
    }

    /**
     * @param  array{
     *   tanggal?: string,
     *   keterangan?: string|null,
     *   no_bukti?: string|null,
     *   kas_account_no?: string,
     *   kas_account_name?: string|null,
     *   lines?: list<array{account_no: string, account_name?: string|null, keterangan?: string|null, debet: float|int|string, kredit: float|int|string}>
     * }  $data
     */
    public function update(int $id, array $data): array
    {
        $transaction = CashTransaction::query()->with('lines')->findOrFail($id);

        if ($transaction->source !== CashTransaction::SOURCE_MANUAL) {
            throw ValidationException::withMessages([
                'id' => ['Transaksi dari ACC2026 tidak dapat diubah.'],
            ]);
        }

        if ($transaction->status === CashTransaction::STATUS_POSTED) {
            throw ValidationException::withMessages([
                'status' => ['Transaksi yang sudah diposting tidak dapat diubah.'],
            ]);
        }

        if (isset($data['lines'])) {
            $this->assertBalancedLines($data['lines']);
        }

        return DB::transaction(function () use ($transaction, $data) {
            if (isset($data['tanggal'])) {
                $transaction->tanggal = $data['tanggal'];
            }
            if (array_key_exists('keterangan', $data)) {
                $transaction->keterangan = $data['keterangan'];
            }
            if (array_key_exists('no_bukti', $data)) {
                $transaction->no_bukti = $data['no_bukti'];
            }
            if (isset($data['kas_account_no'])) {
                $transaction->kas_account_no = trim($data['kas_account_no']);
            }
            if (array_key_exists('kas_account_name', $data)) {
                $transaction->kas_account_name = $data['kas_account_name'];
            }

            if (isset($data['lines'])) {
                $kasLine = $this->resolveKasLine($data['lines'], $transaction->kas_account_no);
                $transaction->amount = $transaction->flow_type === CashTransaction::FLOW_MASUK
                    ? (float) $kasLine['debet']
                    : (float) $kasLine['kredit'];
                $this->syncLines($transaction, $data['lines']);
            }

            $transaction->save();

            return $this->formatManualDetail($transaction->fresh('lines'));
        });
    }

    public function delete(int $id): void
    {
        $transaction = CashTransaction::query()->findOrFail($id);

        if ($transaction->source !== CashTransaction::SOURCE_MANUAL) {
            throw ValidationException::withMessages([
                'id' => ['Transaksi dari ACC2026 tidak dapat dihapus.'],
            ]);
        }

        if ($transaction->status === CashTransaction::STATUS_POSTED) {
            throw ValidationException::withMessages([
                'status' => ['Transaksi yang sudah diposting tidak dapat dihapus.'],
            ]);
        }

        $transaction->delete();
    }

    public function post(int $id): array
    {
        $transaction = CashTransaction::query()->with('lines')->findOrFail($id);

        if ($transaction->source !== CashTransaction::SOURCE_MANUAL) {
            throw ValidationException::withMessages([
                'id' => ['Hanya transaksi manual yang dapat diposting.'],
            ]);
        }

        if ($transaction->status === CashTransaction::STATUS_POSTED) {
            throw ValidationException::withMessages([
                'status' => ['Transaksi sudah diposting.'],
            ]);
        }

        $lines = $transaction->lines->map(fn (CashTransactionLine $line) => [
            'account_no' => $line->account_no,
            'account_name' => $line->account_name,
            'keterangan' => $line->keterangan,
            'debet' => (float) $line->debet,
            'kredit' => (float) $line->kredit,
        ])->all();

        $this->assertBalancedLines($lines);

        $transaction->status = CashTransaction::STATUS_POSTED;
        $transaction->save();

        return $this->formatManualDetail($transaction->fresh('lines'));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function fetchAccRows(int $tahun, array $filters): Collection
    {
        $types = $this->resolveJournalTypes($filters['flow_type'] ?? null);
        if (! empty($filters['journal_type'])) {
            $types = array_values(array_intersect($types, [$filters['journal_type']]));
        }

        if ($types === []) {
            return collect();
        }

        $query = DB::connection(RsudConnections::ACC2026)
            ->table('JURNAL_H as h')
            ->whereYear('h.dtgljurnal', $tahun)
            ->where(function ($q) {
                $q->whereNull('h.lbatal')->orWhere('h.lbatal', '<>', 1);
            })
            ->whereIn('h.ckeljurnal', $types);

        if (! empty($filters['bulan'])) {
            $query->whereRaw('MONTH(h.dtgljurnal) = ?', [(int) $filters['bulan']]);
        }
        if (! empty($filters['tanggal_from'])) {
            $query->whereDate('h.dtgljurnal', '>=', $filters['tanggal_from']);
        }
        if (! empty($filters['tanggal_to'])) {
            $query->whereDate('h.dtgljurnal', '<=', $filters['tanggal_to']);
        }
        if (! empty($filters['kas_account_no'])) {
            $acc = trim((string) $filters['kas_account_no']);
            $query->whereRaw('RTRIM(h.cno_acc) = ?', [$acc]);
        }
        if (! empty($filters['search'])) {
            $term = '%'.trim((string) $filters['search']).'%';
            $query->where(function ($q) use ($term) {
                $q->where('h.cket', 'like', $term)
                    ->orWhere('h.cnojurnal', 'like', $term)
                    ->orWhere('h.cnobukti', 'like', $term)
                    ->orWhere('h.cnobeli', 'like', $term);
            });
        }

        return $query
            ->orderByDesc('h.dtgljurnal')
            ->orderByDesc('h.cnojurnal')
            ->limit(500)
            ->get([
                'h.cnojurnal',
                'h.dtgljurnal',
                'h.cket',
                'h.cnobukti',
                'h.cnobeli',
                'h.ndebet',
                'h.nkredit',
                'h.cno_acc',
                'h.cnm_acc',
                'h.ckeljurnal',
                'h.lvalid',
                'h.lsdhproses',
            ])
            ->map(fn ($row) => $this->formatAccRow($row));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function fetchManualRows(int $budgetYearId, array $filters): Collection
    {
        $query = CashTransaction::query()
            ->where('budget_year_id', $budgetYearId)
            ->where('source', CashTransaction::SOURCE_MANUAL);

        if (! empty($filters['flow_type'])) {
            $query->where('flow_type', $filters['flow_type']);
        }
        if (! empty($filters['journal_type'])) {
            $query->where('journal_type', $filters['journal_type']);
        }
        if (! empty($filters['bulan'])) {
            $query->whereRaw('MONTH(tanggal) = ?', [(int) $filters['bulan']]);
        }
        if (! empty($filters['tanggal_from'])) {
            $query->whereDate('tanggal', '>=', $filters['tanggal_from']);
        }
        if (! empty($filters['tanggal_to'])) {
            $query->whereDate('tanggal', '<=', $filters['tanggal_to']);
        }
        if (! empty($filters['kas_account_no'])) {
            $query->where('kas_account_no', trim((string) $filters['kas_account_no']));
        }
        if (! empty($filters['search'])) {
            $term = '%'.trim((string) $filters['search']).'%';
            $query->where(function ($q) use ($term) {
                $q->where('keterangan', 'like', $term)
                    ->orWhere('no_jurnal', 'like', $term)
                    ->orWhere('no_bukti', 'like', $term);
            });
        }

        return $query
            ->orderByDesc('tanggal')
            ->orderByDesc('id')
            ->get()
            ->map(fn (CashTransaction $row) => $this->formatManualRow($row));
    }

    private function formatAccRow(object $row): array
    {
        $journalType = trim((string) ($row->ckeljurnal ?? ''));
        $flowType = in_array($journalType, self::MASUK_TYPES, true)
            ? CashTransaction::FLOW_MASUK
            : (in_array($journalType, self::KELUAR_TYPES, true) ? CashTransaction::FLOW_KELUAR : 'lainnya');

        $amount = max((float) ($row->ndebet ?? 0), (float) ($row->nkredit ?? 0));

        return [
            'id' => 'acc:'.trim((string) $row->cnojurnal),
            'no_jurnal' => trim((string) $row->cnojurnal),
            'tanggal' => $row->dtgljurnal ? date('Y-m-d', strtotime((string) $row->dtgljurnal)) : null,
            'flow_type' => $flowType,
            'journal_type' => $journalType,
            'journal_type_label' => self::JOURNAL_TYPE_LABELS[$journalType] ?? $journalType,
            'keterangan' => trim((string) ($row->cket ?? '')),
            'no_bukti' => trim((string) ($row->cnobukti ?? '')),
            'referensi' => trim((string) ($row->cnobeli ?? '')),
            'kas_account_no' => trim((string) ($row->cno_acc ?? '')),
            'kas_account_name' => trim((string) ($row->cnm_acc ?? '')),
            'amount' => round($amount, 4),
            'source' => CashTransaction::SOURCE_ACC2026,
            'status' => ((int) ($row->lvalid ?? 0)) === 1 ? 'valid' : 'draft',
            'posted' => ((int) ($row->lsdhproses ?? 0)) === 1,
            'editable' => false,
        ];
    }

    private function formatManualRow(CashTransaction $row): array
    {
        return [
            'id' => (string) $row->id,
            'no_jurnal' => $row->no_jurnal,
            'tanggal' => $row->tanggal?->format('Y-m-d'),
            'flow_type' => $row->flow_type,
            'journal_type' => $row->journal_type,
            'journal_type_label' => self::JOURNAL_TYPE_LABELS[$row->journal_type] ?? $row->journal_type,
            'keterangan' => $row->keterangan ?? '',
            'no_bukti' => $row->no_bukti ?? '',
            'referensi' => '',
            'kas_account_no' => $row->kas_account_no ?? '',
            'kas_account_name' => $row->kas_account_name ?? '',
            'amount' => round((float) $row->amount, 4),
            'source' => CashTransaction::SOURCE_MANUAL,
            'status' => $row->status,
            'posted' => $row->status === CashTransaction::STATUS_POSTED,
            'editable' => $row->status === CashTransaction::STATUS_DRAFT,
        ];
    }

    private function formatAccDetail(string $noJurnal, int $budgetYearId): array
    {
        $header = DB::connection(RsudConnections::ACC2026)
            ->table('JURNAL_H')
            ->where('cnojurnal', $noJurnal)
            ->first();

        if (! $header) {
            throw ValidationException::withMessages([
                'id' => ['Jurnal ACC2026 tidak ditemukan.'],
            ]);
        }

        $year = BudgetYear::query()->findOrFail($budgetYearId);
        if ((int) date('Y', strtotime((string) $header->dtgljurnal)) !== (int) $year->tahun) {
            throw ValidationException::withMessages([
                'id' => ['Jurnal tidak sesuai tahun anggaran yang dipilih.'],
            ]);
        }

        $lines = DB::connection(RsudConnections::ACC2026)
            ->table('JURNAL_E')
            ->where('cnojurnal', $noJurnal)
            ->orderBy('col_id')
            ->get()
            ->map(fn ($line) => [
                'account_no' => trim((string) ($line->cno_acc ?? '')),
                'account_name' => trim((string) ($line->cnm_acc ?? '')),
                'keterangan' => trim((string) ($line->cket ?? '')),
                'debet' => round((float) ($line->ndebet ?? 0), 4),
                'kredit' => round((float) ($line->nkredit ?? 0), 4),
            ])
            ->all();

        $summary = $this->formatAccRow($header);

        return [
            ...$summary,
            'lines' => $lines,
            'totals' => [
                'debet' => round(array_sum(array_column($lines, 'debet')), 4),
                'kredit' => round(array_sum(array_column($lines, 'kredit')), 4),
            ],
        ];
    }

    private function formatManualDetail(CashTransaction $row): array
    {
        $lines = $row->lines->map(fn (CashTransactionLine $line) => [
            'account_no' => $line->account_no,
            'account_name' => $line->account_name ?? '',
            'keterangan' => $line->keterangan ?? '',
            'debet' => round((float) $line->debet, 4),
            'kredit' => round((float) $line->kredit, 4),
        ])->all();

        return [
            ...$this->formatManualRow($row),
            'lines' => $lines,
            'totals' => [
                'debet' => round(array_sum(array_column($lines, 'debet')), 4),
                'kredit' => round(array_sum(array_column($lines, 'kredit')), 4),
            ],
        ];
    }

    /**
     * @param  list<array{account_no: string, account_name?: string|null, keterangan?: string|null, debet: float|int|string, kredit: float|int|string}>  $lines
     */
    private function syncLines(CashTransaction $transaction, array $lines): void
    {
        $transaction->lines()->delete();

        foreach (array_values($lines) as $index => $line) {
            $transaction->lines()->create([
                'account_no' => trim($line['account_no']),
                'account_name' => $line['account_name'] ?? null,
                'keterangan' => $line['keterangan'] ?? null,
                'debet' => $line['debet'],
                'kredit' => $line['kredit'],
                'line_order' => $index + 1,
            ]);
        }
    }

    /**
     * @param  list<array{account_no: string, account_name?: string|null, keterangan?: string|null, debet: float|int|string, kredit: float|int|string}>  $lines
     */
    private function assertBalancedLines(array $lines): void
    {
        if (count($lines) < 2) {
            throw ValidationException::withMessages([
                'lines' => ['Jurnal wajib memiliki minimal 2 baris (debet dan kredit).'],
            ]);
        }

        $totalDebet = 0.0;
        $totalKredit = 0.0;

        foreach ($lines as $index => $line) {
            $debet = round((float) ($line['debet'] ?? 0), 4);
            $kredit = round((float) ($line['kredit'] ?? 0), 4);

            if ($debet < 0 || $kredit < 0) {
                throw ValidationException::withMessages([
                    "lines.{$index}" => ['Nilai debet/kredit tidak boleh negatif.'],
                ]);
            }

            if (($debet > 0 && $kredit > 0) || ($debet === 0.0 && $kredit === 0.0)) {
                throw ValidationException::withMessages([
                    "lines.{$index}" => ['Setiap baris hanya boleh berisi debet ATAU kredit.'],
                ]);
            }

            $totalDebet += $debet;
            $totalKredit += $kredit;
        }

        if (round($totalDebet, 4) !== round($totalKredit, 4)) {
            throw ValidationException::withMessages([
                'lines' => ['Total debet ('.number_format($totalDebet, 2, ',', '.').') harus sama dengan total kredit ('.number_format($totalKredit, 2, ',', '.').').'],
            ]);
        }
    }

    /**
     * @param  list<array{account_no: string, debet: float|int|string, kredit: float|int|string}>  $lines
     * @return array{account_no: string, debet: float, kredit: float}
     */
    private function resolveKasLine(array $lines, string $kasAccountNo): array
    {
        $kasAccountNo = trim($kasAccountNo);

        foreach ($lines as $line) {
            if (trim($line['account_no']) === $kasAccountNo) {
                return [
                    'account_no' => $kasAccountNo,
                    'debet' => (float) $line['debet'],
                    'kredit' => (float) $line['kredit'],
                ];
            }
        }

        throw ValidationException::withMessages([
            'kas_account_no' => ['Rekening kas/bank wajib ada di baris jurnal.'],
        ]);
    }

    private function assertJournalTypeForFlow(string $flowType, string $journalType): void
    {
        $allowed = $flowType === CashTransaction::FLOW_MASUK ? self::MASUK_TYPES : self::KELUAR_TYPES;

        if (! in_array($journalType, $allowed, true)) {
            throw ValidationException::withMessages([
                'journal_type' => ['Jenis bukti tidak sesuai arus kas.'],
            ]);
        }
    }

    private function nextManualJournalNo(int $budgetYearId, string $journalType, int $tahun): string
    {
        $prefix = $journalType.'-SQ'.substr((string) $tahun, -2).'-';
        $last = CashTransaction::query()
            ->where('budget_year_id', $budgetYearId)
            ->where('no_jurnal', 'like', $prefix.'%')
            ->orderByDesc('no_jurnal')
            ->value('no_jurnal');

        $next = 1;
        if ($last && preg_match('/(\d+)$/', $last, $matches)) {
            $next = ((int) $matches[1]) + 1;
        }

        return $prefix.str_pad((string) $next, 6, '0', STR_PAD_LEFT);
    }

    private function resolveJournalTypes(?string $flowType): array
    {
        return match ($flowType) {
            CashTransaction::FLOW_MASUK => self::MASUK_TYPES,
            CashTransaction::FLOW_KELUAR => self::KELUAR_TYPES,
            'riwayat', null => self::RIWAYAT_TYPES,
            default => self::RIWAYAT_TYPES,
        };
    }

    /**
     * @return list<array{value: string, label: string, account_type: string}>
     */
    private function kasAccountOptions(): array
    {
        $options = [];

        try {
            $kas = DB::connection(RsudConnections::ACC2026)
                ->table('vkas')
                ->orderBy('cno_acc')
                ->get(['cno_acc', 'cnm_acc']);

            foreach ($kas as $row) {
                $no = trim((string) $row->cno_acc);
                if ($no === '') {
                    continue;
                }
                $options[] = [
                    'value' => $no,
                    'label' => trim((string) $row->cnm_acc).' ('.$no.')',
                    'account_type' => 'kas',
                ];
            }
        } catch (\Throwable) {
            // ACC2026 unavailable — fallback empty
        }

        return $options;
    }

    /**
     * @return list<array{value: string, label: string, account_type: string, bank_no?: string}>
     */
    private function bankAccountOptions(): array
    {
        $options = [];

        try {
            $banks = DB::connection(RsudConnections::ACC2026)
                ->table('tbbank')
                ->where(function ($q) {
                    $q->whereNull('lbatal')->orWhere('lbatal', '<>', 1);
                })
                ->orderBy('cnorek')
                ->get(['cnorek', 'cnmbank1', 'cno_acc', 'cnm_acc']);

            foreach ($banks as $row) {
                $no = trim((string) $row->cno_acc);
                if ($no === '') {
                    continue;
                }
                $options[] = [
                    'value' => $no,
                    'label' => trim((string) ($row->cnm_acc ?: $row->cnmbank1)).' ('.$no.')',
                    'account_type' => 'bank',
                    'bank_no' => trim((string) $row->cnorek),
                ];
            }

            $vbank = DB::connection(RsudConnections::ACC2026)
                ->table('vbank')
                ->orderBy('cno_acc')
                ->get(['cno_acc', 'cnm_acc']);

            foreach ($vbank as $row) {
                $no = trim((string) $row->cno_acc);
                if ($no === '' || collect($options)->contains(fn ($o) => $o['value'] === $no)) {
                    continue;
                }
                $options[] = [
                    'value' => $no,
                    'label' => trim((string) $row->cnm_acc).' ('.$no.')',
                    'account_type' => 'bank',
                ];
            }
        } catch (\Throwable) {
            // ACC2026 unavailable
        }

        return $options;
    }
}
