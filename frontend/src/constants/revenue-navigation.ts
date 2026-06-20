export type RevenueNavLabelKey =
  | "finance.revenue.dashboard"
  | "finance.revenue.perencanaanPendapatan"
  | "finance.revenue.pengumpulanRekap"
  | "finance.revenue.analisis"
  | "finance.revenue.rekonsiliasi";

export type RevenueSectionLabelKey =
  | "finance.revenue.setupTarget"
  | "finance.revenue.inputRencana"
  | "finance.revenue.distribusiBulanan"
  | "finance.revenue.importTarik"
  | "finance.revenue.inputManual"
  | "finance.revenue.rekapHarian"
  | "finance.revenue.rekapBulanan"
  | "finance.revenue.perKategori"
  | "finance.revenue.rekonsiliasiPendapatan";

export type RevenueNavItem = {
  labelKey: RevenueNavLabelKey;
  href: string;
};

/**
 * Sidebar Pendapatan — 5 menu.
 * Klasifikasi pendapatan: lihat REVENUE_CATEGORIES (8 kategori BLU resmi).
 */
export const REVENUE_SUB_NAV: RevenueNavItem[] = [
  { labelKey: "finance.revenue.dashboard", href: "/finance/revenue" },
  {
    labelKey: "finance.revenue.perencanaanPendapatan",
    href: "/finance/revenue/perencanaan-pendapatan",
  },
  { labelKey: "finance.revenue.pengumpulanRekap", href: "/finance/revenue/pengumpulan-rekap" },
  { labelKey: "finance.revenue.analisis", href: "/finance/revenue/analisis" },
  { labelKey: "finance.revenue.rekonsiliasi", href: "/finance/revenue/rekonsiliasi" },
];
