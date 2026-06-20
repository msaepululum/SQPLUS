export type LaporanKeuanganFilters = {
  periode: string;
  unit: string;
  sumberDana: string;
};

export const DEFAULT_LAPORAN_KEUANGAN_FILTERS: LaporanKeuanganFilters = {
  periode: "2024",
  unit: "all",
  sumberDana: "all",
};

export const LAPORAN_PERIODE_OPTIONS = [
  { value: "2024", label: "Jan – Des 2024" },
  { value: "2025", label: "Jan – Des 2025" },
  { value: "2024-h1", label: "Jan – Jun 2024" },
  { value: "2024-h2", label: "Jul – Des 2024" },
];

export const LAPORAN_UNIT_OPTIONS = [
  { value: "all", label: "Semua Unit" },
  { value: "rawat-jalan", label: "Rawat Jalan" },
  { value: "rawat-inap", label: "Rawat Inap" },
  { value: "igd", label: "IGD" },
  { value: "penunjang", label: "Penunjang" },
  { value: "farmasi", label: "Farmasi" },
];

export const LAPORAN_SUMBER_DANA_OPTIONS = [
  { value: "all", label: "Semua Sumber Dana" },
  { value: "rm", label: "RM" },
  { value: "blu", label: "BLU" },
  { value: "hibah", label: "Hibah" },
  { value: "apbn", label: "APBN" },
];

export type LaporanKpi = {
  label: string;
  value: string;
  trend: string;
  trendPositive: boolean;
  iconBg: string;
  icon: string;
};

export const LAPORAN_KEUANGAN_KPIS: LaporanKpi[] = [
  {
    label: "Total Pendapatan",
    value: "Rp 215,43 M",
    trend: "↑ 12,6% vs Jan–Des 2023",
    trendPositive: true,
    iconBg: "bg-emerald-600",
    icon: "📈",
  },
  {
    label: "Total Belanja",
    value: "Rp 167,89 M",
    trend: "↑ 9,8% vs Jan–Des 2023",
    trendPositive: false,
    iconBg: "bg-red-500",
    icon: "💸",
  },
  {
    label: "Surplus / Defisit",
    value: "Rp 47,54 M",
    trend: "↑ 15,3% vs Jan–Des 2023",
    trendPositive: true,
    iconBg: "bg-teal-600",
    icon: "⚖️",
  },
  {
    label: "Cashflow Bersih",
    value: "Rp 99,61 M",
    trend: "↑ 14,1% vs Jan–Des 2023",
    trendPositive: true,
    iconBg: "bg-blue-600",
    icon: "💰",
  },
  {
    label: "Piutang Aktif",
    value: "Rp 42,10 M",
    trend: "↓ 8,7% vs Jan–Des 2023",
    trendPositive: true,
    iconBg: "bg-violet-600",
    icon: "📋",
  },
  {
    label: "Hutang Berjalan",
    value: "Rp 58,30 M",
    trend: "↓ 5,2% vs Jan–Des 2023",
    trendPositive: true,
    iconBg: "bg-orange-500",
    icon: "📄",
  },
  {
    label: "Sisa Pagu",
    value: "Rp 31,20 M",
    trend: "↑ 10,4% vs Jan–Des 2023",
    trendPositive: true,
    iconBg: "bg-sky-600",
    icon: "🎯",
  },
  {
    label: "Outstanding Pembayaran",
    value: "Rp 18,40 M",
    trend: "↑ 12,0% vs Jan–Des 2023",
    trendPositive: false,
    iconBg: "bg-amber-500",
    icon: "⏳",
  },
];

export type LaporanTrendPoint = {
  month: string;
  pendapatan: number;
  belanja: number;
  cashflow: number;
};

export const LAPORAN_TREND_DATA: LaporanTrendPoint[] = [
  { month: "Jan", pendapatan: 14.2, belanja: 11.8, cashflow: 6.2 },
  { month: "Feb", pendapatan: 15.1, belanja: 12.1, cashflow: 6.8 },
  { month: "Mar", pendapatan: 16.3, belanja: 12.8, cashflow: 7.4 },
  { month: "Apr", pendapatan: 17.5, belanja: 13.2, cashflow: 8.1 },
  { month: "Mei", pendapatan: 18.2, belanja: 13.6, cashflow: 8.6 },
  { month: "Jun", pendapatan: 18.8, belanja: 14.0, cashflow: 9.0 },
  { month: "Jul", pendapatan: 17.6, belanja: 13.8, cashflow: 8.4 },
  { month: "Agu", pendapatan: 17.2, belanja: 13.5, cashflow: 8.2 },
  { month: "Sep", pendapatan: 16.8, belanja: 13.2, cashflow: 7.9 },
  { month: "Okt", pendapatan: 17.4, belanja: 13.6, cashflow: 8.3 },
  { month: "Nov", pendapatan: 18.0, belanja: 14.0, cashflow: 8.7 },
  { month: "Des", pendapatan: 19.2, belanja: 14.5, cashflow: 9.5 },
];

