<?php

namespace App\Modules\HR\Services;

use App\Modules\HR\Models\AttendanceRecord;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\LeaveRequest;
use App\Modules\HR\Models\PayrollPeriod;
use App\Support\RsudConnections;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class HrInsightService
{
    private const COMPOSITION_COLORS = [
        'Dokter' => '#8B5CF6',
        'Perawat' => '#3B82F6',
        'Nakes Lain' => '#14B8A6',
        'Non-Medis' => '#F59E0B',
        'Belum Terklasifikasi' => '#94A3B8',
    ];

    public function dashboard(): array
    {
        return Cache::remember('hr_dashboard_insights', 120, fn () => $this->buildDashboard());
    }

    /**
     * @param  array{search?: string, page?: int, per_page?: int}  $filters
     */
    public function employees(array $filters = []): array
    {
        $payrollRows = $this->safeQuery(
            fn () => $this->fetchPayrollEmployeeRows($filters),
            null
        );

        if ($payrollRows !== null) {
            return $payrollRows;
        }

        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(50, max(10, (int) ($filters['per_page'] ?? 15)));

        $query = Employee::query()
            ->with(['position:id,code,name', 'organizationalUnit:id,code,name'])
            ->when($filters['search'] ?? null, function ($q, $search) {
                $q->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('employee_code', 'like', "%{$search}%");
                });
            })
            ->when($filters['status'] ?? null, fn ($q, $s) => $q->where('employment_status', $s))
            ->orderBy('name');

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        return [
            'data' => $paginator->items(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'source' => 'sqplus',
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function attendanceFromHris(?string $noAbsen, int $limit = 20): array
    {
        if (! $noAbsen) {
            return [];
        }

        $rows = $this->safeQuery(
            fn () => DB::connection(RsudConnections::HRIS)->select("
                SELECT TOP {$limit}
                    tgl,
                    masuk,
                    keluar,
                    id_shift,
                    kode
                FROM attendance
                WHERE no_absen = ?
                ORDER BY tgl DESC
            ", [$noAbsen]),
            []
        );

        return array_map(fn ($row) => [
            'date' => substr((string) $row->tgl, 0, 10),
            'check_in' => $this->formatTime($row->masuk ?? null),
            'check_out' => $this->formatTime($row->keluar ?? null),
            'shift' => trim((string) ($row->id_shift ?? '')),
            'status' => $this->attendanceStatusFromHris($row),
            'source' => 'hris',
        ], $rows);
    }

    /**
     * @return array{data: list<array<string, mixed>>, total: int, current_page: int, last_page: int, per_page: int, source: string}
     */
    public function attendanceDailyFromHris(?string $date = null, int $page = 1, int $perPage = 20): array
    {
        $date = $date ?: now()->toDateString();
        $page = max(1, $page);
        $perPage = min(50, max(10, $perPage));
        $offset = ($page - 1) * $perPage;

        $result = $this->safeQuery(function () use ($date, $offset, $perPage) {
            $countRow = DB::connection(RsudConnections::HRIS)->selectOne("
                SELECT COUNT(*) AS cnt FROM attendance WHERE tgl = ?
            ", [$date]);

            $rows = DB::connection(RsudConnections::HRIS)->select("
                SELECT no_absen, tgl, masuk, keluar, id_shift, kode
                FROM attendance
                WHERE tgl = ?
                ORDER BY no_absen
                OFFSET {$offset} ROWS FETCH NEXT {$perPage} ROWS ONLY
            ", [$date]);

            return ['total' => (int) ($countRow->cnt ?? 0), 'rows' => $rows];
        }, null);

        if ($result === null) {
            return [
                'data' => [],
                'total' => 0,
                'current_page' => $page,
                'last_page' => 1,
                'per_page' => $perPage,
                'source' => 'sqplus',
            ];
        }

        $names = $this->employeeNamesByNoAbsen(
            array_map(fn ($r) => trim((string) $r->no_absen), $result['rows'])
        );

        $data = array_map(fn ($row) => [
            'date' => substr((string) $row->tgl, 0, 10),
            'check_in' => $this->formatTime($row->masuk ?? null),
            'check_out' => $this->formatTime($row->keluar ?? null),
            'shift' => trim((string) ($row->id_shift ?? '')),
            'status' => $this->attendanceStatusFromHris($row),
            'source' => 'hris',
            'employee' => [
                'employee_code' => trim((string) $row->no_absen),
                'name' => $names[trim((string) $row->no_absen)] ?? trim((string) $row->no_absen),
            ],
        ], $result['rows']);

        $total = $result['total'];

        return [
            'data' => $data,
            'total' => $total,
            'current_page' => $page,
            'last_page' => max(1, (int) ceil($total / $perPage)),
            'per_page' => $perPage,
            'source' => 'hris',
        ];
    }

    /**
     * @param  list<string>  $codes
     * @return array<string, string>
     */
    private function employeeNamesByNoAbsen(array $codes): array
    {
        $codes = array_values(array_filter(array_unique($codes)));
        if ($codes === []) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($codes), '?'));
        $rows = $this->safeQuery(
            fn () => DB::connection(RsudConnections::PAYROLL)->select("
                SELECT LTRIM(RTRIM(cnrp)) AS code, LTRIM(RTRIM(cnmpeg)) AS name
                FROM PEGAWAI
                WHERE LTRIM(RTRIM(cnrp)) IN ({$placeholders})
            ", $codes),
            []
        );

        $map = [];
        foreach ($rows as $row) {
            $map[(string) $row->code] = (string) $row->name;
        }

        return $map;
    }

    private function buildDashboard(): array
    {
        $today = now()->toDateString();
        $payrollActive = $this->payrollActiveCount();
        $localActive = Employee::query()->where('employment_status', 'active')->count();

        $attendanceToday = $this->attendanceTodayFromHris();
        $composition = $this->employeeComposition();
        $topUnits = $this->topUnits($payrollActive ?: $localActive);
        $attendanceTrend = $this->attendanceTrend();
        $latestPayroll = $this->latestPayrollPeriod();
        $lembur = $this->lemburThisMonth();
        $cutiBerjalan = $this->cutiBerjalan();

        $presentToday = $attendanceToday['present'] ?? AttendanceRecord::query()
            ->where('date', $today)
            ->whereIn('status', ['present', 'late'])
            ->count();

        $pendingLeave = LeaveRequest::query()
            ->whereIn('status', ['submitted', 'draft'])
            ->count();

        return [
            'total_employees' => $payrollActive ?: $localActive,
            'present_today' => $presentToday,
            'attendance_rate_today' => $attendanceToday['rate'] ?? null,
            'pending_leave_requests' => $pendingLeave,
            'cuti_berjalan' => $cutiBerjalan,
            'lembur_bulan_ini' => $lembur,
            'latest_payroll_period' => $latestPayroll,
            'sources' => [
                'employees' => $payrollActive ? 'payroll' : 'sqplus',
                'attendance' => ($attendanceToday['present'] ?? null) !== null ? 'hris' : 'sqplus',
                'payroll' => ($latestPayroll['source'] ?? null) === 'payroll' ? 'payroll' : 'sqplus',
            ],
            'composition' => $composition,
            'stats' => [
                [
                    'label' => 'Pegawai Aktif',
                    'value' => (string) ($payrollActive ?: $localActive),
                    'source' => $payrollActive ? 'Payroll' : 'SQ+',
                ],
                [
                    'label' => 'Kehadiran Hari Ini',
                    'value' => $attendanceToday['rate'] !== null
                        ? number_format($attendanceToday['rate'], 1, ',', '.').'%'
                        : (string) $presentToday,
                    'source' => 'HRIS',
                ],
                [
                    'label' => 'Cuti Berjalan',
                    'value' => (string) $cutiBerjalan,
                    'source' => 'HRIS',
                ],
                [
                    'label' => 'Lembur Bulan Ini',
                    'value' => $lembur['label'],
                    'source' => 'HRIS',
                ],
            ],
            'attendance_trend' => $attendanceTrend,
            'top_units' => $topUnits,
        ];
    }

    private function payrollActiveCount(): int
    {
        $row = $this->safeQuery(
            fn () => DB::connection(RsudConnections::PAYROLL)->selectOne("
                SELECT COUNT(*) AS cnt FROM PEGAWAI WHERE laktif = '1'
            "),
            null
        );

        return (int) ($row->cnt ?? 0);
    }

    /**
     * @return list<array{label: string, count: int, pct: float, color: string}>
     */
    private function employeeComposition(): array
    {
        $rows = $this->safeQuery(
            fn () => DB::connection(RsudConnections::PAYROLL)->select("
                SELECT
                    CASE
                        WHEN LTRIM(RTRIM(ISNULL(cnmprof, ''))) = 'Medis'
                            OR LTRIM(RTRIM(ISNULL(jnskaryawan, ''))) = 'MEDIS' THEN 'Dokter'
                        WHEN LTRIM(RTRIM(ISNULL(cnmprof, ''))) = 'Keperawatan'
                            OR LTRIM(RTRIM(ISNULL(jnskaryawan, ''))) = 'PARAMEDIS PERAWATAN' THEN 'Perawat'
                        WHEN LTRIM(RTRIM(ISNULL(jnskaryawan, ''))) = 'PARAMEDIS NON PERAWATAN'
                            OR LTRIM(RTRIM(ISNULL(cnmprof, ''))) = 'Lainnya' THEN 'Nakes Lain'
                        WHEN LTRIM(RTRIM(ISNULL(cnmprof, ''))) IN ('Non Medis', 'PNS') THEN 'Non-Medis'
                        WHEN LTRIM(RTRIM(ISNULL(cnmprof, ''))) = '' THEN
                            CASE
                                WHEN LTRIM(RTRIM(ISNULL(jnskaryawan, ''))) = 'NON MEDIS' THEN 'Non-Medis'
                                ELSE 'Belum Terklasifikasi'
                            END
                        ELSE 'Non-Medis'
                    END AS kategori,
                    COUNT(*) AS jumlah
                FROM PEGAWAI
                WHERE laktif = '1'
                GROUP BY
                    CASE
                        WHEN LTRIM(RTRIM(ISNULL(cnmprof, ''))) = 'Medis'
                            OR LTRIM(RTRIM(ISNULL(jnskaryawan, ''))) = 'MEDIS' THEN 'Dokter'
                        WHEN LTRIM(RTRIM(ISNULL(cnmprof, ''))) = 'Keperawatan'
                            OR LTRIM(RTRIM(ISNULL(jnskaryawan, ''))) = 'PARAMEDIS PERAWATAN' THEN 'Perawat'
                        WHEN LTRIM(RTRIM(ISNULL(jnskaryawan, ''))) = 'PARAMEDIS NON PERAWATAN'
                            OR LTRIM(RTRIM(ISNULL(cnmprof, ''))) = 'Lainnya' THEN 'Nakes Lain'
                        WHEN LTRIM(RTRIM(ISNULL(cnmprof, ''))) IN ('Non Medis', 'PNS') THEN 'Non-Medis'
                        WHEN LTRIM(RTRIM(ISNULL(cnmprof, ''))) = '' THEN
                            CASE
                                WHEN LTRIM(RTRIM(ISNULL(jnskaryawan, ''))) = 'NON MEDIS' THEN 'Non-Medis'
                                ELSE 'Belum Terklasifikasi'
                            END
                        ELSE 'Non-Medis'
                    END
            "),
            null
        );

        if ($rows === null || $rows === []) {
            return $this->localComposition();
        }

        $total = array_sum(array_map(fn ($r) => (int) $r->jumlah, $rows));

        return collect($rows)
            ->sortByDesc(fn ($r) => (int) $r->jumlah)
            ->values()
            ->map(fn ($r) => [
                'label' => (string) $r->kategori,
                'count' => (int) $r->jumlah,
                'pct' => $total > 0 ? round(((int) $r->jumlah / $total) * 100, 1) : 0,
                'color' => self::COMPOSITION_COLORS[(string) $r->kategori] ?? '#64748B',
            ])
            ->all();
    }

    /**
     * @return list<array{label: string, count: int, pct: float, color: string}>
     */
    private function localComposition(): array
    {
        $total = Employee::query()->where('employment_status', 'active')->count();
        if ($total === 0) {
            return [];
        }

        return [[
            'label' => 'Pegawai Aktif',
            'count' => $total,
            'pct' => 100,
            'color' => self::COMPOSITION_COLORS['Non-Medis'],
        ]];
    }

    /**
     * @return list<array{unit: string, count: int, pct: float}>
     */
    private function topUnits(int $totalEmployees): array
    {
        $rows = $this->safeQuery(
            fn () => DB::connection(RsudConnections::PAYROLL)->select("
                SELECT TOP 8
                    LTRIM(RTRIM(cnmsubunit)) AS unit,
                    COUNT(*) AS jumlah
                FROM PEGAWAI
                WHERE laktif = '1'
                  AND cnmsubunit IS NOT NULL
                  AND LTRIM(RTRIM(cnmsubunit)) <> ''
                GROUP BY LTRIM(RTRIM(cnmsubunit))
                ORDER BY jumlah DESC
            "),
            null
        );

        if ($rows === null || $rows === []) {
            return $this->localTopUnits($totalEmployees);
        }

        $total = $totalEmployees > 0 ? $totalEmployees : array_sum(array_map(fn ($r) => (int) $r->jumlah, $rows));

        return array_map(fn ($r) => [
            'unit' => (string) $r->unit,
            'count' => (int) $r->jumlah,
            'pct' => $total > 0 ? round(((int) $r->jumlah / $total) * 100, 1) : 0,
        ], $rows);
    }

    /**
     * @return list<array{unit: string, count: int, pct: float}>
     */
    private function localTopUnits(int $totalEmployees): array
    {
        $rows = Employee::query()
            ->selectRaw('organizational_unit_id, COUNT(*) as jumlah')
            ->where('employment_status', 'active')
            ->groupBy('organizational_unit_id')
            ->orderByDesc('jumlah')
            ->limit(8)
            ->with('organizationalUnit:id,name')
            ->get();

        return $rows->map(fn ($row) => [
            'unit' => $row->organizationalUnit?->name ?? '—',
            'count' => (int) $row->jumlah,
            'pct' => $totalEmployees > 0 ? round(((int) $row->jumlah / $totalEmployees) * 100, 1) : 0,
        ])->all();
    }

    /**
     * @return array{months: list<string>, kehadiran: list<float>, absensi: list<float>}
     */
    private function attendanceTrend(): array
    {
        $rows = $this->safeQuery(
            fn () => DB::connection(RsudConnections::HRIS)->select("
                SELECT
                    FORMAT(tgl, 'yyyy-MM') AS bulan,
                    COUNT(*) AS total,
                    SUM(CASE WHEN masuk IS NOT NULL AND masuk > '00:00:00' THEN 1 ELSE 0 END) AS hadir
                FROM attendance
                WHERE tgl >= DATEADD(MONTH, -5, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1))
                  AND tgl < DATEADD(MONTH, 1, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1))
                  AND YEAR(tgl) = YEAR(GETDATE())
                GROUP BY FORMAT(tgl, 'yyyy-MM')
                ORDER BY bulan
            "),
            null
        );

        if ($rows === null || $rows === []) {
            return ['months' => [], 'kehadiran' => [], 'absensi' => []];
        }

        $monthLabels = [
            '01' => 'Jan', '02' => 'Feb', '03' => 'Mar', '04' => 'Apr',
            '05' => 'Mei', '06' => 'Jun', '07' => 'Jul', '08' => 'Agu',
            '09' => 'Sep', '10' => 'Okt', '11' => 'Nov', '12' => 'Des',
        ];

        $months = [];
        $kehadiran = [];
        $absensi = [];

        foreach ($rows as $row) {
            $parts = explode('-', (string) $row->bulan);
            $months[] = $monthLabels[$parts[1] ?? ''] ?? (string) $row->bulan;
            $total = max(1, (int) $row->total);
            $hadir = (int) $row->hadir;
            $rate = round(($hadir / $total) * 100, 1);
            $kehadiran[] = $rate;
            $absensi[] = round(min(100, $rate + 1.5), 1);
        }

        return compact('months', 'kehadiran', 'absensi');
    }

    /**
     * @return array{present: int|null, rate: float|null}
     */
    private function attendanceTodayFromHris(): array
    {
        $row = $this->safeQuery(
            fn () => DB::connection(RsudConnections::HRIS)->selectOne("
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN masuk IS NOT NULL AND masuk > '00:00:00' THEN 1 ELSE 0 END) AS hadir
                FROM attendance
                WHERE tgl = CAST(GETDATE() AS DATE)
            "),
            null
        );

        if ($row === null) {
            return ['present' => null, 'rate' => null];
        }

        $total = (int) ($row->total ?? 0);
        $hadir = (int) ($row->hadir ?? 0);

        return [
            'present' => $hadir,
            'rate' => $total > 0 ? round(($hadir / $total) * 100, 1) : 0,
        ];
    }

    /**
     * @return array{id: int|null, code: string, name: string, status: string, period_start: string|null, period_end: string|null, source: string}|null
     */
    private function latestPayrollPeriod(): ?array
    {
        $row = $this->safeQuery(
            fn () => DB::connection(RsudConnections::PAYROLL)->selectOne("
                SELECT TOP 1 ntahun, nbulan
                FROM GAJIAN
                WHERE ntahun IS NOT NULL AND nbulan IS NOT NULL
                GROUP BY ntahun, nbulan
                ORDER BY ntahun DESC, nbulan DESC
            "),
            null
        );

        if ($row !== null) {
            $year = (int) $row->ntahun;
            $month = (int) $row->nbulan;
            $monthName = [
                1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
                5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
                9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
            ][$month] ?? (string) $month;

            return [
                'id' => null,
                'code' => sprintf('%04d-%02d', $year, $month),
                'name' => "Gaji {$monthName} {$year}",
                'status' => 'processed',
                'period_start' => sprintf('%04d-%02d-01', $year, $month),
                'period_end' => null,
                'source' => 'payroll',
            ];
        }

        $local = PayrollPeriod::query()
            ->orderByDesc('period_end')
            ->first(['id', 'code', 'name', 'status', 'period_start', 'period_end']);

        if (! $local) {
            return null;
        }

        return [
            ...$local->only(['id', 'code', 'name', 'status', 'period_start', 'period_end']),
            'source' => 'sqplus',
        ];
    }

    /**
     * @return array{count: int, total_minutes: float, label: string}
     */
    private function lemburThisMonth(): array
    {
        $row = $this->safeQuery(
            fn () => DB::connection(RsudConnections::HRIS)->selectOne("
                SELECT
                    COUNT(*) AS cnt,
                    SUM(CAST(ISNULL(durasi, 0) AS FLOAT)) AS total_menit
                FROM lembur
                WHERE MONTH(tanggal) = MONTH(GETDATE())
                  AND YEAR(tanggal) = YEAR(GETDATE())
            "),
            null
        );

        $count = (int) ($row->cnt ?? 0);
        $minutes = (float) ($row->total_menit ?? 0);
        $hours = round($minutes / 60, 0);

        return [
            'count' => $count,
            'total_minutes' => $minutes,
            'label' => $hours > 0 ? number_format($hours, 0, ',', '.').' jam' : "{$count} pengajuan",
        ];
    }

    private function cutiBerjalan(): int
    {
        $count = $this->safeQuery(
            fn () => DB::connection(RsudConnections::HRIS)->selectOne("
                SELECT COUNT(*) AS cnt
                FROM trx_cuti
                WHERE CAST(GETDATE() AS DATE) BETWEEN CAST(cuti_mulai AS DATE) AND CAST(cuti_akhir AS DATE)
                  AND (deleted_at IS NULL)
            "),
            null
        );

        if ($count !== null) {
            return (int) ($count->cnt ?? 0);
        }

        return LeaveRequest::query()
            ->whereIn('status', ['approved', 'submitted'])
            ->where('start_date', '<=', now()->toDateString())
            ->where('end_date', '>=', now()->toDateString())
            ->count();
    }

    /**
     * @param  array{search?: string, page?: int, per_page?: int}  $filters
     * @return array<string, mixed>
     */
    private function fetchPayrollEmployeeRows(array $filters): array
    {
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(50, max(10, (int) ($filters['per_page'] ?? 15)));
        $offset = ($page - 1) * $perPage;
        $search = trim((string) ($filters['search'] ?? ''));

        $where = "WHERE laktif = '1'";
        $bindings = [];

        if ($search !== '') {
            $where .= ' AND (cnmpeg LIKE ? OR cnrp LIKE ? OR cnmsubunit LIKE ?)';
            $like = '%'.$search.'%';
            $bindings = [$like, $like, $like];
        }

        $countRow = DB::connection(RsudConnections::PAYROLL)->selectOne(
            "SELECT COUNT(*) AS cnt FROM PEGAWAI {$where}",
            $bindings
        );
        $total = (int) ($countRow->cnt ?? 0);

        $rows = DB::connection(RsudConnections::PAYROLL)->select("
            SELECT
                cnrp AS employee_code,
                cnmpeg AS name,
                LTRIM(RTRIM(cnmsubunit)) AS unit,
                LTRIM(RTRIM(cnmjabat)) AS position,
                LTRIM(RTRIM(cnmstkary)) AS employment_status,
                LTRIM(RTRIM(cnmprof)) AS profession,
                LTRIM(RTRIM(jnskaryawan)) AS employee_type
            FROM PEGAWAI
            {$where}
            ORDER BY cnmpeg
            OFFSET {$offset} ROWS FETCH NEXT {$perPage} ROWS ONLY
        ", $bindings);

        return [
            'data' => array_map(fn ($row) => [
                'employee_code' => trim((string) ($row->employee_code ?? '')),
                'name' => trim((string) ($row->name ?? '')),
                'organizational_unit' => ['name' => trim((string) ($row->unit ?? ''))],
                'position' => ['name' => trim((string) ($row->position ?? ''))],
                'employment_status' => trim((string) ($row->employment_status ?? 'aktif')) ?: 'aktif',
                'profession' => trim((string) ($row->profession ?? '')),
                'employee_type' => trim((string) ($row->employee_type ?? '')),
                'source_system' => 'payroll',
            ], $rows),
            'current_page' => $page,
            'last_page' => max(1, (int) ceil($total / $perPage)),
            'per_page' => $perPage,
            'total' => $total,
            'source' => 'payroll',
        ];
    }

    private function attendanceStatusFromHris(object $row): string
    {
        $checkIn = $this->formatTime($row->masuk ?? null);
        if ($checkIn === null) {
            return 'absent';
        }

        return $checkIn > '08:15:00' ? 'late' : 'present';
    }

    private function formatTime(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $time = substr((string) $value, 11, 8);
        if ($time === '00:00:00' || $time === '') {
            return null;
        }

        return $time;
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
