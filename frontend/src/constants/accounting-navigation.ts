export type AccountingNavLabelKey =
  | "finance.accounting.dashboard"
  | "finance.accounting.referensiAkun"
  | "finance.accounting.jurnalBukuBesar"
  | "finance.accounting.laporanKeuangan"
  | "finance.accounting.tutupBuku";

export type AccountingSectionLabelKey =
  | "finance.accounting.coa"
  | "finance.accounting.mappingAkun"
  | "finance.accounting.jurnalUmum"
  | "finance.accounting.jurnalOtomatis"
  | "finance.accounting.postingJurnal"
  | "finance.accounting.bukuBesar"
  | "finance.accounting.neraca"
  | "finance.accounting.laporanOperasional"
  | "finance.accounting.laporanArusKas"
  | "finance.accounting.laporanPerubahanEkuitas"
  | "finance.accounting.tutupBukuPeriode";

export type AccountingNavItem = {
  labelKey: AccountingNavLabelKey;
  href: string;
};

/**
 * Sidebar Akuntansi — 5 menu (standar ERP: Accurate, SAP B1, dll.).
 * Laporan keuangan mengikuti PSAK — neraca, laba rugi, arus kas, perubahan ekuitas.
 */
export const ACCOUNTING_SUB_NAV: AccountingNavItem[] = [
  { labelKey: "finance.accounting.dashboard", href: "/finance/accounting" },
  {
    labelKey: "finance.accounting.referensiAkun",
    href: "/finance/accounting/referensi-akun",
  },
  {
    labelKey: "finance.accounting.jurnalBukuBesar",
    href: "/finance/accounting/jurnal-buku-besar",
  },
  {
    labelKey: "finance.accounting.laporanKeuangan",
    href: "/finance/accounting/laporan-keuangan",
  },
  { labelKey: "finance.accounting.tutupBuku", href: "/finance/accounting/tutup-buku" },
];
