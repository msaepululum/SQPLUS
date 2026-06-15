# SQ+ Hospital Administration Platform

Platform administrasi rumah sakit terintegrasi yang menyatukan operasional back-office dalam satu ekosistem data, workflow, dan pelaporan.

## Konsep SQ+

**SQ+** (Hospital Administration Platform) dirancang sebagai **single platform** untuk empat domain operasional rumah sakit. Setiap transaksi mengalir melalui layanan lintas modul yang sama — approval, audit trail, penomoran dokumen, reservasi anggaran, posting jurnal, dan mutasi stok — sehingga data konsisten dari pengadaan hingga pelaporan keuangan.

Prinsip inti:

- **Empat modul utama** — tidak lebih, tidak kurang
- **Workflow terpusat** — approval lintas departemen
- **Integrasi data** — PR → PO → GRN → Stok → Jurnal
- **Auditability** — setiap aksi tercatat

## Empat Modul Utama

| # | Modul | Folder Frontend | Folder Backend |
|---|-------|-----------------|----------------|
| 1 | **Keuangan** | `frontend/src/app/finance` | `backend/app/Modules/Finance` |
| 2 | **Personalia** | `frontend/src/app/hr` | `backend/app/Modules/HR` |
| 3 | **Pengadaan Barang/Jasa** | `frontend/src/app/procurement` | `backend/app/Modules/Procurement` |
| 4 | **Asset / Supply Chain** | `frontend/src/app/supply-chain` | `backend/app/Modules/SupplyChain` |

Modul pendukung (Foundation, Workflow, Reporting, Integration) bersifat **lintas modul** dan tidak ditampilkan sebagai modul utama di sidebar.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend Web | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend API | Laravel (PHP 8.2+), modular architecture |
| Database | PostgreSQL |
| Mobile | React Native / Expo (personalia) — `mobile/personalia/` |
| Auth | Laravel Sanctum + RBAC |
| Docs | Markdown di `docs/` |

## Struktur Folder

```
SQ+/
├── frontend/          # Next.js web application
│   └── src/
│       ├── app/       # Routes (login, dashboard, 4 modul utama, utilitas)
│       ├── components/# layout, ui, cards, tables, forms, charts, modals
│       ├── services/  # API client
│       ├── types/     # TypeScript types
│       ├── hooks/     # Custom React hooks
│       ├── stores/    # State management
│       ├── utils/     # Helpers
│       └── constants/ # Navigation, config
├── backend/           # Laravel API
│   ├── app/
│   │   ├── Modules/   # Foundation, Finance, HR, Procurement, SupplyChain, Workflow, Reporting, Integration
│   │   └── Services/  # Shared services (approval, audit, budget, journal, dll.)
│   └── routes/        # api.php + route per modul
├── mobile/
│   └── personalia/    # Mobile app SDM karyawan
├── database/          # Migrations, seeders (shared)
├── docs/              # PRD, ERD, API contract, RBAC, workflow, deployment
└── README.md
```

## Sidebar Frontend

Sidebar **hanya** menampilkan empat modul utama:

1. Keuangan → `/finance`
2. Personalia → `/hr`
3. Pengadaan Barang/Jasa → `/procurement`
4. Asset / Supply Chain → `/supply-chain`

Halaman utilitas (dashboard, approvals, notifications, profile, system) tersedia di bagian terpisah, bukan sebagai modul utama.

## Aturan Development

1. **Empat modul utama** — jangan menambah modul utama baru di sidebar atau navigasi utama
2. **Modular backend** — logika bisnis per domain di `app/Modules/{Module}`
3. **Shared services** — gunakan layanan di `app/Services/` untuk concern lintas modul
4. **API-first** — frontend & mobile konsumsi API yang sama
5. **RBAC** — setiap endpoint dilindungi permission (lihat `docs/RBAC_MATRIX.md`)
6. **Workflow** — dokumen transaksional melalui approval engine (lihat `docs/WORKFLOW_MATRIX.md`)
7. **Audit** — aksi sensitif wajib melalui `AuditTrailService`
8. **Dokumentasi** — update `docs/` saat ada perubahan kontrak API atau skema

## Prioritas Development

### Fase 1 — Foundation ✅
- [x] Inisialisasi Laravel penuh di `backend/`
- [x] Auth (Sanctum), RBAC, master data organisasi
- [x] Approval engine & notifikasi dasar
- [x] Audit trail
- [x] Integrasi login frontend ↔ API

### Fase 2 — Modul Keuangan
- [ ] Chart of accounts & jurnal
- [ ] Manajemen anggaran & reservasi
- [ ] Dashboard & laporan dasar

### Fase 3 — Modul Pengadaan + Supply Chain
- [ ] Purchase request → PO → GRN
- [ ] Inventori & mutasi stok
- [ ] Integrasi posting jurnal otomatis

### Fase 4 — Modul Personalia ✅
- [x] Data karyawan & jabatan
- [x] Absensi (check-in/out API)
- [x] Pengajuan cuti + integrasi approval workflow
- [x] Penggajian dasar (periode + slip)
- [x] Frontend: ringkasan, karyawan, absensi, cuti, payroll

### Fase 5 — Mobile Personalia
- [ ] Auth & profil karyawan
- [ ] Absensi & cuti mobile
- [ ] Notifikasi push

## Dokumentasi

| Dokumen | Path |
|---------|------|
| Product Requirements | [docs/PRD.md](docs/PRD.md) |
| Entity Relationship | [docs/ERD.md](docs/ERD.md) |
| API Contract | [docs/API_CONTRACT.md](docs/API_CONTRACT.md) |
| RBAC Matrix | [docs/RBAC_MATRIX.md](docs/RBAC_MATRIX.md) |
| Workflow Matrix | [docs/WORKFLOW_MATRIX.md](docs/WORKFLOW_MATRIX.md) |
| Mobile Plan | [docs/MOBILE_PERSONALIA_PLAN.md](docs/MOBILE_PERSONALIA_PLAN.md) |
| Deployment | [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) |

## Quick Start

```bash
# Frontend
cd frontend
npm install
npm run dev
# → http://localhost:3000

# Backend (setelah Laravel diinisialisasi)
cd backend
composer install
php artisan serve
# → http://localhost:8000
```

## Lisensi

Proprietary — SQ+ Hospital Administration Platform.
