# Product Requirements Document — SQ+ Hospital Administration Platform

## 1. Ringkasan

SQ+ adalah platform administrasi rumah sakit terintegrasi yang menyatukan empat domain operasional utama dalam satu ekosistem data, workflow, dan pelaporan.

## 2. Masalah yang Diselesaikan

- Fragmentasi data antar departemen (keuangan, SDM, pengadaan, gudang)
- Proses approval manual dan tidak terlacak
- Ketidakselarasan anggaran, komitmen, dan realisasi
- Pelaporan lintas modul yang lambat dan tidak konsisten

## 3. Empat Modul Utama

| Modul | Ruang lingkup |
|-------|---------------|
| **Keuangan** | COA, jurnal, kas/bank, anggaran, AP/AR, pelaporan |
| **Personalia** | Data karyawan, kehadiran, cuti, penggajian, KPI SDM |
| **Pengadaan Barang/Jasa** | Perencanaan, PR, tender/penawaran, PO, GRN |
| **Asset / Supply Chain** | Inventori, aset tetap, distribusi, mutasi stok |

> Modul pendukung (workflow, reporting, integration, foundation) bersifat **lintas modul** dan tidak ditampilkan sebagai modul utama di sidebar.

## 4. Persona Pengguna

- Direktur / Manajemen: dashboard & approval strategis
- Keuangan: jurnal, anggaran, pelaporan
- SDM: personalia & payroll
- Pengadaan: PR, PO, vendor
- Gudang / Farmasi: stok & distribusi
- Admin sistem: RBAC, master data, audit

## 5. Kebutuhan Fungsional Utama

### Foundation (lintas modul)
- Autentikasi & otorisasi (RBAC)
- Master data organisasi (unit, lokasi, cost center)
- Audit trail & dokumentasi pendukung
- Notifikasi & approval engine

### Keuangan
- Chart of accounts & posting jurnal otomatis dari transaksi modul lain
- Manajemen anggaran & reservasi komitmen
- Laporan keuangan standar rumah sakit

### Personalia
- Manajemen karyawan & struktur organisasi
- Kehadiran, cuti, lembur
- Penggajian & slip gaji
- Mobile app karyawan (personalia)

### Pengadaan
- Purchase request → approval → PO
- Manajemen vendor & evaluasi
- Penerimaan barang/jasa terintegrasi ke stok & jurnal

### Supply Chain
- Multi-warehouse inventory
- Aset tetap & depresiasi
- Distribusi antar unit/lokasi

## 6. Kebutuhan Non-Fungsional

- Keamanan: RBAC granular, audit log, enkripsi data sensitif
- Kinerja: response API < 500ms untuk operasi umum
- Ketersediaan: target 99.5% uptime
- Skalabilitas: multi-unit rumah sakit (future)

## 7. Out of Scope (Fase 1)

- Modul klinis / rekam medis elektronik
- Modul utama di luar empat domain di atas
- Integrasi penuh dengan BPJS (fase lanjutan)

## 8. Metrik Keberhasilan

- Waktu siklus approval turun ≥ 40%
- Rekonsiliasi anggaran-realtime tersedia per modul
- Single source of truth untuk stok & komitmen anggaran
