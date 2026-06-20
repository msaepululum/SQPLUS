<?php

namespace App\Modules\Finance\Support;

class RevenueCategories
{
    /** @return array<int, array{id: string, kode: string, label: string}> */
    public static function all(): array
    {
        return [
            ['id' => 'apbn', 'kode' => 'P01', 'label' => 'Pendapatan dari Alokasi APBN'],
            ['id' => 'jasa-rs', 'kode' => 'P02', 'label' => 'Pendapatan dari Jasa Layanan Rumah Sakit'],
            ['id' => 'jasa-entitas', 'kode' => 'P03', 'label' => 'Pendapatan dari Jasa Layanan kepada Entitas Lain'],
            ['id' => 'kerja-sama', 'kode' => 'P04', 'label' => 'Pendapatan dari Hasil Kerja Sama'],
            ['id' => 'usaha-lain', 'kode' => 'P05', 'label' => 'Pendapatan Usaha Lainnya'],
            ['id' => 'pnbp', 'kode' => 'P06', 'label' => 'Pendapatan PNBP Umum'],
            ['id' => 'hibah', 'kode' => 'P07', 'label' => 'Pendapatan dari Hibah'],
            ['id' => 'pengembalian-blu', 'kode' => 'P08', 'label' => 'Penerimaan dari Pengembalian Belanja BLU TAYL'],
        ];
    }

    /** @return array<int, string> */
    public static function ids(): array
    {
        return array_column(self::all(), 'id');
    }

    public static function isValid(string $id): bool
    {
        return in_array($id, self::ids(), true);
    }
}
