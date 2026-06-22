export type KasBankFilters = {
  tahun: string;
  bulan: string;
  rekening: string;
  unit: string;
  jenisArus: string;
  statusRekon: string;
  periodeTren: string;
};

export const DEFAULT_KAS_BANK_FILTERS: KasBankFilters = {
  tahun: "2026",
  bulan: "all",
  rekening: "all",
  unit: "all",
  jenisArus: "all",
  statusRekon: "all",
  periodeTren: "12",
};

export const KAS_BANK_TAHUN_OPTIONS = [
  { value: "2026", label: "2026" },
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
];

export const KAS_BANK_BULAN_OPTIONS = [
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

export const KAS_BANK_REKENING_OPTIONS = [
  { value: "all", label: "Semua Rekening" },
  { value: "bri", label: "BRI Operasional" },
  { value: "mandiri", label: "Mandiri BLU" },
  { value: "bni", label: "BNI Payroll" },
  { value: "bca", label: "BCA Investasi" },
  { value: "kas", label: "Kas Tunai" },
];

export const KAS_BANK_UNIT_OPTIONS = [
  { value: "all", label: "Semua Unit" },
  { value: "rawat-jalan", label: "Rawat Jalan" },
  { value: "rawat-inap", label: "Rawat Inap" },
  { value: "igd", label: "IGD" },
  { value: "keuangan", label: "Bagian Keuangan" },
  { value: "sdm", label: "Bagian SDM" },
];

export const KAS_BANK_JENIS_ARUS_OPTIONS = [
  { value: "all", label: "Semua Arus" },
  { value: "masuk", label: "Kas Masuk" },
  { value: "keluar", label: "Kas Keluar" },
];

export const KAS_BANK_STATUS_REKON_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "sehat", label: "Sehat / Baik" },
  { value: "waspada", label: "Waspada" },
  { value: "perhatian", label: "Perlu Perhatian" },
];

export const KAS_BANK_PERIODE_TREN_OPTIONS = [
  { value: "12", label: "12 Bulan Terakhir" },
  { value: "6", label: "6 Bulan Terakhir" },
  { value: "3", label: "3 Bulan Terakhir" },
];

export type KasBankStatusBadge = {
  label: string;
  className: string;
};

export const KAS_BANK_STATUS_BADGES: Record<string, KasBankStatusBadge> = {
  sehat: { label: "Sehat", className: "bg-emerald-100 text-emerald-800" },
  baik: { label: "Baik", className: "bg-emerald-100 text-emerald-800" },
  waspada: { label: "Waspada", className: "bg-amber-100 text-amber-800" },
  perhatian: { label: "Perlu Perhatian", className: "bg-orange-100 text-orange-800" },
};

export type KasBankKpi = {
  label: string;
  value: string;
  trend: string;
  trendPositive: boolean;
  statusKey?: string;
  iconBg: string;
  icon: string;
};

export const KAS_BANK_KPIS: KasBankKpi[] = [
  {
    label: "Saldo Awal",
    value: "Rp 54,20 M",
    trend: "↑ 8,45% vs Apr 2025",
    trendPositive: true,
    iconBg: "bg-slate-600",
    icon: "🏦",
  },
  {
    label: "Kas Masuk",
    value: "Rp 128,40 M",
    trend: "↑ 12,35% vs Apr 2025",
    trendPositive: true,
    iconBg: "bg-emerald-600",
    icon: "📥",
  },
  {
    label: "Kas Keluar",
    value: "Rp 96,70 M",
    trend: "↓ 9,22% vs Apr 2025",
    trendPositive: true,
    iconBg: "bg-red-500",
    icon: "📤",
  },
  {
    label: "Saldo Akhir",
    value: "Rp 85,90 M",
    trend: "↑ 6,18% vs Apr 2025",
    trendPositive: true,
    iconBg: "bg-blue-600",
    icon: "💰",
  },
  {
    label: "Rekonsiliasi Bank",
    value: "96,8%",
    trend: "Target: 95%",
    trendPositive: true,
    statusKey: "baik",
    iconBg: "bg-teal-600",
    icon: "✅",
  },
  {
    label: "Transaksi Pending",
    value: "Rp 6,40 M",
    trend: "12 transaksi belum selesai",
    trendPositive: false,
    statusKey: "waspada",
    iconBg: "bg-amber-500",
    icon: "⏳",
  },
];

