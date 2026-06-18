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

## Database

### MySQL — aplikasi SQ+ (default)

Migrasi Laravel **hanya** dijalankan ke koneksi MySQL ini:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sqplus
DB_USERNAME=root
DB_PASSWORD=...
```

```bash
php artisan migrate --seed
```

> **Penting:** Jangan jalankan `php artisan migrate` dengan `--database=rsud_*` — database SQL Server RSUD sudah berisi data operasional.

### SQL Server RSUD Pasar Rebo — integrasi multi-database

Sembilan database operasional RSUD terhubung sebagai koneksi terpisah (read/integrasi):

| Koneksi Laravel | Database SQL Server |
|-----------------|---------------------|
| `rsud_acc2026` | ACCRSPR2026 |
| `rsud_simartdb` | SIMARTDB |
| `rsud_user_manajemen` | USER_MANAJEMEN |
| `rsud_payroll` | Payroll |
| `rsud_hris` | HRIS |
| `rsud_asset` | ASSET_MANAJEMEN |
| `rsud_mesin_absensi` | MESIN_ABSENSI |
| `rsud_finance` | FINANCE |
| `rsud_simrs_v2` | SIMRS_V2 |

Kredensial SQL Server (satu host untuk semua database):

```env
RSUD_DB_HOST=10.0.10.204
RSUD_DB_PORT=1433
RSUD_DB_USERNAME=<user>
RSUD_DB_PASSWORD=<password>
RSUD_DB_ENCRYPT=yes
RSUD_DB_TRUST_SERVER_CERTIFICATE=true
```

### Prasyarat PHP `sqlsrv` (macOS)

```bash
brew tap microsoft/mssql-release https://github.com/Microsoft/homebrew-mssql-release
brew update
brew install msodbcsql18 mssql-tools18
pecl install sqlsrv pdo_sqlsrv
```

Tambahkan ke `php.ini`:

```ini
extension=sqlsrv.so
extension=pdo_sqlsrv.so
```

### Uji koneksi RSUD

```bash
php artisan db:test-rsud --all
php artisan db:test-rsud rsud_payroll
```

### Contoh akses dari kode

```php
use App\Support\RsudConnections;
use Illuminate\Support\Facades\DB;

// Payroll — TBPEGAWAI
$pegawai = DB::connection(RsudConnections::PAYROLL)
    ->table('TBPEGAWAI')
    ->limit(10)
    ->get();

// SIMRS V2
$pasien = DB::connection(RsudConnections::SIMRS_V2)
    ->table('nama_tabel')
    ->limit(10)
    ->get();
```

Konstanta koneksi tersedia di `App\Support\RsudConnections`.

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
- `app/Modules/AI` — AI Assistant read-only (Phase 1)

## AI Assistant (Phase 1)

Modul read-only untuk ringkasan dan analisa data SQ+. Tidak melakukan mutasi data (approve, reject, update, posting, dll.).

**Env (`.env`) — pilih provider:**

```
AI_PROVIDER=openai          # openai | gemini
AI_ASSISTANT_MAX_TOKENS=1024
```

**OpenAI-compatible** (OpenAI, DeepSeek, Groq, Ollama):

```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

**Google Gemini** ([AI Studio](https://aistudio.google.com)):

```
AI_PROVIDER=gemini
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-2.0-flash
```

Jika API key kosong, backend memakai fallback rule-based + mock tool data.

| Method | Path | Deskripsi |
|--------|------|-----------|
| POST | `/api/ai/chat` | Kirim pesan chat |
| GET | `/api/ai/sessions` | Daftar sesi user |
| GET | `/api/ai/sessions/{id}` | Detail sesi + messages |
| POST | `/api/ai/messages/{id}/feedback` | Feedback thumbs up/down |

Permission: `ai.assistant.use`

## API Foundation

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Login (nomor kepegawaian + password dari USER_MANAJEMEN) |
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
