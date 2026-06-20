export type PenerimaanFilters = {
  tahun: string;
  bulan: string;
  unitLayanan: string;
  jenisPembayar: string;
  jenisLayanan: string;
};

export const DEFAULT_PENERIMAAN_FILTERS: PenerimaanFilters = {
  tahun: "2025",
  bulan: "all",
  unitLayanan: "all",
  jenisPembayar: "all",
  jenisLayanan: "all",
};

export const PENERIMAAN_TAHUN_OPTIONS = [
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
];

export const PENERIMAAN_BULAN_OPTIONS = [
  { value: "all", label: "Semua Bulan" },
  { value: "Jan", label: "Januari" },
  { value: "Feb", label: "Februari" },
  { value: "Mar", label: "Maret" },
  { value: "Apr", label: "April" },
  { value: "Mei", label: "Mei" },
  { value: "Jun", label: "Juni" },
  { value: "Jul", label: "Juli" },
  { value: "Agu", label: "Agustus" },
  { value: "Sep", label: "September" },
  { value: "Okt", label: "Oktober" },
  { value: "Nov", label: "November" },
  { value: "Des", label: "Desember" },
];

export const PENERIMAAN_UNIT_OPTIONS = [
  { value: "all", label: "Semua Unit" },
  { value: "rawat-jalan", label: "Rawat Jalan" },
  { value: "rawat-inap", label: "Rawat Inap" },
  { value: "igd", label: "IGD" },
  { value: "penunjang", label: "Penunjang Medis" },
  { value: "farmasi", label: "Farmasi" },
];

export const PENERIMAAN_PEMBAYAR_OPTIONS = [
  { value: "all", label: "Semua Jenis" },
  { value: "bpjs", label: "BPJS" },
  { value: "tunai", label: "Tunai" },
  { value: "asuransi", label: "Asuransi" },
  { value: "kerja-sama", label: "Kerja Sama" },
  { value: "lainnya", label: "Lainnya" },
];

export const PENERIMAAN_LAYANAN_OPTIONS = [
  { value: "all", label: "Semua Layanan" },
  { value: "rawat-jalan", label: "Rawat Jalan" },
  { value: "rawat-inap", label: "Rawat Inap" },
  { value: "igd", label: "IGD" },
  { value: "penunjang", label: "Penunjang" },
  { value: "farmasi", label: "Farmasi" },
];

export type PenerimaanKpi = {
  label: string;
  value: string;
  trend: string;
  trendPositive: boolean;
  iconBg: string;
  icon: string;
};

export const PENERIMAAN_KPIS: PenerimaanKpi[] = [
  {
    label: "Total Pendapatan Tahun Berjalan",
    value: "Rp 189,60 M",
    trend: "↑ 13,21% YoY",
    trendPositive: true,
    iconBg: "bg-teal-600",
    icon: "💰",
  },
  {
    label: "Pendapatan Bulan Ini (Mei 2025)",
    value: "Rp 18,90 M",
    trend: "↑ 8,74% MoM",
    trendPositive: true,
    iconBg: "bg-blue-600",
    icon: "📅",
  },
  {
    label: "Rata-rata Pendapatan Bulanan",
    value: "Rp 15,80 M",
    trend: "↑ 6,32% YoY",
    trendPositive: true,
    iconBg: "bg-violet-600",
    icon: "📊",
  },
  {
    label: "Pertumbuhan YoY Tahun Berjalan",
    value: "13,21%",
    trend: "vs Mei 2024",
    trendPositive: true,
    iconBg: "bg-emerald-600",
    icon: "📈",
  },
  {
    label: "Pendapatan BPJS Tahun Berjalan",
    value: "Rp 105,60 M",
    trend: "55,67% dari total",
    trendPositive: true,
    iconBg: "bg-sky-600",
    icon: "🛡️",
  },
  {
    label: "Pendapatan Tunai Tahun Berjalan",
    value: "Rp 46,20 M",
    trend: "24,36% dari total",
    trendPositive: true,
    iconBg: "bg-amber-500",
    icon: "💵",
  },
  {
    label: "Asuransi / Kerja Sama Tahun Berjalan",
    value: "Rp 26,30 M",
    trend: "13,87% dari total",
    trendPositive: true,
    iconBg: "bg-orange-500",
    icon: "🤝",
  },
  {
    label: "Target vs Realisasi Tahun Berjalan",
    value: "94,8%",
    trend: "Target: Rp 200,00 M",
    trendPositive: false,
    iconBg: "bg-rose-500",
    icon: "🎯",
  },
];

