# Mapping Data Pegawai Legacy — TBPEGAWAI

Dokumen ini menjelaskan adopsi struktur `TBPEGAWAI` (Payroll SIMRS) ke skema SQ+ dengan penamaan yang diperbaiki.

## Sumber Data

- File: `database/sources/TBPEGAWAI.sql`
- Sistem asal: SQL Server / Payroll SIMRS
- Jumlah record: **770 pegawai**

## Mapping Kolom

| Legacy (TBPEGAWAI) | SQ+ (employees) | Keterangan |
|--------------------|-----------------|------------|
| `ckdpeg` | `employee_code` | Kode pegawai unik |
| `cnmpeg` | `name` | Nama lengkap |
| `ckdbag` | `legacy_department_code` | Kode unit kerja legacy (umumnya NULL di data ini) |
| `cnmbag` | `organizational_units.name` | Unit kerja → tabel `organizational_units` (`type = work_unit`) |
| `cusr_stamp` | `source_created_by` | Stamp user pembuat record legacy |
| — | `source_system` | Nilai tetap: `payroll_tbpegawai` |

## Unit Kerja

Setiap nilai unik `cnmbag` diimpor sebagai **unit kerja operasional** (`organizational_units`):

- `type`: `work_unit`
- `code`: dihasilkan dari nama (slug uppercase, mis. `IGD`, `INFORMASI-FRONT-OFFICE`)
- `parent_id`: `RS-HQ`

Total unit kerja dari data: **84 unit** (+ 1 `UNASSIGNED` untuk pegawai tanpa unit).

## Jabatan

Data legacy tidak memiliki jabatan. Semua pegawai diimpor dengan jabatan default:

- `positions.code`: `STAFF`
- `positions.name`: `Staff`

## Impor

```bash
cd backend
php artisan migrate:fresh --seed
# atau hanya ulang impor pegawai:
php artisan db:seed --class=ImportLegacyEmployeesSeeder
```

Seeder: `ImportLegacyEmployeesSeeder`

## Akun Demo Self-Service

User `karyawan@sqplus.local` ditautkan ke pegawai kode **589** (WIWIT A NURHANDAYANI) jika tersedia.
