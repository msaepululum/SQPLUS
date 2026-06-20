export type PiutangFilters = {
  tahun: string;
  bulan: string;
  jenisPiutang: string;
  unitLayanan: string;
  status: string;
  umurPiutang: string;
  periodeTren: string;
};

export const DEFAULT_PIUTANG_FILTERS: PiutangFilters = {
  tahun: "2025",
  bulan: "all",
  jenisPiutang: "all",
  unitLayanan: "all",
  status: "all",
  umurPiutang: "all",
  periodeTren: "12",
};

export const PIUTANG_TAHUN_OPTIONS = [
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
];

export const PIUTANG_BULAN_OPTIONS = [
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

export const PIUTANG_JENIS_OPTIONS = [
  { value: "all", label: "Semua Jenis" },
  { value: "bpjs", label: "BPJS" },
  { value: "tunai", label: "Tunai / Pasien" },
  { value: "asuransi", label: "Asuransi" },
  { value: "kerja-sama", label: "Kerja Sama Perusahaan" },
  { value: "lainnya", label: "Lainnya" },
];

export const PIUTANG_UNIT_OPTIONS = [
  { value: "all", label: "Semua Unit" },
  { value: "rawat-jalan", label: "Rawat Jalan" },
  { value: "rawat-inap", label: "Rawat Inap" },
  { value: "igd", label: "IGD" },
  { value: "penunjang", label: "Penunjang" },
  { value: "farmasi", label: "Farmasi" },
];

export const PIUTANG_STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "sehat", label: "Sehat" },
  { value: "perhatian", label: "Perlu Diperhatikan" },
  { value: "waspada", label: "Waspada" },
  { value: "berisiko", label: "Berisiko" },
  { value: "berisiko-tinggi", label: "Berisiko Tinggi" },
];

export const PIUTANG_UMUR_OPTIONS = [
  { value: "all", label: "Semua Umur" },
  { value: "0-30", label: "0–30 hari" },
  { value: "31-60", label: "31–60 hari" },
  { value: "61-90", label: "61–90 hari" },
  { value: "91-180", label: "91–180 hari" },
  { value: "180+", label: ">180 hari" },
];

export const PIUTANG_PERIODE_TREN_OPTIONS = [
  { value: "12", label: "12 Bulan Terakhir" },
  { value: "6", label: "6 Bulan Terakhir" },
  { value: "3", label: "3 Bulan Terakhir" },
];

export type PiutangStatusBadge = {
  label: string;
  className: string;
};

export const PIUTANG_STATUS_BADGES: Record<string, PiutangStatusBadge> = {
  sehat: { label: "Sehat", className: "bg-emerald-100 text-emerald-800" },
  baik: { label: "Baik", className: "bg-emerald-100 text-emerald-800" },
  perhatian: { label: "Perlu Diperhatikan", className: "bg-amber-100 text-amber-800" },
  waspada: { label: "Waspada", className: "bg-yellow-100 text-yellow-800" },
  berisiko: { label: "Berisiko", className: "bg-orange-100 text-orange-800" },
  "berisiko-tinggi": { label: "Berisiko Tinggi", className: "bg-red-100 text-red-800" },
};

export type PiutangKpi = {
  label: string;
  value: string;
  trend: string;
  trendPositive: boolean;
  statusKey: string;
  iconBg: string;
  icon: string;
};

export const PIUTANG_KPIS: PiutangKpi[] = [
  {
    label: "Total Piutang",
    value: "Rp 102,80 M",
    trend: "↑ 12,45% vs Apr 2025",
    trendPositive: false,
    statusKey: "perhatian",
    iconBg: "bg-violet-600",
    icon: "💼",
  },
  {
    label: "Piutang BPJS",
    value: "Rp 42,60 M",
    trend: "↑ 8,92% vs Apr 2025",
    trendPositive: false,
    statusKey: "sehat",
    iconBg: "bg-blue-600",
    icon: "🛡️",
  },
  {
    label: "Piutang Tunai / Pasien",
    value: "Rp 28,40 M",
    trend: "↑ 15,34% vs Apr 2025",
    trendPositive: false,
    statusKey: "perhatian",
    iconBg: "bg-teal-600",
    icon: "👤",
  },
  {
    label: "Piutang Asuransi / Kerja Sama",
    value: "Rp 22,10 M",
    trend: "↑ 10,21% vs Apr 2025",
    trendPositive: false,
    statusKey: "sehat",
    iconBg: "bg-sky-600",
    icon: "🤝",
  },
  {
    label: "Piutang Jatuh Tempo",
    value: "Rp 18,40 M",
    trend: "↑ 18,76% vs Apr 2025",
    trendPositive: false,
    statusKey: "berisiko-tinggi",
    iconBg: "bg-red-500",
    icon: "📅",
  },
  {
    label: "Rasio Penagihan",
    value: "78,60%",
    trend: "↑ 4,21 p.p vs Apr 2025",
    trendPositive: true,
    statusKey: "baik",
    iconBg: "bg-emerald-600",
    icon: "📊",
  },
];

