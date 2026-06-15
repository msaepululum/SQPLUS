# Mobile Personalia Plan — SQ+

## Tujuan

Aplikasi mobile untuk karyawan rumah sakit (self-service SDM) yang terintegrasi dengan modul **Personalia** di backend.

## Target Platform

- React Native (Expo) — fase implementasi
- Struktur awal: `mobile/personalia/`

## Fitur Fase 1 (MVP)

| Fitur | Prioritas | Endpoint |
|-------|-----------|----------|
| Login / profil | P0 | `/api/auth/*`, `/api/hr/employees/me` |
| Absensi (check-in/out) | P0 | `/api/hr/attendance` |
| Pengajuan cuti | P0 | `/api/hr/leave-requests` |
| Riwayat cuti | P1 | `/api/hr/leave-requests` |
| Slip gaji | P1 | `/api/hr/payroll/me` |
| Notifikasi push | P1 | `/api/workflow/approvals` |

## Struktur Folder

```
mobile/personalia/
├── screens/       # Layar aplikasi
├── components/    # UI reusable
├── services/      # API client
├── types/         # TypeScript types
└── docs/          # Spesifikasi mobile
```

## Arsitektur

```
Mobile App → API Gateway (Laravel) → HR Module → Database
                ↓
         NotificationService (push)
```

## Keamanan

- Token JWT / Sanctum
- Biometric unlock (opsional, fase 2)
- Device binding untuk absensi (fase 2)

## Roadmap

1. **Sprint 1:** Scaffold Expo + auth + profil
2. **Sprint 2:** Absensi & cuti
3. **Sprint 3:** Slip gaji & notifikasi
4. **Sprint 4:** Offline cache & polish UX
