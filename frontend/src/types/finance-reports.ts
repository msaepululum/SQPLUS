export type FinanceReportDashboardKpi = {
  total_pagu: number;
  total_realisasi: number;
  pct_serap: number;
  total_pendapatan: number;
  target_pendapatan: number;
  capaian_pendapatan_pct: number;
  saldo_kas_bank: number;
  total_hutang: number;
  total_piutang: number;
};

export type FinanceReportCategoryCard = {
  slug: string;
  label: string;
  href: string;
  count: number;
  highlight: number;
  highlight_label: string;
  highlight_unit: string;
};

export type FinanceReportDashboardData = {
  filters: { tahun: number; bulan: number | null; budget_year_id: number };
  kpis: FinanceReportDashboardKpi;
  categories: FinanceReportCategoryCard[];
  updated_at: string;
};

export function formatReportRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
