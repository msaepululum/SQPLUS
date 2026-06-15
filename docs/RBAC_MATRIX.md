# RBAC Matrix — SQ+

## Prinsip

- Akses berbasis **role** + **scope unit organisasi**
- Empat modul utama memiliki permission namespace sendiri
- Permission lintas modul (workflow, audit, system) di namespace `foundation.*`

## Role Standar

| Role | Deskripsi |
|------|-----------|
| `super_admin` | Akses penuh sistem |
| `director` | Approval strategis, dashboard eksekutif |
| `finance_manager` | Manajemen modul keuangan |
| `finance_staff` | Operasional keuangan |
| `hr_manager` | Manajemen modul personalia |
| `hr_staff` | Operasional SDM |
| `procurement_manager` | Manajemen pengadaan |
| `procurement_staff` | Operasional PR/PO |
| `warehouse_manager` | Manajemen gudang & aset |
| `warehouse_staff` | Operasional stok |
| `employee` | Self-service (mobile personalia) |

## Permission Namespace

```
foundation.users.*
foundation.roles.*
foundation.audit.view
foundation.master.*

finance.accounts.*
finance.journals.*
finance.budgets.*
finance.reports.*

hr.employees.*
hr.attendance.*
hr.leave.*
hr.payroll.*

procurement.pr.*
procurement.po.*
procurement.vendors.*
procurement.grn.*

supply_chain.items.*
supply_chain.stock.*
supply_chain.assets.*
supply_chain.distribution.*

workflow.approve
workflow.delegate
```

## Matriks Ringkas

| Permission | super_admin | director | finance_* | hr_* | procurement_* | warehouse_* | employee |
|------------|:-----------:|:--------:|:---------:|:----:|:-------------:|:-----------:|:--------:|
| finance.reports.view | ✓ | ✓ | ✓ | — | — | — | — |
| finance.journals.create | ✓ | — | ✓ | — | — | — | — |
| hr.payroll.view | ✓ | ✓ | — | ✓ | — | — | — |
| hr.leave.approve | ✓ | ✓ | — | ✓ | — | — | — |
| procurement.po.approve | ✓ | ✓ | — | — | ✓ | — | — |
| supply_chain.stock.move | ✓ | — | — | — | — | ✓ | — |
| workflow.approve | ✓ | ✓ | scope | scope | scope | scope | — |
| foundation.audit.view | ✓ | ✓ | — | — | — | — | — |

**Keterangan:** `scope` = hanya dalam unit organisasi yang ditugaskan.

## Implementasi

- Backend: Laravel Policies + middleware `can:{permission}`
- Frontend: guard route & conditional UI berdasarkan permission dari token/session