export type KasBankTrendPoint = {
  month: string;
  masuk: number;
  keluar: number;
  saldoAkhir: number;
};

export const KAS_BANK_TREND_DATA: KasBankTrendPoint[] = [
  { month: "Jun", masuk: 98.2, keluar: 82.4, saldoAkhir: 62.1 },
  { month: "Jul", masuk: 102.5, keluar: 86.1, saldoAkhir: 64.8 },
  { month: "Agu", masuk: 105.8, keluar: 88.6, saldoAkhir: 67.2 },
  { month: "Sep", masuk: 108.4, keluar: 90.2, saldoAkhir: 69.5 },
  { month: "Okt", masuk: 112.6, keluar: 91.8, saldoAkhir: 72.4 },
  { month: "Nov", masuk: 118.2, keluar: 93.5, saldoAkhir: 76.8 },
  { month: "Des", masuk: 122.4, keluar: 95.2, saldoAkhir: 79.6 },
  { month: "Jan", masuk: 115.8, keluar: 92.4, saldoAkhir: 78.2 },
  { month: "Feb", masuk: 120.6, keluar: 94.1, saldoAkhir: 80.4 },
  { month: "Mar", masuk: 124.2, keluar: 95.8, saldoAkhir: 82.6 },
  { month: "Apr", masuk: 126.8, keluar: 97.2, saldoAkhir: 84.2 },
  { month: "Mei", masuk: 128.4, keluar: 96.7, saldoAkhir: 85.9 },
];

export type KasBankCashInComposition = {
  label: string;
  pct: number;
  amount: number;
  color: string;
};

export const KAS_BANK_CASH_IN_COMPOSITION: KasBankCashInComposition[] = [
  { label: "BPJS", pct: 45.2, amount: 58.0, color: "#2563eb" },
  { label: "Tunai", pct: 25.1, amount: 32.2, color: "#14b8a6" },
  { label: "Asuransi", pct: 12.8, amount: 16.4, color: "#f97316" },
  { label: "Kerja Sama", pct: 9.6, amount: 12.3, color: "#8b5cf6" },
  { label: "Lainnya", pct: 7.3, amount: 9.5, color: "#94a3b8" },
];

export type KasBankExpenseType = {
  label: string;
  value: number;
};

export const KAS_BANK_EXPENSE_TYPES: KasBankExpenseType[] = [
  { label: "Belanja Barang", value: 32.4 },
  { label: "Belanja Pegawai", value: 28.6 },
  { label: "Belanja Jasa", value: 18.2 },
  { label: "Belanja Modal", value: 10.8 },
  { label: "Operasional", value: 6.7 },
];

export type KasBankAccountSummary = {
  rekening: string;
  rekeningKey: string;
  saldo: number;
  masuk: number;
  keluar: number;
  statusKey: string;
};

export const KAS_BANK_ACCOUNT_SUMMARY: KasBankAccountSummary[] = [
  { rekening: "BRI Operasional", rekeningKey: "bri", saldo: 32.4, masuk: 48.2, keluar: 36.1, statusKey: "sehat" },
  { rekening: "Mandiri BLU", rekeningKey: "mandiri", saldo: 28.6, masuk: 42.8, keluar: 31.4, statusKey: "sehat" },
  { rekening: "BNI Payroll", rekeningKey: "bni", saldo: 12.8, masuk: 18.4, keluar: 16.2, statusKey: "waspada" },
  { rekening: "BCA Investasi", rekeningKey: "bca", saldo: 8.4, masuk: 12.6, keluar: 9.2, statusKey: "sehat" },
  { rekening: "Kas Tunai", rekeningKey: "kas", saldo: 3.7, masuk: 6.4, keluar: 3.8, statusKey: "perhatian" },
];

export type KasBankRekonStatus = {
  rekening: string;
  rekeningKey: string;
  pct: number;
  statusKey: string;
};

