import {
  Banknote,
  Building2,
  CircleDollarSign,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type TrendDir = "up" | "down" | "neutral";

export type KpiItem = {
  label: string;
  value: string;
  trend?: string;
  trendDir?: TrendDir;
  subValue?: string;
  progress?: number;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
};

export const BERANDA_KPIS: KpiItem[] = [
  {
    label: "Total Pendapatan",
    value: "Rp 48,62 M",
    trend: "12,4% vs Apr 2025",
    trendDir: "up",
    icon: CircleDollarSign,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    label: "Realisasi Belanja",
    value: "78,6%",
    subValue: "Rp 37,92 M dari Rp 48,26 M",
    progress: 78.6,
    icon: Wallet,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    label: "Sisa Cashflow",
    value: "Rp 10,70 M",
    trend: "8,3% vs Apr 2025",
    trendDir: "up",
    icon: Banknote,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    label: "Total Pegawai",
    value: "1.245",
    trend: "2 orang vs Apr 2025",
    trendDir: "up",
    icon: Users,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    label: "Aset Aktif",
    value: "2.382",
    trend: "0 vs Apr 2025",
    trendDir: "neutral",
    icon: Building2,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
  },
  {
    label: "Nilai Aset",
    value: "Rp 352,45 M",
    trend: "6,7% vs Apr 2025",
    trendDir: "up",
    icon: CircleDollarSign,
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
  },
];

export const REVENUE_TREND = {
  months: ["Dec 2024", "Jan 2025", "Feb 2025", "Mar 2025", "Apr 2025", "May 2025"],
  revenue: [42, 44, 45, 46, 43, 48.62],
  expense: [36, 37, 38, 39, 37.5, 37.92],
};

export const FINANCE_MINI = [
  { label: "Pendapatan BPJS", value: "Rp 27,18 M", trend: "9,5%", dir: "up" as TrendDir },
  { label: "Pendapatan Tunai", value: "Rp 12,34 M", trend: "15,1%", dir: "up" as TrendDir },
  { label: "Menunggu Pembayaran", value: "Rp 6,25 M", trend: "3,7%", dir: "down" as TrendDir },
  { label: "Cash Position", value: "Rp 16,42 M", trend: "8,3%", dir: "up" as TrendDir },
];

export const BELANJA_ROWS = [
  { label: "Belanja Modal", value: "Rp 8,42 M", pct: 65.1 },
  { label: "Belanja Barang/Jasa", value: "Rp 18,76 M", pct: 81.2 },
  { label: "Belanja Pegawai", value: "Rp 10,74 M", pct: 87.3 },
];

export const EMPLOYEE_COMPOSITION = [
  { label: "Dokter", pct: 15, color: "#8B5CF6" },
  { label: "Perawat", pct: 42, color: "#3B82F6" },
  { label: "Nakes Lain", pct: 23, color: "#14B8A6" },
  { label: "Non-Medis", pct: 20, color: "#F59E0B" },
];

export const HR_STATS = [
  { label: "Pegawai Aktif", value: "1.205", trend: "1,2%", dir: "up" as TrendDir },
  { label: "Kehadiran Hari Ini", value: "92,4%", trend: "0,8%", dir: "up" as TrendDir },
  { label: "Cuti Berjalan", value: "38", trend: "5", dir: "down" as TrendDir },
  { label: "Lembur Bulan Ini", value: "1.126 jam", trend: "12%", dir: "up" as TrendDir },
];

export const ATTENDANCE_TREND = {
  months: ["Dec", "Jan", "Feb", "Mar", "Apr", "May"],
  kehadiran: [91, 92, 91.5, 93, 92.2, 92.4],
  absensi: [89, 90, 89.5, 91, 90.5, 91.2],
};

export const HR_UNITS = [
  { unit: "IGD", count: 186, pct: 14.9 },
  { unit: "Rawat Inap", count: 312, pct: 25.1 },
  { unit: "Rawat Jalan", count: 278, pct: 22.3 },
  { unit: "Farmasi", count: 142, pct: 11.4 },
];

export const ASSET_MINI = [
  { label: "Nilai Persediaan", value: "Rp 21,74 M", trend: "5,6%", dir: "up" as TrendDir },
  { label: "Stok Kritis", value: "56 Item", trend: "3 item", dir: "down" as TrendDir },
  { label: "Aset Dalam Maintenance", value: "87 Aset", trend: "6 aset", dir: "up" as TrendDir },
  { label: "Kalibrasi Jatuh Tempo", value: "23 Aset", trend: "4 aset", dir: "down" as TrendDir },
];

export const ASSET_COMPOSITION = [
  { label: "Alat Medis", pct: 38, color: "#14B8A6" },
  { label: "Non-Medis", pct: 22, color: "#3B82F6" },
  { label: "IT", pct: 18, color: "#8B5CF6" },
  { label: "Sarpras", pct: 22, color: "#F59E0B" },
];

export const INVENTORY_BARS = {
  months: ["Dec", "Jan", "Feb", "Mar", "Apr", "May"],
  values: [18.2, 19.1, 19.8, 20.4, 21.0, 21.74],
};

export const ASSET_ALERTS = [
  { jenis: "Stok Kritis", deskripsi: "Paracetamol 500mg", prioritas: "Tinggi" as const, jumlah: 12 },
  { jenis: "Kalibrasi", deskripsi: "CT Scan Lt.2", prioritas: "Sedang" as const, jumlah: 3 },
  { jenis: "Maintenance", deskripsi: "Genset Blok B", prioritas: "Rendah" as const, jumlah: 1 },
];

export const SOROTAN = [
  {
    title: "Pendapatan meningkat",
    desc: "Pendapatan Mei 2025 naik 12,4% dibanding April. Kontribusi terbesar dari layanan rawat jalan.",
    tone: "emerald" as const,
  },
  {
    title: "Stok kritis di Farmasi",
    desc: "56 item stok kritis termasuk Paracetamol 500mg. Perlu tindakan pengadaan segera.",
    tone: "red" as const,
  },
  {
    title: "Kehadiran stabil",
    desc: "Tingkat kehadiran pegawai 92,4% bulan ini, di atas target 90%.",
    tone: "violet" as const,
  },
  {
    title: "Maintenance prioritas",
    desc: "87 aset dalam maintenance. 23 aset kalibrasi jatuh tempo minggu ini.",
    tone: "blue" as const,
  },
];
