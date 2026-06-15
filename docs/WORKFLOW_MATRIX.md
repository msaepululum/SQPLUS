# Workflow Matrix — SQ+

## Engine

Workflow dikelola oleh `Workflow` module + `ApprovalService` dengan konfigurasi per `document_type`.

## Status Dokumen

```
draft → submitted → in_review → approved | rejected → (posted/cancelled)
```

## Matriks Approval

| Dokumen | Modul | Langkah 1 | Langkah 2 | Langkah 3 | Posting |
|---------|-------|-----------|-----------|-----------|---------|
| Purchase Request | Pengadaan | Kepala Unit | Procurement Manager | Direktur (≥ threshold) | — |
| Purchase Order | Pengadaan | Procurement Staff | Finance Manager | Direktur (≥ threshold) | Budget reserve |
| Goods Receipt | Supply Chain | Warehouse Staff | Warehouse Manager | — | Stock in + journal |
| Journal Voucher | Keuangan | Finance Staff | Finance Manager | — | Post journal |
| Leave Request | Personalia | Atasan Langsung | HR Manager | — | Update saldo cuti |
| Payroll Run | Personalia | HR Staff | HR Manager | Finance Manager | Post payroll journal |
| Stock Adjustment | Supply Chain | Warehouse Staff | Warehouse Manager | Finance (≥ threshold) | Stock + journal |
| Budget Revision | Keuangan | Finance Manager | Direktur | — | Update budget |

## Threshold

- Nilai transaksi ≥ Rp 100.000.000 → wajib approval Direktur
- Dikonfigurasi per `approval_flows` di database

## Notifikasi Terkait

| Event | Penerima |
|-------|----------|
| Submitted | Approver langkah aktif |
| Approved | Submitter + approver berikutnya |
| Rejected | Submitter |
| Posted | Submitter + finance (jika ada jurnal) |

## Integrasi Layanan

| Event | Service |
|-------|---------|
| Approved PO | `BudgetReservationService` |
| Posted GRN | `StockMovementService`, `JournalPostingService` |
| Semua aksi | `AuditTrailService`, `NotificationService` |
