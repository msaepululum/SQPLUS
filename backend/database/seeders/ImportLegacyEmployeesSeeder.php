<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Foundation\Models\OrganizationalUnit;
use App\Modules\Foundation\Models\Role;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\LeaveBalance;
use App\Modules\HR\Models\LeaveType;
use App\Modules\HR\Models\PayrollItem;
use App\Modules\HR\Models\PayrollPeriod;
use App\Modules\HR\Models\Position;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

/**
 * Impor data pegawai dari TBPEGAWAI (Payroll SIMRS legacy).
 *
 * Mapping penamaan:
 * - ckdpeg  -> employee_code
 * - cnmpeg  -> name
 * - ckdbag  -> legacy_department_code
 * - cnmbag  -> organizational_units.name (unit kerja)
 * - cusr_stamp -> source_created_by
 */
class ImportLegacyEmployeesSeeder extends Seeder
{
    private const SOURCE_FILE = 'database/sources/TBPEGAWAI.sql';

    public function run(): void
    {
        $path = dirname(base_path()).'/'.self::SOURCE_FILE;
        if (! File::exists($path)) {
            $this->command?->warn('TBPEGAWAI.sql tidak ditemukan, lewati impor pegawai legacy.');

            return;
        }

        $rows = $this->parseSqlFile($path);
        if ($rows === []) {
            $this->command?->warn('Tidak ada data pegawai yang dapat diimpor.');

            return;
        }

        $hq = OrganizationalUnit::query()->where('code', 'RS-HQ')->first();
        $defaultPosition = Position::query()->firstOrCreate(
            ['code' => 'STAFF'],
            ['name' => 'Staff', 'is_active' => true]
        );

        $unassignedUnit = OrganizationalUnit::query()->updateOrCreate(
            ['code' => 'UNASSIGNED'],
            [
                'name' => 'Belum Ditentukan',
                'parent_id' => $hq?->id,
                'type' => 'work_unit',
                'is_active' => true,
            ]
        );

        $unitMap = $this->seedWorkUnits($rows, $hq?->id, $unassignedUnit->id);
        $annualLeave = LeaveType::query()->where('code', 'ANNUAL')->first();
        $year = (int) now()->format('Y');

        foreach ($rows as $row) {
            $departmentName = trim($row['department_name'] ?? '');
            $unitId = $departmentName !== ''
                ? ($unitMap[$departmentName] ?? $unassignedUnit->id)
                : $unassignedUnit->id;

            $employee = Employee::query()->updateOrCreate(
                ['employee_code' => $row['employee_code']],
                [
                    'name' => $row['name'],
                    'legacy_department_code' => $row['legacy_department_code'],
                    'organizational_unit_id' => $unitId,
                    'position_id' => $defaultPosition->id,
                    'employment_status' => 'active',
                    'join_date' => now()->subYears(1)->toDateString(),
                    'base_salary' => 0,
                    'source_system' => 'payroll_tbpegawai',
                    'source_created_by' => $row['source_created_by'],
                ]
            );

            if ($annualLeave) {
                LeaveBalance::query()->updateOrCreate(
                    [
                        'employee_id' => $employee->id,
                        'leave_type_id' => $annualLeave->id,
                        'year' => $year,
                    ],
                    [
                        'entitled_days' => $annualLeave->default_days_per_year,
                        'used_days' => 0,
                    ]
                );
            }
        }

        $this->linkDemoEmployeeAccount();
        $this->seedPayrollSnapshot();

        $this->command?->info('Impor pegawai legacy selesai: '.count($rows).' record.');
    }

    /** @return list<array{employee_code:string,name:string,legacy_department_code:?string,department_name:?string,source_created_by:?string}> */
    private function parseSqlFile(string $path): array
    {
        $content = File::get($path);
        preg_match_all(
            "/VALUES \(N'([^']*)', N'([^']*)', (?:N'([^']*)'|NULL), (?:N'([^']*)'|NULL)(?:, (?:N'([^']*)'|NULL))?\)/u",
            $content,
            $matches,
            PREG_SET_ORDER
        );

        $rows = [];
        foreach ($matches as $match) {
            $rows[] = [
                'employee_code' => trim($match[1]),
                'name' => trim($match[2]),
                'legacy_department_code' => isset($match[3]) && $match[3] !== '' ? trim($match[3]) : null,
                'department_name' => isset($match[4]) && $match[4] !== '' ? trim($match[4]) : null,
                'source_created_by' => isset($match[5]) && $match[5] !== '' ? trim($match[5]) : null,
            ];
        }

        return $rows;
    }

    /** @return array<string, int> */
    private function seedWorkUnits(array $rows, ?int $parentId, int $fallbackUnitId): array
    {
        $names = collect($rows)
            ->pluck('department_name')
            ->filter()
            ->unique()
            ->sort()
            ->values();

        $map = [];
        $usedCodes = OrganizationalUnit::query()->pluck('code')->flip()->all();

        foreach ($names as $name) {
            $code = $this->uniqueUnitCode($name, $usedCodes);
            $usedCodes[$code] = true;

            $unit = OrganizationalUnit::query()->updateOrCreate(
                ['code' => $code],
                [
                    'name' => $name,
                    'parent_id' => $parentId,
                    'type' => 'work_unit',
                    'is_active' => true,
                ]
            );

            $map[$name] = $unit->id;
        }

        return $map;
    }

    private function uniqueUnitCode(string $name, array $usedCodes): string
    {
        $base = strtoupper(preg_replace('/[^A-Z0-9]+/', '-', trim($name)) ?? '');
        $base = trim($base, '-') ?: 'UNIT';
        $base = substr($base, 0, 45);

        $code = $base;
        $suffix = 1;
        while (isset($usedCodes[$code])) {
            $code = substr($base, 0, 40).'-'.$suffix;
            $suffix++;
        }

        return $code;
    }

    private function linkDemoEmployeeAccount(): void
    {
        $demoUser = User::query()->where('email', 'karyawan@sqplus.local')->first();
        if (! $demoUser) {
            return;
        }

        $employee = Employee::query()->where('employee_code', '589')->first()
            ?? Employee::query()->orderBy('id')->first();

        if ($employee) {
            $employee->update([
                'user_id' => $demoUser->id,
                'email' => $demoUser->email,
            ]);

            $role = Role::query()->where('name', 'employee')->first();
            if ($role) {
                $demoUser->roles()->syncWithoutDetaching([$role->id]);
            }
        }
    }

    private function seedPayrollSnapshot(): void
    {
        $period = PayrollPeriod::query()->updateOrCreate(
            ['code' => 'PAY-'.now()->format('Ym')],
            [
                'name' => 'Gaji '.now()->translatedFormat('F Y'),
                'period_start' => now()->startOfMonth()->toDateString(),
                'period_end' => now()->endOfMonth()->toDateString(),
                'status' => 'processed',
            ]
        );

        foreach (Employee::query()->cursor() as $employee) {
            PayrollItem::query()->updateOrCreate(
                ['payroll_period_id' => $period->id, 'employee_id' => $employee->id],
                [
                    'base_salary' => $employee->base_salary,
                    'allowances' => 0,
                    'deductions' => 0,
                    'net_salary' => $employee->base_salary,
                ]
            );
        }
    }
}
