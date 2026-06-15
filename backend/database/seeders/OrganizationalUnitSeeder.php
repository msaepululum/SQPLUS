<?php

namespace Database\Seeders;

use App\Modules\Foundation\Models\OrganizationalUnit;
use Illuminate\Database\Seeder;

class OrganizationalUnitSeeder extends Seeder
{
    public function run(): void
    {
        $hq = OrganizationalUnit::query()->updateOrCreate(
            ['code' => 'RS-HQ'],
            ['name' => 'Rumah Sakit Utama', 'type' => 'hospital', 'is_active' => true]
        );

        $units = [
            ['code' => 'FIN', 'name' => 'Bagian Keuangan', 'parent_id' => $hq->id],
            ['code' => 'HR', 'name' => 'Bagian SDM', 'parent_id' => $hq->id],
            ['code' => 'PROC', 'name' => 'Bagian Pengadaan', 'parent_id' => $hq->id],
            ['code' => 'WH', 'name' => 'Gudang & Logistik', 'parent_id' => $hq->id],
        ];

        foreach ($units as $unit) {
            OrganizationalUnit::query()->updateOrCreate(
                ['code' => $unit['code']],
                [...$unit, 'type' => 'department', 'is_active' => true]
            );
        }
    }
}
