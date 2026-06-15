# API Contract — SQ+

## Base URL

```
{API_HOST}/api
```

## Autentikasi

```
Authorization: Bearer {token}
```

Token diperoleh via `POST /api/auth/login` (Foundation module).

## Format Response

### Sukses

```json
{
  "data": {},
  "message": "optional"
}
```

### Error

```json
{
  "message": "Deskripsi error",
  "errors": {
    "field": ["pesan validasi"]
  }
}
```

### Paginasi

```json
{
  "data": [],
  "meta": {
    "current_page": 1,
    "last_page": 10,
    "per_page": 15,
    "total": 150
  }
}
```

## Health Check

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/health` | Status API |

## Keuangan (`/finance`)

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/finance/dashboard` | Ringkasan keuangan |
| GET | `/finance/accounts` | Chart of accounts |
| GET | `/finance/journals` | Daftar jurnal |
| POST | `/finance/journals` | Buat jurnal manual |
| GET | `/finance/budgets` | Daftar anggaran |

## Personalia (`/hr`)

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/hr/dashboard` | Ringkasan SDM |
| GET | `/hr/employees` | Daftar karyawan |
| GET | `/hr/employees/{id}` | Detail karyawan |
| GET | `/hr/attendance` | Rekap kehadiran |
| POST | `/hr/leave-requests` | Ajukan cuti |

## Pengadaan (`/procurement`)

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/procurement/dashboard` | Ringkasan pengadaan |
| GET | `/procurement/purchase-requests` | Daftar PR |
| POST | `/procurement/purchase-requests` | Buat PR |
| GET | `/procurement/purchase-orders` | Daftar PO |
| POST | `/procurement/goods-receipts` | Penerimaan barang |

## Supply Chain (`/supply-chain`)

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/supply-chain/dashboard` | Ringkasan stok |
| GET | `/supply-chain/items` | Master item |
| GET | `/supply-chain/stock-balances` | Saldo stok |
| POST | `/supply-chain/stock-movements` | Mutasi stok |
| GET | `/supply-chain/fixed-assets` | Daftar aset |

## Workflow (`/workflow`)

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/workflow/approvals` | Antrian approval user |
| POST | `/workflow/approvals/{id}/approve` | Setujui |
| POST | `/workflow/approvals/{id}/reject` | Tolak |

## Konvensi

- HTTP status: 200/201 sukses, 401 unauthorized, 403 forbidden, 422 validation, 500 server error
- Semua tanggal: ISO 8601 (`YYYY-MM-DD` atau datetime dengan timezone)
- ID: integer auto-increment (internal), UUID opsional untuk integrasi eksternal
