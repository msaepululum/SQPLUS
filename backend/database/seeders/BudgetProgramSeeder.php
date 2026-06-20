<?php

namespace Database\Seeders;

use App\Modules\Finance\Models\BudgetAccountCode;
use App\Modules\Finance\Models\BudgetYear;
use Illuminate\Database\Seeder;

class BudgetProgramSeeder extends Seeder
{
    public function run(): void
    {
        BudgetAccountCode::query()->forceDelete();

        $year2026 = BudgetYear::query()->updateOrCreate(
            ['tahun' => 2026],
            [
                'nama' => 'Anggaran Tahun 2026',
                'tanggal_mulai' => '2026-01-01',
                'tanggal_selesai' => '2026-12-31',
                'status' => BudgetYear::STATUS_ACTIVE,
            ]
        );

        $year2025 = BudgetYear::query()->updateOrCreate(
            ['tahun' => 2025],
            [
                'nama' => 'Anggaran Tahun 2025',
                'tanggal_mulai' => '2025-01-01',
                'tanggal_selesai' => '2025-12-31',
                'status' => BudgetYear::STATUS_CLOSED,
            ]
        );

        $this->seedYear($year2026);
        $this->seedYear($year2025, reducedPagu: true);
    }

    private function seedYear(BudgetYear $year, bool $reducedPagu = false): void
    {
        $factor = $reducedPagu ? 0.85 : 1.0;

        $p1 = $this->program($year, '1.02.01', 'PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI');

        $k106 = $this->kegiatan($p1, '1.02.01.1.06', 'Administrasi Umum Perangkat Daerah');
        $this->sub($k106, '1.02.01.1.06.0007', 'Penyediaan Bahan/Material', (int) round(1_470_392_000 * $factor));

        $k108 = $this->kegiatan($p1, '1.02.01.1.08', 'Penyediaan Jasa Penunjang Urusan Pemerintahan Daerah');
        $this->sub($k108, '1.02.01.1.08.0002', 'Penyediaan Jasa Komunikasi, Sumber Daya Air dan Listrik', (int) round(7_116_146_480 * $factor));

        $k110 = $this->kegiatan($p1, '1.02.01.1.10', 'Peningkatan Pelayanan BLUD');
        $this->sub($k110, '1.02.01.1.10.0001', 'Pelayanan dan Penunjang Pelayanan BLUD', (int) round(242_562_500_000 * $factor));

        $p2 = $this->program(
            $year,
            '1.02.02',
            'PROGRAM PEMENUHAN UPAYA KESEHATAN PERORANGAN DAN UPAYA KESEHATAN MASYARAKAT'
        );

        $k201 = $this->kegiatan(
            $p2,
            '1.02.02.1.01',
            'Penyediaan Fasilitas Pelayanan, Sarana, Prasarana dan Alat Kesehatan untuk UKP Rujukan, UKM dan UKM Rujukan Tingkat Daerah Provinsi'
        );
        foreach ([
            ['1.02.02.1.01.0009', 'Rehabilitasi dan Pemeliharaan Rumah Sakit', 6_011_310_051],
            ['1.02.02.1.01.0010', 'Pengadaan Alat Kesehatan/Alat Penunjang Medik Fasilitas Layanan Kesehatan', 4_024_928_832],
            ['1.02.02.1.01.0017', 'Pemeliharaan Alat Kesehatan/Alat Penunjang Medik Fasilitas Layanan Kesehatan', 6_790_321_231],
            ['1.02.02.1.01.0027', 'Pengadaan Obat, Bahan Habis Pakai, Bahan Medis Habis Pakai, Vaksin, Makanan dan Minuman di Fasilitas Kesehatan', 32_841_683_719],
        ] as [$kode, $uraian, $jumlah]) {
            $this->sub($k201, $kode, $uraian, (int) round($jumlah * $factor));
        }

        $k203 = $this->kegiatan($p2, '1.02.02.1.03', 'Penyelenggaraan Sistem Informasi Kesehatan Secara Terintegrasi');
        $this->sub($k203, '1.02.02.1.03.0002', 'Pengelolaan Sistem Informasi Kesehatan', (int) round(2_218_354_208 * $factor));

        $p3 = $this->program($year, '1.02.03', 'PROGRAM PENINGKATAN KAPASITAS SUMBER DAYA MANUSIA KESEHATAN');

        $k301 = $this->kegiatan(
            $p3,
            '1.02.03.1.01',
            'Perencanaan Kebutuhan Sumber Daya Manusia Kesehatan untuk UKM dan UKP Provinsi'
        );
        $this->sub($k301, '1.02.03.1.01.0001', 'Pemenuhan Kebutuhan Sumber Daya Manusia Kesehatan', (int) round(41_809_373_705 * $factor));
    }

    private function program(BudgetYear $year, string $kode, string $uraian): BudgetAccountCode
    {
        return BudgetAccountCode::query()->create([
            'budget_year_id' => $year->id,
            'kode' => $kode,
            'uraian' => $uraian,
            'jenis' => BudgetAccountCode::JENIS_PROGRAM,
            'is_active' => true,
        ]);
    }

    private function kegiatan(BudgetAccountCode $parent, string $kode, string $uraian): BudgetAccountCode
    {
        return BudgetAccountCode::query()->create([
            'budget_year_id' => $parent->budget_year_id,
            'parent_id' => $parent->id,
            'kode' => $kode,
            'uraian' => $uraian,
            'jenis' => BudgetAccountCode::JENIS_KEGIATAN,
            'is_active' => true,
        ]);
    }

    private function sub(
        BudgetAccountCode $parent,
        string $kode,
        string $uraian,
        int|float $jumlah
    ): BudgetAccountCode {
        return BudgetAccountCode::query()->create([
            'budget_year_id' => $parent->budget_year_id,
            'parent_id' => $parent->id,
            'kode' => $kode,
            'uraian' => $uraian,
            'jenis' => BudgetAccountCode::JENIS_SUB_KEGIATAN,
            'jumlah_anggaran' => $jumlah,
            'is_active' => true,
        ]);
    }
}
