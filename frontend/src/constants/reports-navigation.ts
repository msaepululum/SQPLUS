export type ReportsNavLabelKey =
  | "finance.reports.dashboard"
  | "finance.reports.anggaran"
  | "finance.reports.operasional"
  | "finance.reports.posKeuangan"
  | "finance.reports.transaksi";

export type ReportsSectionLabelKey =
  | "finance.reports.paguAnggaran"
  | "finance.reports.realisasiAnggaran"
  | "finance.reports.dayaSerap"
  | "finance.reports.pendapatan"
  | "finance.reports.pendapatanPerAkun"
  | "finance.reports.belanja"
  | "finance.reports.kasBank"
  | "finance.reports.saldoBulanan"
  | "finance.reports.hutang"
  | "finance.reports.piutang"
  | "finance.reports.pembayaran"
  | "finance.reports.jurnal";

export type ReportsNavItem = {
  labelKey: ReportsNavLabelKey;
  href: string;
};

/** Sidebar Laporan — 5 menu. Insight pimpinan ada di modul terpisah. */
export const REPORTS_SUB_NAV: ReportsNavItem[] = [
  { labelKey: "finance.reports.dashboard", href: "/finance/reports" },
  { labelKey: "finance.reports.anggaran", href: "/finance/reports/anggaran" },
  { labelKey: "finance.reports.operasional", href: "/finance/reports/operasional" },
  { labelKey: "finance.reports.posKeuangan", href: "/finance/reports/pos-keuangan" },
  { labelKey: "finance.reports.transaksi", href: "/finance/reports/transaksi" },
];