export type MonthlyRevenueRow = {
  month: string;
  target: number;
  realisasi: number;
  selisih: number;
  yoyGrowth: number;
  pencapaian: number;
  achieved: boolean;
};

export const PENERIMAAN_MONTHLY_ROWS: MonthlyRevenueRow[] = [
  { month: "Jan", target: 16.67, realisasi: 14.2, selisih: -2.47, yoyGrowth: 9.87, pencapaian: 85.16, achieved: false },
  { month: "Feb", target: 16.67, realisasi: 15.1, selisih: -1.57, yoyGrowth: 10.45, pencapaian: 90.58, achieved: false },
  { month: "Mar", target: 16.67, realisasi: 16.3, selisih: -0.37, yoyGrowth: 11.2, pencapaian: 97.78, achieved: false },
  { month: "Apr", target: 16.67, realisasi: 17.5, selisih: 0.83, yoyGrowth: 12.05, pencapaian: 105.0, achieved: true },
  { month: "Mei", target: 20.0, realisasi: 18.9, selisih: -1.1, yoyGrowth: 13.21, pencapaian: 94.5, achieved: false },
  { month: "Jun", target: 16.67, realisasi: 0, selisih: 0, yoyGrowth: 0, pencapaian: 0, achieved: false },
  { month: "Jul", target: 16.67, realisasi: 0, selisih: 0, yoyGrowth: 0, pencapaian: 0, achieved: false },
  { month: "Agu", target: 16.67, realisasi: 0, selisih: 0, yoyGrowth: 0, pencapaian: 0, achieved: false },
  { month: "Sep", target: 16.67, realisasi: 0, selisih: 0, yoyGrowth: 0, pencapaian: 0, achieved: false },
  { month: "Okt", target: 16.67, realisasi: 0, selisih: 0, yoyGrowth: 0, pencapaian: 0, achieved: false },
  { month: "Nov", target: 16.67, realisasi: 0, selisih: 0, yoyGrowth: 0, pencapaian: 0, achieved: false },
  { month: "Des", target: 16.67, realisasi: 0, selisih: 0, yoyGrowth: 0, pencapaian: 0, achieved: false },
];

export type MonthlyTrendPoint = {
  month: string;
  realisasi2025: number;
  target2025: number;
  realisasi2024: number;
};

export const PENERIMAAN_TREND_DATA: MonthlyTrendPoint[] = [
  { month: "Jan", realisasi2025: 14.2, target2025: 16.67, realisasi2024: 12.9 },
  { month: "Feb", realisasi2025: 15.1, target2025: 16.67, realisasi2024: 13.7 },
  { month: "Mar", realisasi2025: 16.3, target2025: 16.67, realisasi2024: 14.7 },
  { month: "Apr", realisasi2025: 17.5, target2025: 16.67, realisasi2024: 15.6 },
  { month: "Mei", realisasi2025: 18.9, target2025: 20.0, realisasi2024: 16.7 },
  { month: "Jun", realisasi2025: 0, target2025: 16.67, realisasi2024: 17.2 },
  { month: "Jul", realisasi2025: 0, target2025: 16.67, realisasi2024: 16.8 },
  { month: "Agu", realisasi2025: 0, target2025: 16.67, realisasi2024: 15.9 },
  { month: "Sep", realisasi2025: 0, target2025: 16.67, realisasi2024: 16.1 },
  { month: "Okt", realisasi2025: 0, target2025: 16.67, realisasi2024: 16.4 },
  { month: "Nov", realisasi2025: 0, target2025: 16.67, realisasi2024: 16.6 },
  { month: "Des", realisasi2025: 0, target2025: 16.67, realisasi2024: 17.8 },
];

