export type BelanjaFilters = {
  tahun: string;
  bulan: string;
  unitKerja: string;
  sumberDana: string;
  kategoriBelanja: string;
  status: string;
};

export const DEFAULT_BELANJA_FILTERS: BelanjaFilters = {
  tahun: "2025",
  bulan: "all",
  unitKerja: "all",
  sumberDana: "all",
  kategoriBelanja: "all",
  status: "all",
};

export const BELANJA_TAHUN_OPTIONS = [
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
];

export const BELANJA_BULAN_OPTIONS = [
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

export const BELANJA_UNIT_OPTIONS = [
  { value: "all", label: "Semua Unit" },
  { value: "rawat-inap", label: "Instalasi Rawat Inap" },
  { value: "rawat-jalan", label: "Instalasi Rawat Jalan" },
  { value: "igd", label: "Instalasi Gawat Darurat" },
  { value: "penunjang", label: "Instalasi Penunjang" },
  { value: "farmasi", label: "Instalasi Farmasi" },
  { value: "sdm", label: "Bagian SDM" },
  { value: "keuangan", label: "Bagian Keuangan" },
];

export const BELANJA_SUMBER_DANA_OPTIONS = [
  { value: "all", label: "Semua Sumber" },
  { value: "rm", label: "RM" },
  { value: "blu", label: "BLU" },
  { value: "hibah", label: "Hibah" },
  { value: "lainnya", label: "Lainnya" },
];

export const BELANJA_KATEGORI_OPTIONS = [
  { value: "all", label: "Semua Kategori" },
  { value: "pegawai", label: "Belanja Pegawai" },
  { value: "barang", label: "Belanja Barang" },
  { value: "jasa", label: "Belanja Jasa" },
  { value: "modal", label: "Belanja Modal" },
  { value: "pemeliharaan", label: "Pemeliharaan" },
  { value: "bekkes", label: "Bekkes" },
];

export const BELANJA_STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "draft", label: "Draft" },
  { value: "diajukan", label: "Diajukan" },
  { value: "diverifikasi", label: "Diverifikasi" },
  { value: "disetujui", label: "Disetujui" },
  { value: "menunggu-pembayaran", label: "Menunggu Pembayaran" },
  { value: "selesai", label: "Selesai" },
  { value: "ditolak", label: "Ditolak" },
];

export type BelanjaKpi = {
  label: string;
  value: string;
  trend: string;
  trendPositive: boolean;
  iconBg: string;
  icon: string;
};

export const BELANJA_KPIS: BelanjaKpi[] = [
  {
    label: "Total Pagu Belanja",
    value: "Rp 245,80 M",
    trend: "Anggaran tahun 2025",
    trendPositive: true,
    iconBg: "bg-blue-600",
    icon: "📋",
  },
  {
    label: "Realisasi Belanja",
    value: "Rp 108,76 M",
    trend: "↑ 12,45% vs Apr 2025",
    trendPositive: true,
    iconBg: "bg-teal-600",
    icon: "💸",
  },
  {
    label: "Sisa Pagu",
    value: "Rp 137,04 M",
    trend: "↓ 3,12% vs Apr 2025",
    trendPositive: true,
    iconBg: "bg-emerald-600",
    icon: "💰",
  },
  {
    label: "Komitmen Belanja",
    value: "Rp 89,34 M",
    trend: "↑ 8,21% vs Apr 2025",
    trendPositive: false,
    iconBg: "bg-violet-600",
    icon: "📝",
  },
  {
    label: "Menunggu Pembayaran",
    value: "Rp 32,18 M",
    trend: "↑ 6,77% vs Apr 2025",
    trendPositive: false,
    iconBg: "bg-amber-500",
    icon: "⏳",
  },
  {
    label: "Persentase Daya Serap",
    value: "44,28%",
    trend: "↑ 4,21 poin vs Apr 2025",
    trendPositive: true,
    iconBg: "bg-sky-600",
    icon: "📊",
  },
  {
    label: "Forecast Akhir Tahun",
    value: "Rp 258,66 M",
    trend: "↑ 5,25% vs Pagu",
    trendPositive: false,
    iconBg: "bg-orange-500",
    icon: "🔮",
  },
  {
    label: "Outstanding SPJ / Tagihan",
    value: "Rp 16,72 M",
    trend: "↑ 4,11% vs Apr 2025",
    trendPositive: false,
    iconBg: "bg-rose-500",
    icon: "📄",
  },
];