export type PiutangTrendPoint = {
  month: string;
  total: number;
  penagihan: number;
};

export const PIUTANG_TREND_DATA: PiutangTrendPoint[] = [
  { month: "Jun", total: 72.4, penagihan: 54.2 },
  { month: "Jul", total: 75.8, penagihan: 57.1 },
  { month: "Agu", total: 78.2, penagihan: 59.4 },
  { month: "Sep", total: 81.5, penagihan: 62.8 },
  { month: "Okt", total: 84.3, penagihan: 65.2 },
  { month: "Nov", total: 88.6, penagihan: 68.9 },
  { month: "Des", total: 91.2, penagihan: 71.4 },
  { month: "Jan", total: 93.8, penagihan: 73.6 },
  { month: "Feb", total: 96.4, penagihan: 75.8 },
  { month: "Mar", total: 98.2, penagihan: 77.2 },
  { month: "Apr", total: 100.5, penagihan: 78.9 },
  { month: "Mei", total: 102.8, penagihan: 80.8 },
];

export type PiutangComposition = {
  label: string;
  pct: number;
  amount: number;
  color: string;
};

export const PIUTANG_COMPOSITION: PiutangComposition[] = [
  { label: "BPJS", pct: 41.4, amount: 42.6, color: "#2563eb" },
  { label: "Tunai / Pasien", pct: 27.6, amount: 28.4, color: "#14b8a6" },
  { label: "Asuransi / Kerja Sama", pct: 21.5, amount: 22.1, color: "#f97316" },
  { label: "Kerja Sama Perusahaan", pct: 6.8, amount: 7.0, color: "#8b5cf6" },
  { label: "Lainnya", pct: 2.7, amount: 2.7, color: "#94a3b8" },
];

export type PiutangServiceRow = {
  label: string;
  value: number;
  pct: number;
};

export const PIUTANG_SERVICE_ROWS: PiutangServiceRow[] = [
  { label: "Rawat Jalan", value: 38.2, pct: 37.2 },
  { label: "Rawat Inap", value: 32.6, pct: 31.7 },
  { label: "IGD", value: 12.4, pct: 12.1 },
  { label: "Penunjang", value: 11.8, pct: 11.5 },
  { label: "Farmasi", value: 7.8, pct: 7.6 },
];

export type PiutangAgingBucket = {
  label: string;
  amount: number;
  pct: number;
  statusKey: string;
  trend: string;
};

export const PIUTANG_AGING_BUCKETS: PiutangAgingBucket[] = [
  { label: "0–30 hari", amount: 46.1, pct: 44.8, statusKey: "sehat", trend: "↑ 2,1%" },
  { label: "31–60 hari", amount: 21.3, pct: 20.7, statusKey: "waspada", trend: "↑ 3,4%" },
  { label: "61–90 hari", amount: 13.2, pct: 12.8, statusKey: "perhatian", trend: "↑ 1,8%" },
  { label: "91–180 hari", amount: 12.5, pct: 12.2, statusKey: "berisiko", trend: "↑ 4,2%" },
  { label: ">180 hari", amount: 9.7, pct: 9.5, statusKey: "berisiko-tinggi", trend: "↑ 6,1%" },
];

export type PiutangSummaryRow = {
  jenis: string;
  icon: string;
  outstanding: number;
  tertagih: number;
  belumTertagih: number;
  jatuhTempo: number;
  avgUmur: number;
  statusKey: string;
  jenisKey: string;
};

