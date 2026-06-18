<?php

namespace Database\Seeders;

use App\Modules\Foundation\Models\Permission;
use App\Modules\Foundation\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            ['name' => 'foundation.users.view', 'module' => 'foundation', 'label' => 'Lihat pengguna'],
            ['name' => 'foundation.users.manage', 'module' => 'foundation', 'label' => 'Kelola pengguna'],
            ['name' => 'foundation.roles.manage', 'module' => 'foundation', 'label' => 'Kelola role'],
            ['name' => 'foundation.audit.view', 'module' => 'foundation', 'label' => 'Lihat audit trail'],
            ['name' => 'foundation.master.manage', 'module' => 'foundation', 'label' => 'Kelola master data'],
            ['name' => 'finance.reports.view', 'module' => 'finance', 'label' => 'Lihat laporan keuangan'],
            ['name' => 'finance.journals.create', 'module' => 'finance', 'label' => 'Buat jurnal'],
            ['name' => 'finance.budgets.manage', 'module' => 'finance', 'label' => 'Kelola anggaran'],
            ['name' => 'hr.employees.view', 'module' => 'hr', 'label' => 'Lihat karyawan'],
            ['name' => 'hr.employees.manage', 'module' => 'hr', 'label' => 'Kelola karyawan'],
            ['name' => 'hr.leave.approve', 'module' => 'hr', 'label' => 'Setujui cuti'],
            ['name' => 'hr.payroll.view', 'module' => 'hr', 'label' => 'Lihat payroll'],
            ['name' => 'procurement.pr.manage', 'module' => 'procurement', 'label' => 'Kelola PR'],
            ['name' => 'procurement.po.approve', 'module' => 'procurement', 'label' => 'Setujui PO'],
            ['name' => 'procurement.po.manage', 'module' => 'procurement', 'label' => 'Kelola PO'],
            ['name' => 'supply_chain.stock.move', 'module' => 'supply_chain', 'label' => 'Mutasi stok'],
            ['name' => 'supply_chain.items.manage', 'module' => 'supply_chain', 'label' => 'Kelola item'],
            ['name' => 'workflow.approve', 'module' => 'workflow', 'label' => 'Melakukan approval'],
            ['name' => 'workflow.delegate', 'module' => 'workflow', 'label' => 'Delegasi approval'],
            ['name' => 'ai.assistant.use', 'module' => 'ai', 'label' => 'Gunakan AI Assistant'],
        ];

        foreach ($permissions as $perm) {
            Permission::query()->updateOrCreate(['name' => $perm['name']], $perm);
        }

        $roles = [
            'super_admin' => ['label' => 'Super Admin', 'permissions' => '*'],
            'director' => ['label' => 'Direktur', 'permissions' => [
                'foundation.audit.view', 'finance.reports.view', 'hr.payroll.view',
                'hr.leave.approve', 'procurement.po.approve', 'workflow.approve', 'ai.assistant.use',
            ]],
            'finance_manager' => ['label' => 'Manajer Keuangan', 'permissions' => [
                'finance.reports.view', 'finance.journals.create', 'finance.budgets.manage', 'workflow.approve', 'ai.assistant.use',
            ]],
            'finance_staff' => ['label' => 'Staff Keuangan', 'permissions' => [
                'finance.reports.view', 'finance.journals.create', 'ai.assistant.use',
            ]],
            'hr_manager' => ['label' => 'Manajer SDM', 'permissions' => [
                'hr.employees.view', 'hr.employees.manage', 'hr.leave.approve', 'hr.payroll.view', 'workflow.approve', 'ai.assistant.use',
            ]],
            'hr_staff' => ['label' => 'Staff SDM', 'permissions' => [
                'hr.employees.view', 'hr.employees.manage', 'ai.assistant.use',
            ]],
            'procurement_manager' => ['label' => 'Manajer Pengadaan', 'permissions' => [
                'procurement.pr.manage', 'procurement.po.approve', 'procurement.po.manage', 'workflow.approve', 'ai.assistant.use',
            ]],
            'procurement_staff' => ['label' => 'Staff Pengadaan', 'permissions' => [
                'procurement.pr.manage', 'procurement.po.manage', 'ai.assistant.use',
            ]],
            'warehouse_manager' => ['label' => 'Manajer Gudang', 'permissions' => [
                'supply_chain.stock.move', 'supply_chain.items.manage', 'workflow.approve', 'ai.assistant.use',
            ]],
            'warehouse_staff' => ['label' => 'Staff Gudang', 'permissions' => [
                'supply_chain.stock.move', 'ai.assistant.use',
            ]],
            'employee' => ['label' => 'Karyawan', 'permissions' => ['ai.assistant.use']],
        ];

        foreach ($roles as $name => $config) {
            $role = Role::query()->updateOrCreate(
                ['name' => $name],
                ['label' => $config['label'], 'description' => null]
            );

            if ($config['permissions'] === '*') {
                $role->permissions()->sync(Permission::query()->pluck('id'));
            } else {
                $ids = Permission::query()->whereIn('name', $config['permissions'])->pluck('id');
                $role->permissions()->sync($ids);
            }
        }
    }
}