export type BelanjaTrendPoint = {
  month: string;
  pagu: number;
  realisasi: number;
  komitmen: number;
};

export const BELANJA_TREND_DATA: BelanjaTrendPoint[] = [
  { month: "Jan", pagu: 20.48, realisasi: 17.13, komitmen: 14.2 },
  { month: "Feb", pagu: 20.48, realisasi: 17.22, komitmen: 14.8 },
  { month: "Mar", pagu: 20.48, realisasi: 18.63, komitmen: 15.6 },
  { month: "Apr", pagu: 20.48, realisasi: 19.75, komitmen: 16.4 },
  { month: "Mei", pagu: 20.48, realisasi: 20.2, komitmen: 17.1 },
  { month: "Jun", pagu: 20.48, realisasi: 0, komitmen: 0 },
  { month: "Jul", pagu: 20.48, realisasi: 0, komitmen: 0 },
  { month: "Agu", pagu: 20.48, realisasi: 0, komitmen: 0 },
  { month: "Sep", pagu: 20.48, realisasi: 0, komitmen: 0 },
  { month: "Okt", pagu: 20.48, realisasi: 0, komitmen: 0 },
  { month: "Nov", pagu: 20.48, realisasi: 0, komitmen: 0 },
  { month: "Des", pagu: 20.48, realisasi: 0, komitmen: 0 },
];

export type BelanjaSourceStack = {
  month: string;
  rm: number;
  blu: number;
  hibah: number;
  lainnya: number;
};

export const BELANJA_SOURCE_STACK: BelanjaSourceStack[] = [
  { month: "Jan", rm: 8.2, blu: 5.4, hibah: 2.1, lainnya: 1.43 },
  { month: "Feb", rm: 8.3, blu: 5.5, hibah: 2.0, lainnya: 1.42 },
  { month: "Mar", rm: 9.0, blu: 5.9, hibah: 2.2, lainnya: 1.53 },
  { month: "Apr", rm: 9.5, blu: 6.2, hibah: 2.3, lainnya: 1.75 },
  { month: "Mei", rm: 9.8, blu: 6.4, hibah: 2.4, lainnya: 1.6 },
  { month: "Jun", rm: 0, blu: 0, hibah: 0, lainnya: 0 },
  { month: "Jul", rm: 0, blu: 0, hibah: 0, lainnya: 0 },
  { month: "Agu", rm: 0, blu: 0, hibah: 0, lainnya: 0 },
  { month: "Sep", rm: 0, blu: 0, hibah: 0, lainnya: 0 },
  { month: "Okt", rm: 0, blu: 0, hibah: 0, lainnya: 0 },
  { month: "Nov", rm: 0, blu: 0, hibah: 0, lainnya: 0 },
  { month: "Des", rm: 0, blu: 0, hibah: 0, lainnya: 0 },
];

export const BELANJA_SOURCE_COLORS = {
  rm: "#2563eb",
  blu: "#14b8a6",
  hibah: "#f97316",
  lainnya: "#94a3b8",
} as const;

export type BelanjaCategoryComposition = {
  label: string;
  pct: number;
  amount: number;
  color: string;
};

export const BELANJA_CATEGORY_COMPOSITION: BelanjaCategoryComposition[] = [
  { label: "Belanja Pegawai", pct: 42.15, amount: 45.84, color: "#2563eb" },
  { label: "Belanja Barang", pct: 24.38, amount: 26.52, color: "#14b8a6" },
  { label: "Belanja Jasa", pct: 17.62, amount: 19.16, color: "#f97316" },
  { label: "Belanja Modal", pct: 8.74, amount: 9.5, color: "#8b5cf6" },
  { label: "Pemeliharaan", pct: 4.21, amount: 4.58, color: "#eab308" },
  { label: "Bekkes", pct: 2.9, amount: 3.16, color: "#64748b" },
];

export type BelanjaUnitRow = {
  label: string;
  value: number;
};