export type MonthlySourceStack = {
  month: string;
  bpjs: number;
  tunai: number;
  asuransi: number;
  kerjaSama: number;
  lainnya: number;
};

export const PENERIMAAN_SOURCE_STACK: MonthlySourceStack[] = [
  { month: "Jan", bpjs: 7.9, tunai: 3.5, asuransi: 1.4, kerjaSama: 0.9, lainnya: 0.5 },
  { month: "Feb", bpjs: 8.4, tunai: 3.7, asuransi: 1.5, kerjaSama: 0.9, lainnya: 0.6 },
  { month: "Mar", bpjs: 9.1, tunai: 4.0, asuransi: 1.6, kerjaSama: 1.0, lainnya: 0.7 },
  { month: "Apr", bpjs: 9.8, tunai: 4.3, asuransi: 1.7, kerjaSama: 1.1, lainnya: 0.6 },
  { month: "Mei", bpjs: 10.5, tunai: 4.6, asuransi: 1.9, kerjaSama: 1.2, lainnya: 0.7 },
  { month: "Jun", bpjs: 0, tunai: 0, asuransi: 0, kerjaSama: 0, lainnya: 0 },
  { month: "Jul", bpjs: 0, tunai: 0, asuransi: 0, kerjaSama: 0, lainnya: 0 },
  { month: "Agu", bpjs: 0, tunai: 0, asuransi: 0, kerjaSama: 0, lainnya: 0 },
  { month: "Sep", bpjs: 0, tunai: 0, asuransi: 0, kerjaSama: 0, lainnya: 0 },
  { month: "Okt", bpjs: 0, tunai: 0, asuransi: 0, kerjaSama: 0, lainnya: 0 },
  { month: "Nov", bpjs: 0, tunai: 0, asuransi: 0, kerjaSama: 0, lainnya: 0 },
  { month: "Des", bpjs: 0, tunai: 0, asuransi: 0, kerjaSama: 0, lainnya: 0 },
];

export const PENERIMAAN_SOURCE_COLORS = {
  bpjs: "#2563eb",
  tunai: "#14b8a6",
  asuransi: "#f97316",
  kerjaSama: "#8b5cf6",
  lainnya: "#94a3b8",
} as const;

export type IncomeCategoryRow = {
  label: string;
  amount: number;
  pct: number;
};

export const PENERIMAAN_INCOME_CATEGORIES: IncomeCategoryRow[] = [
  { label: "Rawat Jalan", amount: 68.5, pct: 36.13 },
  { label: "Rawat Inap", amount: 52.3, pct: 27.58 },
  { label: "IGD", amount: 14.2, pct: 7.49 },
  { label: "Penunjang", amount: 31.5, pct: 16.61 },
  { label: "Farmasi", amount: 23.1, pct: 12.19 },
];

export type SourceComposition = {
  label: string;
  amount: number;
  pct: number;
  color: string;
};

export const PENERIMAAN_SOURCE_COMPOSITION: SourceComposition[] = [
  { label: "BPJS", amount: 105.6, pct: 55.67, color: PENERIMAAN_SOURCE_COLORS.bpjs },
  { label: "Tunai", amount: 46.2, pct: 24.36, color: PENERIMAAN_SOURCE_COLORS.tunai },
  { label: "Asuransi", amount: 15.8, pct: 8.33, color: PENERIMAAN_SOURCE_COLORS.asuransi },
  { label: "Kerja Sama", amount: 10.5, pct: 5.54, color: PENERIMAAN_SOURCE_COLORS.kerjaSama },
  { label: "Lainnya", amount: 11.5, pct: 6.07, color: PENERIMAAN_SOURCE_COLORS.lainnya },
];

