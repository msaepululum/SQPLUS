export type MonitoringView =
  | "monitoring"
  | "sisa_pagu"
  | "per_unit"
  | "per_akun"
  | "komitmen"
  | "riwayat";

export type MonitoringStatus = "aman" | "waspada" | "kritis";

export type BudgetMonitoringRow = {
  key: string;
  level: "unit" | "jenis_belanja" | "ksro";
  kode: string;
  nama: string;
  ptk_id: number;
  nama_satuan_ptk: string;
  jenis_belanja_id: number;
  kode_jenis_belanja: string;
  kelompok_belanja_id: number;
  kode_kelompok_belanja: string;
  ksro_id: number | null;
  pagu: number;
  pagu_rba: number;
  realisasi: number;
  sisa_pagu: number;
  serap_pct: number;
  terblokir: number;
  komitmen: number;
  menunggu_pembayaran: number;
  sisa_efektif: number;
  updated_at: string | null;
  status: MonitoringStatus;
  status_label: string;
};

export type BudgetMonitoringKpi = {
  total_pagu: number;
  total_realisasi: number;
  sisa_pagu: number;
  pct_realisasi: number;
  terblokir: number;
  komitmen: number;
  menunggu_pembayaran: number;
  sisa_efektif: number;
  jumlah_baris: number;
};

export type BudgetMonitoringMonthly = {
  bulan: number;
  nama_bulan: string;
  realisasi: number;
  sisa_pagu: number;
  serap_pct: number;
};

export type BudgetMonitoringCharts = {
  monthly: BudgetMonitoringMonthly[];
  absorption: { realisasi: number; sisa_pagu: number; pct: number };
  per_unit: { label: string; realisasi: number; pagu: number }[];
  per_jenis_belanja: { label: string; realisasi: number; pagu: number }[];
};

export type BudgetMonitoringInsightRow = {
  no: number;
  kode: string;
  nama: string;
  realisasi?: number;
  serap_pct: number;
  sisa_pagu?: number;
  status?: MonitoringStatus;
  status_label?: string;
};

export type BudgetMonitoringInsights = {
  top_realisasi: BudgetMonitoringInsightRow[];
  almost_empty: BudgetMonitoringInsightRow[];
};

export type BudgetMonitoringMeta = {
  tahun_options: string[];
  ptk: { id: number; nama_satuan_ptk: string; nama_ptk: string; no_absen: string }[];
  kelompok_belanja: { id: number; kode_kelompok_belanja: string }[];
  jenis_belanja: { id: number; kode_jenis_belanja: string; kelompok_belanja_id: number }[];
};

export const MONITORING_VIEW_TABS: { id: MonitoringView; label: string }[] = [
  { id: "monitoring", label: "Monitoring Realisasi" },
  { id: "sisa_pagu", label: "Sisa Pagu" },
  { id: "per_unit", label: "Per Unit" },
  { id: "per_akun", label: "Per Akun" },
  { id: "komitmen", label: "Komitmen & Pembayaran" },
  { id: "riwayat", label: "Riwayat Perubahan" },
];

export const MONITORING_PERIODE_OPTIONS = [
  { value: "1-12", label: "Jan – Des", from: 1, to: 12 },
  { value: "1-6", label: "Jan – Jun", from: 1, to: 6 },
  { value: "7-12", label: "Jul – Des", from: 7, to: 12 },
  { value: "1-3", label: "Triwulan I", from: 1, to: 3 },
  { value: "4-6", label: "Triwulan II", from: 4, to: 6 },
  { value: "7-9", label: "Triwulan III", from: 7, to: 9 },
  { value: "10-12", label: "Triwulan IV", from: 10, to: 12 },
];

export function formatMonitoringAmount(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2).replace(".", ",")} M`;
  }
  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2).replace(".", ",")} jt`;
  }
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Math.trunc(value));
}

export function formatMonitoringAmountFull(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Math.trunc(value));
}

export function formatMonitoringPct(value: number): string {
  if (!Number.isFinite(value)) return "0%";
  return `${value.toFixed(2).replace(".", ",")}%`;
}

/** Warna % serapan: hijau aman, kuning waspada, merah kritis */
export function monitoringPctClass(pct: number): string {
  if (!Number.isFinite(pct)) return "text-slate-400";
  if (pct >= 90) return "font-semibold text-red-600";
  if (pct >= 75) return "font-semibold text-amber-600";
  return "font-medium text-emerald-600";
}

export function monitoringPctDonutColor(pct: number): string {
  if (!Number.isFinite(pct)) return "#94a3b8";
  if (pct >= 90) return "#dc2626";
  if (pct >= 75) return "#d97706";
  return "#059669";
}

export function formatMonitoringDate(iso: string | null): string {
  if (!iso) return "—";
  return iso.slice(0, 16).replace("T", " ");
}

export function monitoringStatusVariant(
  status: MonitoringStatus
): "success" | "warning" | "danger" {
  if (status === "kritis") return "danger";
  if (status === "waspada") return "warning";
  return "success";
}
