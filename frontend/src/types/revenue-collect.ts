import type { RevenueCategoryId } from "@/constants/revenue-categories";

export type RevenueRealizationRow = {
  id: number;
  budget_year_id: number;
  category_id: RevenueCategoryId;
  kode: string;
  label: string;
  tanggal: string;
  amount: number;
  source: "manual" | "import";
  reference_note: string | null;
  import_batch_id: number | null;
};

export type RevenueRealizationSummary = {
  budget_year_id: number;
  tahun: number;
  jumlah_baris: number;
  total_realisasi: number;
};

export type RevenueImportBatchRow = {
  id: number;
  source_system: string;
  periode_from: string;
  periode_to: string;
  status: string;
  total_rows: number;
  total_amount: number;
  message: string | null;
  imported_at: string | null;
};

export type RevenueCategoryAmount = {
  category_id: RevenueCategoryId;
  kode: string;
  label: string;
  amount: number;
};

export type RevenueRecapHarianRow = {
  tanggal: string;
  categories: RevenueCategoryAmount[];
  total: number;
};

export type RevenueRecapBulananRow = {
  bulan: number;
  nama_bulan: string;
  categories: RevenueCategoryAmount[];
  total: number;
};

export type RevenueAnalysisRow = {
  category_id: RevenueCategoryId;
  kode: string;
  label: string;
  target_amount: number;
  rencana_amount: number;
  realisasi_amount: number;
  selisih_rencana: number;
  capaian_rencana_pct: number | null;
  capaian_target_pct: number | null;
};

export type RevenueAnalysisSummary = {
  budget_year_id: number;
  tahun: number;
  bulan: number | null;
  total_target: number;
  total_rencana: number;
  total_realisasi: number;
  total_selisih_rencana: number;
  capaian_rencana_pct: number | null;
  capaian_target_pct: number | null;
};

export type RevenueReconciliationRow = {
  id: number | null;
  category_id: RevenueCategoryId;
  kode: string;
  label: string;
  bulan: number;
  nama_bulan: string;
  operasional_amount: number;
  akuntansi_amount: number;
  selisih_amount: number;
  status: "belum" | "sesuai" | "selisih";
  catatan: string | null;
};

export type RevenueReconciliationSummary = {
  budget_year_id: number;
  tahun: number;
  bulan: number;
  nama_bulan: string;
  total_operasional: number;
  total_akuntansi: number;
  total_selisih: number;
  jumlah_belum: number;
  jumlah_sesuai: number;
  jumlah_selisih: number;
};

export function revenuePctClass(pct: number | null): string {
  if (pct == null) return "text-slate-400";
  if (pct >= 100) return "text-emerald-700 font-semibold";
  if (pct >= 75) return "text-sky-700 font-medium";
  return "text-amber-700 font-medium";
}

export function revenueStatusLabel(status: RevenueReconciliationRow["status"]): string {
  switch (status) {
    case "sesuai":
      return "Sesuai";
    case "selisih":
      return "Selisih";
    default:
      return "Belum";
  }
}

export function revenueStatusTone(status: RevenueReconciliationRow["status"]): string {
  switch (status) {
    case "sesuai":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "selisih":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}
