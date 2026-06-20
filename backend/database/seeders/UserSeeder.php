<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Foundation\Models\OrganizationalUnit;
use App\Modules\Foundation\Models\Role;
use App\Modules\Workflow\Models\ApprovalFlow;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->updateOrCreate(
            ['email' => 'admin@sqplus.local'],
            [
                'name' => 'Super Admin',
                'phone' => '08000000000',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );

        $adminRole = Role::query()->where('name', 'super_admin')->first();
        $admin->roles()->sync([$adminRole->id]);

        $hq = OrganizationalUnit::query()->where('code', 'RS-HQ')->first();
        if ($hq) {
            $admin->organizationalUnits()->sync([$hq->id => ['is_primary' => true]]);
        }

        $demoUsers = [
            ['email' => 'direktur@sqplus.local', 'name' => 'Direktur RS', 'role' => 'director'],
            ['email' => 'keuangan@sqplus.local', 'name' => 'Manajer Keuangan', 'role' => 'finance_manager'],
            ['email' => 'sdm@sqplus.local', 'name' => 'Manajer SDM', 'role' => 'hr_manager'],
            ['email' => 'pengadaan@sqplus.local', 'name' => 'Manajer Pengadaan', 'role' => 'procurement_manager'],
            ['email' => 'gudang@sqplus.local', 'name' => 'Manajer Gudang', 'role' => 'warehouse_manager'],
        ];

        foreach ($demoUsers as $demo) {
            $user = User::query()->updateOrCreate(
                ['email' => $demo['email']],
                [
                    'name' => $demo['name'],
                    'password' => Hash::make('password'),
                    'is_active' => true,
                ]
            );

            $role = Role::query()->where('name', $demo['role'])->first();
            if ($role) {
                $user->roles()->sync([$role->id]);
            }
        }

        ApprovalFlow::query()->updateOrCreate(
            ['document_type' => 'purchase_request'],
            [
                'name' => 'Alur PR',
                'director_threshold' => 100000000,
                'steps' => [
                    ['role' => 'procurement_manager', 'label' => 'Manajer Pengadaan'],
                    ['role' => 'finance_manager', 'label' => 'Manajer Keuangan'],
                    ['role' => 'director', 'label' => 'Direktur'],
                ],
            ]
        );

        ApprovalFlow::query()->updateOrCreate(
            ['document_type' => 'leave_request'],
            [
                'name' => 'Alur Cuti',
                'director_threshold' => null,
                'is_active' => true,
                'steps' => [
                    ['role' => 'hr_manager', 'label' => 'Manajer SDM'],
                ],
            ]
        );

        ApprovalFlow::query()->updateOrCreate(
            ['document_type' => 'budget_revision'],
            [
                'name' => 'Alur Revisi Pagu',
                'director_threshold' => 100000000,
                'is_active' => true,
                'steps' => [
                    ['role' => 'finance_manager', 'label' => 'Manajer Keuangan'],
                    ['role' => 'director', 'label' => 'Direktur'],
                ],
            ]
        );

        ApprovalFlow::query()->updateOrCreate(
            ['document_type' => 'budget_shift'],
            [
                'name' => 'Alur Pergeseran Pagu',
                'director_threshold' => 100000000,
                'is_active' => true,
                'steps' => [
                    ['role' => 'finance_manager', 'label' => 'Manajer Keuangan'],
                    ['role' => 'director', 'label' => 'Direktur'],
                ],
            ]
        );
    }
}
