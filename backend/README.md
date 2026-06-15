# SQ+ Backend (Laravel 13)

API backend untuk SQ+ Hospital Administration Platform.

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

API tersedia di `http://localhost:8000/api`.

## Akun Demo (setelah seed)

| Email | Password | Role |
|-------|----------|------|
| admin@sqplus.local | password | super_admin |
| direktur@sqplus.local | password | director |
| keuangan@sqplus.local | password | finance_manager |
| sdm@sqplus.local | password | hr_manager |
| pengadaan@sqplus.local | password | procurement_manager |
| gudang@sqplus.local | password | warehouse_manager |
| karyawan@sqplus.local | password | employee → pegawai kode 589 |

## Struktur Modul

- `app/Modules/Foundation` — auth, RBAC, master data, audit, notifikasi
- `app/Modules/Finance` — keuangan & akuntansi
- `app/Modules/HR` — personalia
- `app/Modules/Procurement` — pengadaan barang/jasa
- `app/Modules/SupplyChain` — asset & supply chain
- `app/Modules/Workflow` — approval engine
- `app/Modules/Reporting` — pelaporan lintas modul
- `app/Modules/Integration` — integrasi eksternal

## API Foundation

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout (auth) |
| GET | `/api/auth/me` | Profil + permissions |
| GET | `/api/organizational-units` | Daftar unit organisasi |
| GET | `/api/notifications` | Notifikasi user |
| GET | `/api/audit-logs` | Audit trail (permission) |
| GET | `/api/workflow/approvals` | Antrian approval |

## Data Pegawai Legacy

770 pegawai diimpor dari `database/sources/TBPEGAWAI.sql` (Payroll SIMRS).  
Lihat [docs/LEGACY_EMPLOYEE_MAPPING.md](../docs/LEGACY_EMPLOYEE_MAPPING.md).

## API Personalia (`/hr`)

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/hr/dashboard` | Ringkasan SDM |
| GET | `/api/hr/employees` | Daftar karyawan |
| GET | `/api/hr/employees/me` | Profil karyawan (self) |
| GET | `/api/hr/attendance` | Rekap absensi |
| POST | `/api/hr/attendance/check-in` | Check-in |
| POST | `/api/hr/attendance/check-out` | Check-out |
| GET | `/api/hr/leave-types` | Jenis cuti |
| GET/POST | `/api/hr/leave-requests` | Riwayat / ajukan cuti |
| GET | `/api/hr/payroll/periods` | Periode gaji |
| GET | `/api/hr/payroll/me` | Slip gaji (self) |

## Layanan Lintas Modul

`app/Services/` — ApprovalService, AuditTrailService, NotificationService, BudgetReservationService, JournalPostingService, NumberingService, StockMovementService, DocumentService.