export const BELANJA_UNIT_REALISASI: BelanjaUnitRow[] = [
  { label: "Instalasi Rawat Inap", value: 28.4 },
  { label: "Instalasi Rawat Jalan", value: 22.1 },
  { label: "Instalasi Gawat Darurat", value: 12.6 },
  { label: "Instalasi Penunjang", value: 18.3 },
  { label: "Instalasi Farmasi", value: 15.8 },
  { label: "Bagian SDM", value: 6.2 },
  { label: "Bagian Keuangan", value: 4.86 },
];

export type BelanjaKodeRow = {
  kode: string;
  nama: string;
  pagu: number;
  realisasi: number;
  sisa: number;
  serap: number;
};

export const BELANJA_KODE_SUMMARY: BelanjaKodeRow[] = [
  { kode: "5.1.01", nama: "Gaji & Tunjangan", pagu: 62.5, realisasi: 28.4, sisa: 34.1, serap: 45.44 },
  { kode: "5.1.02", nama: "Honorarium", pagu: 18.2, realisasi: 8.6, sisa: 9.6, serap: 47.25 },
  { kode: "5.2.01", nama: "Belanja Barang Medis", pagu: 45.8, realisasi: 19.2, sisa: 26.6, serap: 41.92 },
  { kode: "5.2.02", nama: "Belanja Barang Non-Medis", pagu: 22.4, realisasi: 7.3, sisa: 15.1, serap: 32.59 },
  { kode: "5.3.01", nama: "Belanja Jasa Pihak Ketiga", pagu: 32.6, realisasi: 14.8, sisa: 17.8, serap: 45.4 },
  { kode: "5.4.01", nama: "Belanja Modal", pagu: 28.0, realisasi: 9.5, sisa: 18.5, serap: 33.93 },
];

export type BelanjaProcessStatus = {
  label: string;
  count: number;
  color: string;
};

export const BELANJA_PROCESS_STATUS: BelanjaProcessStatus[] = [
  { label: "Draft", count: 68, color: "bg-slate-400" },
  { label: "Diajukan", count: 74, color: "bg-sky-500" },
  { label: "Diverifikasi", count: 112, color: "bg-violet-500" },
  { label: "Disetujui", count: 156, color: "bg-blue-500" },
  { label: "Menunggu Pembayaran", count: 78, color: "bg-amber-500" },
  { label: "Selesai", count: 542, color: "bg-emerald-500" },
  { label: "Ditolak", count: 27, color: "bg-red-500" },
];

export type BelanjaTransaction = {
  noDokumen: string;
  unit: string;
  kategori: string;
  sumberDana: string;
  nominal: string;
  status: string;
  statusColor: string;
  tanggal: string;
  pic: string;
};

export const BELANJA_TRANSACTIONS: BelanjaTransaction[] = [
  {
    noDokumen: "BLJ/2025/05/1842",
    unit: "Inst. Rawat Inap",
    kategori: "Belanja Barang",
    sumberDana: "RM",
    nominal: "Rp 245,6 jt",
    status: "Menunggu Pembayaran",
    statusColor: "bg-amber-100 text-amber-800",
    tanggal: "19 Jun 2025",
    pic: "Budi Santoso",
  },
  {
    noDokumen: "BLJ/2025/05/1839",
    unit: "Inst. Rawat Jalan",
    kategori: "Belanja Jasa",
    sumberDana: "BLU",
    nominal: "Rp 128,4 jt",
    status: "Disetujui",
    statusColor: "bg-blue-100 text-blue-800",
    tanggal: "18 Jun 2025",
    pic: "Siti Rahayu",
  },
  {
    noDokumen: "BLJ/2025/05/1835",
    unit: "Bagian SDM",
    kategori: "Belanja Pegawai",
    sumberDana: "RM",
    nominal: "Rp 892,1 jt",
    status: "Diverifikasi",
    statusColor: "bg-violet-100 text-violet-800",
    tanggal: "17 Jun 2025",
    pic: "Andi Wijaya",
  },
  {
    noDokumen: "BLJ/2025/05/1830",
    unit: "Inst. Farmasi",
    kategori: "Belanja Barang",
    sumberDana: "BLU",
    nominal: "Rp 356,8 jt",
    status: "Selesai",
    statusColor: "bg-emerald-100 text-emerald-800",
    tanggal: "16 Jun 2025",
    pic: "Maya Lestari",
  },
  {
    noDokumen: "BLJ/2025/05/1826",
    unit: "Inst. Penunjang",
    kategori: "Belanja Modal",
    sumberDana: "Hibah",
    nominal: "Rp 512,3 jt",
    status: "Menunggu Pembayaran",
    statusColor: "bg-amber-100 text-amber-800",
    tanggal: "15 Jun 2025",
    pic: "Hendra Pratama",
  },
];