export const LAPORAN_PAGU = {
  pagu: 300.0,
  realisasi: 234.0,
  sisa: 66.0,
  pct: 78,
};

export type LaporanPendapatanComposition = {
  label: string;
  pct: number;
  color: string;
};

export const LAPORAN_PENDAPATAN_COMPOSITION: LaporanPendapatanComposition[] = [
  { label: "BPJS", pct: 45, color: "#2563eb" },
  { label: "Tunai", pct: 25, color: "#14b8a6" },
  { label: "Asuransi", pct: 20, color: "#f97316" },
  { label: "Kerjasama", pct: 10, color: "#8b5cf6" },
];

export type LaporanPendapatanSumber = {
  sumber: string;
  sumberKey: string;
  nilai: number;
  pct: number;
};

export const LAPORAN_PENDAPATAN_SUMBER: LaporanPendapatanSumber[] = [
  { sumber: "BPJS Kesehatan", sumberKey: "bpjs", nilai: 96.94, pct: 45.0 },
  { sumber: "Tunai / Pasien Umum", sumberKey: "tunai", nilai: 53.86, pct: 25.0 },
  { sumber: "Asuransi Swasta", sumberKey: "asuransi", nilai: 43.09, pct: 20.0 },
  { sumber: "Kerjasama Perusahaan", sumberKey: "kerjasama", nilai: 21.54, pct: 10.0 },
];

export type LaporanBelanjaJenis = {
  jenis: string;
  realisasi: number;
  pagu: number;
  sisa: number;
};

export const LAPORAN_BELANJA_JENIS: LaporanBelanjaJenis[] = [
  { jenis: "Belanja Pegawai", realisasi: 72.4, pagu: 92.0, sisa: 19.6 },
  { jenis: "Belanja Barang/Jasa", realisasi: 58.6, pagu: 78.0, sisa: 19.4 },
  { jenis: "Belanja Modal", realisasi: 24.8, pagu: 38.0, sisa: 13.2 },
  { jenis: "Bekkes", realisasi: 12.1, pagu: 18.0, sisa: 5.9 },
];

export type LaporanHutangPiutang = {
  kategori: string;
  nilai: number;
  statusKey: string;
};

export const LAPORAN_HUTANG_PIUTANG: LaporanHutangPiutang[] = [
  { kategori: "Piutang BPJS", nilai: 18.6, statusKey: "tinggi" },
  { kategori: "Piutang Umum", nilai: 12.4, statusKey: "sedang" },
  { kategori: "Hutang Vendor", nilai: 28.2, statusKey: "sedang" },
  { kategori: "Hutang Obat", nilai: 30.1, statusKey: "normal" },
];

export const LAPORAN_STATUS_BADGES: Record<string, { label: string; className: string }> = {
  tinggi: { label: "Tinggi", className: "bg-red-100 text-red-800" },
  sedang: { label: "Sedang", className: "bg-amber-100 text-amber-800" },
  normal: { label: "Normal", className: "bg-emerald-100 text-emerald-800" },
};

export const LAPORAN_CASHFLOW_INSIGHTS = [
  "Cashflow bersih positif sepanjang tahun dengan tren naik di Q4.",
  "Surplus operasional Rp 47,54 M menunjukkan efisiensi belanja yang baik.",
  "Rasio belanja terhadap pendapatan 77,9% — di bawah benchmark 80%.",
  "Puncak cashflow di Desember sejalan dengan peningkatan layanan akhir tahun.",
];

export const LAPORAN_ALERTS = [
  { text: "Piutang BPJS > 90 hari mencapai Rp 8,4 M", level: "warning" as const },
  { text: "Belanja Barang/Jasa mendekati 75% pagu", level: "warning" as const },
  { text: "Outstanding pembayaran naik 12% vs tahun lalu", level: "info" as const },
  { text: "Hutang vendor Inst. Farmasi jatuh tempo minggu ini", level: "critical" as const },
];

export function hasActiveLaporanFilters(filters: LaporanKeuanganFilters): boolean {
  return JSON.stringify(filters) !== JSON.stringify(DEFAULT_LAPORAN_KEUANGAN_FILTERS);
}

export function filterPendapatanSumber(
  rows: LaporanPendapatanSumber[],
  filters: LaporanKeuanganFilters
): LaporanPendapatanSumber[] {
  if (filters.sumberDana === "all") return rows;
  const map: Record<string, string> = {
    bpjs: "bpjs",
    blu: "tunai",
    hibah: "kerjasama",
    apbn: "bpjs",
  };
  const key = map[filters.sumberDana];
  return rows.filter((r) => r.sumberKey === key);
}