export const PIUTANG_SUMMARY_ROWS: PiutangSummaryRow[] = [
  {
    jenis: "BPJS Kesehatan",
    icon: "🛡️",
    jenisKey: "bpjs",
    outstanding: 42.6,
    tertagih: 33.4,
    belumTertagih: 9.2,
    jatuhTempo: 6.8,
    avgUmur: 38,
    statusKey: "sehat",
  },
  {
    jenis: "Pasien Umum (Tunai)",
    icon: "👤",
    jenisKey: "tunai",
    outstanding: 28.4,
    tertagih: 20.1,
    belumTertagih: 8.3,
    jatuhTempo: 5.6,
    avgUmur: 52,
    statusKey: "perhatian",
  },
  {
    jenis: "Asuransi Swasta",
    icon: "🏢",
    jenisKey: "asuransi",
    outstanding: 15.1,
    tertagih: 12.8,
    belumTertagih: 2.3,
    jatuhTempo: 1.4,
    avgUmur: 45,
    statusKey: "sehat",
  },
  {
    jenis: "Kerja Sama Perusahaan",
    icon: "🤝",
    jenisKey: "kerja-sama",
    outstanding: 7.0,
    tertagih: 5.2,
    belumTertagih: 1.8,
    jatuhTempo: 1.2,
    avgUmur: 61,
    statusKey: "waspada",
  },
  {
    jenis: "Instansi Pemerintah",
    icon: "🏛️",
    jenisKey: "asuransi",
    outstanding: 5.4,
    tertagih: 3.8,
    belumTertagih: 1.6,
    jatuhTempo: 1.0,
    avgUmur: 72,
    statusKey: "berisiko",
  },
  {
    jenis: "Lainnya",
    icon: "📋",
    jenisKey: "lainnya",
    outstanding: 4.3,
    tertagih: 3.1,
    belumTertagih: 1.2,
    jatuhTempo: 2.4,
    avgUmur: 95,
    statusKey: "berisiko-tinggi",
  },
];

export type PiutangTopPayor = {
  name: string;
  amount: string;
};

export const PIUTANG_TOP_PAYORS: PiutangTopPayor[] = [
  { name: "BPJS Kesehatan", amount: "Rp 42,6 M" },
  { name: "Pasien Umum", amount: "Rp 28,4 M" },
  { name: "Allianz Indonesia", amount: "Rp 8,2 M" },
  { name: "Prudential", amount: "Rp 6,9 M" },
  { name: "PT Telkom Indonesia", amount: "Rp 4,1 M" },
];

export type PiutangTopUnit = {
  name: string;
  amount: string;
};

export const PIUTANG_TOP_UNITS: PiutangTopUnit[] = [
  { name: "Poli Orthopedi", amount: "Rp 14,8 M" },
  { name: "Poli Penyakit Dalam", amount: "Rp 12,6 M" },
  { name: "Inst. Rawat Inap", amount: "Rp 11,2 M" },
  { name: "Inst. Rawat Jalan", amount: "Rp 9,8 M" },
  { name: "Inst. Gawat Darurat", amount: "Rp 7,4 M" },
];

export type PiutangAction = {
  text: string;
  priority: "tinggi" | "sedang" | "rendah";
};

export const PIUTANG_ACTIONS: PiutangAction[] = [
  { text: "Piutang BPJS perlu follow-up klaim bulan April", priority: "tinggi" },
  { text: "12 tagihan pasien umum jatuh tempo minggu ini", priority: "tinggi" },
  { text: "Review piutang asuransi >90 hari", priority: "sedang" },
  { text: "Kirim reminder ke PT Telkom untuk tagihan Q1", priority: "sedang" },
  { text: "Rekonsiliasi piutang farmasi bulan Mei", priority: "rendah" },
];

export function hasActivePiutangFilters(filters: PiutangFilters): boolean {
  return JSON.stringify(filters) !== JSON.stringify(DEFAULT_PIUTANG_FILTERS);
}

export function filterPiutangSummary(
  rows: PiutangSummaryRow[],
  filters: PiutangFilters
): PiutangSummaryRow[] {
  return rows.filter((row) => {
    if (filters.jenisPiutang !== "all" && row.jenisKey !== filters.jenisPiutang) return false;
    if (filters.status !== "all" && row.statusKey !== filters.status) return false;
    return true;
  });
}

export function getPiutangTrendData(periode: string): PiutangTrendPoint[] {
  const months = parseInt(periode, 10) || 12;
  return PIUTANG_TREND_DATA.slice(-months);
}