export type BelanjaPendingItem = {
  noDokumen: string;
  unit: string;
  nominal: string;
};

export const BELANJA_TOP_PENDING: BelanjaPendingItem[] = [
  { noDokumen: "BLJ/2025/05/1826", unit: "Inst. Penunjang", nominal: "Rp 512,3 jt" },
  { noDokumen: "BLJ/2025/05/1835", unit: "Bagian SDM", nominal: "Rp 892,1 jt" },
  { noDokumen: "BLJ/2025/05/1842", unit: "Inst. Rawat Inap", nominal: "Rp 245,6 jt" },
  { noDokumen: "BLJ/2025/05/1818", unit: "Inst. Rawat Jalan", nominal: "Rp 198,4 jt" },
  { noDokumen: "BLJ/2025/05/1812", unit: "Inst. Gawat Darurat", nominal: "Rp 156,7 jt" },
];

export const BELANJA_INSIGHTS = [
  "Instalasi Rawat Inap memiliki daya serap tertinggi (26,1% dari total realisasi).",
  "Belanja Pegawai mendominasi komposisi (42,15%) — sesuai karakteristik rumah sakit.",
  "78 dokumen menunggu pembayaran senilai Rp 32,18 M perlu diprioritaskan.",
  "Forecast akhir tahun Rp 258,66 M melebihi pagu 5,25% — perlu evaluasi revisi pagu.",
  "Belanja Barang Medis daya serap 41,92% — masih di bawah rata-rata instansi sejenis.",
];

export const BELANJA_BOTTOM_KPIS = [
  {
    label: "Belanja per Jenis (YTD)",
    items: [
      { name: "Pegawai", value: "Rp 45,84 M" },
      { name: "Barang", value: "Rp 26,52 M" },
      { name: "Jasa", value: "Rp 19,16 M" },
      { name: "Modal", value: "Rp 9,50 M" },
    ],
  },
  {
    label: "Rata-rata Realisasi per Bulan",
    value: "Rp 21,75 M",
    sub: "Jan – Mei 2025",
  },
  {
    label: "Rata-rata Siklus Pembayaran",
    value: "14,6 hari",
    sub: "Dari disetujui → selesai",
  },
  {
    label: "Varians Anggaran (Forecast vs Pagu)",
    value: "Rp 12,86 M",
    sub: "5,25% di atas pagu",
  },
];

export function hasActiveBelanjaFilters(filters: BelanjaFilters): boolean {
  return JSON.stringify(filters) !== JSON.stringify(DEFAULT_BELANJA_FILTERS);
}

export function filterBelanjaTransactions(
  rows: BelanjaTransaction[],
  filters: BelanjaFilters
): BelanjaTransaction[] {
  return rows.filter((row) => {
    if (filters.status !== "all") {
      const statusMap: Record<string, string> = {
        draft: "Draft",
        diajukan: "Diajukan",
        diverifikasi: "Diverifikasi",
        disetujui: "Disetujui",
        "menunggu-pembayaran": "Menunggu Pembayaran",
        selesai: "Selesai",
        ditolak: "Ditolak",
      };
      if (row.status !== statusMap[filters.status]) return false;
    }
    if (filters.sumberDana !== "all") {
      const danaMap: Record<string, string> = {
        rm: "RM",
        blu: "BLU",
        hibah: "Hibah",
        lainnya: "Lainnya",
      };
      if (row.sumberDana !== danaMap[filters.sumberDana]) return false;
    }
    if (filters.kategoriBelanja !== "all") {
      const katMap: Record<string, string> = {
        pegawai: "Belanja Pegawai",
        barang: "Belanja Barang",
        jasa: "Belanja Jasa",
        modal: "Belanja Modal",
      };
      if (row.kategori !== katMap[filters.kategoriBelanja]) return false;
    }
    return true;
  });
}