export const KAS_BANK_REKON_STATUS: KasBankRekonStatus[] = [
  { rekening: "BRI Operasional", rekeningKey: "bri", pct: 98.2, statusKey: "sehat" },
  { rekening: "Mandiri BLU", rekeningKey: "mandiri", pct: 97.6, statusKey: "sehat" },
  { rekening: "BNI Payroll", rekeningKey: "bni", pct: 94.1, statusKey: "waspada" },
  { rekening: "BCA Investasi", rekeningKey: "bca", pct: 99.1, statusKey: "sehat" },
  { rekening: "Kas Tunai", rekeningKey: "kas", pct: 91.4, statusKey: "perhatian" },
];

export const KAS_BANK_REKON_OVERALL = 96.8;

export type KasBankAction = {
  text: string;
  priority: "tinggi" | "sedang" | "rendah";
};

export const KAS_BANK_ACTIONS: KasBankAction[] = [
  { text: "Rekonsiliasi BNI Payroll belum selesai — deadline 20 Jun", priority: "tinggi" },
  { text: "Kas tunai melebihi batas maksimum Rp 5 M", priority: "tinggi" },
  { text: "Pengeluaran belanja barang naik 18% vs bulan lalu", priority: "sedang" },
  { text: "Transfer antar rekening BRI → Mandiri perlu verifikasi", priority: "sedang" },
  { text: "Laporan arus kas bulanan siap di-review", priority: "rendah" },
];

export const KAS_BANK_PROJECTION = {
  estimasiMasuk: 42.8,
  estimasiKeluar: 38.6,
  saldoProyeksi: 90.1,
};

export type KasBankFlowRow = {
  rekening: string;
  rekeningKey: string;
  saldoAwal: number;
  kasMasuk: number;
  kasKeluar: number;
  saldoAkhir: number;
  rekonPct: number;
  pending: number;
  statusKey: string;
};

export const KAS_BANK_FLOW_ROWS: KasBankFlowRow[] = [
  { rekening: "BRI Operasional", rekeningKey: "bri", saldoAwal: 28.6, kasMasuk: 48.2, kasKeluar: 36.1, saldoAkhir: 32.4, rekonPct: 98.2, pending: 1.2, statusKey: "sehat" },
  { rekening: "Mandiri BLU", rekeningKey: "mandiri", saldoAwal: 24.2, kasMasuk: 42.8, kasKeluar: 31.4, saldoAkhir: 28.6, rekonPct: 97.6, pending: 0.8, statusKey: "sehat" },
  { rekening: "BNI Payroll", rekeningKey: "bni", saldoAwal: 10.6, kasMasuk: 18.4, kasKeluar: 16.2, saldoAkhir: 12.8, rekonPct: 94.1, pending: 2.4, statusKey: "waspada" },
  { rekening: "BCA Investasi", rekeningKey: "bca", saldoAwal: 6.8, kasMasuk: 12.6, kasKeluar: 9.2, saldoAkhir: 8.4, rekonPct: 99.1, pending: 0.4, statusKey: "sehat" },
  { rekening: "Kas Tunai", rekeningKey: "kas", saldoAwal: 2.4, kasMasuk: 6.4, kasKeluar: 3.8, saldoAkhir: 3.7, rekonPct: 91.4, pending: 1.6, statusKey: "perhatian" },
];

export function hasActiveKasBankFilters(filters: KasBankFilters): boolean {
  return JSON.stringify(filters) !== JSON.stringify(DEFAULT_KAS_BANK_FILTERS);
}

export function getKasBankTrendData(periode: string): KasBankTrendPoint[] {
  const months = parseInt(periode, 10) || 12;
  return KAS_BANK_TREND_DATA.slice(-months);
}

export function filterKasBankFlowRows(
  rows: KasBankFlowRow[],
  filters: KasBankFilters
): KasBankFlowRow[] {
  return rows.filter((row) => {
    if (filters.rekening !== "all" && row.rekeningKey !== filters.rekening) return false;
    if (filters.statusRekon !== "all" && row.statusKey !== filters.statusRekon) return false;
    return true;
  });
}

export function filterKasBankAccounts<T extends { rekeningKey: string; statusKey: string }>(
  rows: T[],
  filters: KasBankFilters
): T[] {
  return rows.filter((row) => {
    if (filters.rekening !== "all" && row.rekeningKey !== filters.rekening) return false;
    if (filters.statusRekon !== "all" && row.statusKey !== filters.statusRekon) return false;
    return true;
  });
}
