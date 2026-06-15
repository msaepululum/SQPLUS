<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Foundation\Models\OrganizationalUnit;
use App\Modules\Foundation\Models\Role;
use App\Modules\HR\Models\LeaveType;
use App\Modules\HR\Models\Position;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class HrSeeder extends Seeder
{
    public function run(): void
    {
        $hrUnit = OrganizationalUnit::query()->where('code', 'HR')->first();
        $finUnit = OrganizationalUnit::query()->where('code', 'FIN')->first();

        $positions = [
            ['code' => 'STAFF', 'name' => 'Staff', 'unit' => null],
            ['code' => 'DIR', 'name' => 'Direktur', 'unit' => null],
            ['code' => 'MGR-FIN', 'name' => 'Manajer Keuangan', 'unit' => $finUnit?->id],
            ['code' => 'MGR-HR', 'name' => 'Manajer SDM', 'unit' => $hrUnit?->id],
            ['code' => 'STAFF-HR', 'name' => 'Staff SDM', 'unit' => $hrUnit?->id],
            ['code' => 'NURSE', 'name' => 'Perawat', 'unit' => $hrUnit?->id],
            ['code' => 'ADMIN', 'name' => 'Administrasi', 'unit' => $hrUnit?->id],
        ];

        foreach ($positions as $pos) {
            Position::query()->updateOrCreate(
                ['code' => $pos['code']],
                ['name' => $pos['name'], 'organizational_unit_id' => $pos['unit'], 'is_active' => true]
            );
        }

        $leaveTypes = [
            ['code' => 'ANNUAL', 'name' => 'Cuti Tahunan', 'default_days_per_year' => 12],
            ['code' => 'SICK', 'name' => 'Cuti Sakit', 'default_days_per_year' => 14],
            ['code' => 'MATERNITY', 'name' => 'Cuti Melahirkan', 'default_days_per_year' => 90],
        ];

        foreach ($leaveTypes as $lt) {
            LeaveType::query()->updateOrCreate(['code' => $lt['code']], $lt);
        }

        $employeeUser = User::query()->updateOrCreate(
            ['email' => 'karyawan@sqplus.local'],
            [
                'name' => 'Demo Karyawan',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );

        $employeeRole = Role::query()->where('name', 'employee')->first();
        if ($employeeRole) {
            $employeeUser->roles()->syncWithoutDetaching([$employeeRole->id]);
        }
    }
}