export type ServiceRevenue = {
  label: string;
  value: number;
};

export const PENERIMAAN_SERVICE_REVENUE: ServiceRevenue[] = [
  { label: "Rawat Jalan", value: 68.5 },
  { label: "Rawat Inap", value: 52.3 },
  { label: "IGD", value: 14.2 },
  { label: "Penunjang", value: 31.5 },
  { label: "Farmasi", value: 23.1 },
];

export type TopPoli = {
  name: string;
  amount: string;
  pct: number;
};

export const PENERIMAAN_TOP_POLI: TopPoli[] = [
  { name: "Poli Jantung", amount: "Rp 28,4 M", pct: 15.0 },
  { name: "Poli Kebidanan", amount: "Rp 22,1 M", pct: 11.7 },
  { name: "Poli Orthopedi", amount: "Rp 19,8 M", pct: 10.4 },
  { name: "Poli Bedah", amount: "Rp 18,6 M", pct: 9.8 },
  { name: "Poli Penyakit Dalam", amount: "Rp 16,2 M", pct: 8.5 },
];

export type TopDoctor = {
  rank: number;
  name: string;
  poli: string;
  revenue: string;
  contrib: string;
};

export const PENERIMAAN_TOP_DOCTORS: TopDoctor[] = [
  { rank: 1, name: "dr. Hendra Pratama, Sp.JP", poli: "Jantung", revenue: "Rp 12,4 M", contrib: "6,5%" },
  { rank: 2, name: "dr. Rina Kusuma, Sp.OG", poli: "Kebidanan", revenue: "Rp 9,8 M", contrib: "5,2%" },
  { rank: 3, name: "dr. Maya Lestari, Sp.OT", poli: "Orthopedi", revenue: "Rp 8,6 M", contrib: "4,5%" },
  { rank: 4, name: "dr. Budi Santoso, Sp.B", poli: "Bedah", revenue: "Rp 7,9 M", contrib: "4,2%" },
  { rank: 5, name: "dr. Andi Wijaya, Sp.PD", poli: "Penyakit Dalam", revenue: "Rp 6,7 M", contrib: "3,5%" },
];

export const PENERIMAAN_INSIGHTS = [
  "Pendapatan BPJS mendominasi (55,67%) — diversifikasi sumber pembayar perlu diperhatikan.",
  "Target tahun berjalan belum tercapai (94,8%) — selisih Rp 10,40 M perlu dikejar.",
  "5 bulan pertama belum mencapai target bulanan — perlu evaluasi strategi peningkatan layanan.",
  "Poli Jantung dan Kebidanan menjadi kontributor pendapatan terbesar.",
  "Pertumbuhan YoY positif 13,21% — momentum perlu dipertahankan hingga akhir tahun.",
];

export const PENERIMAAN_TARGET_SUMMARY = {
  targetTahunan: 200.0,
  realisasi: 189.6,
  pencapaian: 94.8,
  sisaTarget: 10.4,
  rataRataBulanan: 37.92,
};

export function hasActivePenerimaanFilters(filters: PenerimaanFilters): boolean {
  return (
    filters.tahun !== DEFAULT_PENERIMAAN_FILTERS.tahun ||
    filters.bulan !== DEFAULT_PENERIMAAN_FILTERS.bulan ||
    filters.unitLayanan !== DEFAULT_PENERIMAAN_FILTERS.unitLayanan ||
    filters.jenisPembayar !== DEFAULT_PENERIMAAN_FILTERS.jenisPembayar ||
    filters.jenisLayanan !== DEFAULT_PENERIMAAN_FILTERS.jenisLayanan
  );
}

export function filterMonthlyRows(
  rows: MonthlyRevenueRow[],
  filters: PenerimaanFilters
): MonthlyRevenueRow[] {
  if (filters.bulan === "all") return rows;
  return rows.filter((r) => r.month === filters.bulan);
}
