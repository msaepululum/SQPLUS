import type { BudgetPaguSetupMeta } from "@/types/budget-pagu-setup";

export type PergeseranLevel = "jenis_belanja" | "ksro";

export type PergeseranStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "approved"
  | "applied"
  | "rejected";

export type BudgetPaguPergeseranTarget = {
  level: PergeseranLevel;
  finance_id: number;
  pagu_jenis_belanja_id?: number | null;
  pagu_id?: number;
  tahun: string;
  ptk_id: number;
  nama_satuan_ptk: string;
  kelompok_belanja_id?: number;
  kode_kelompok_belanja: string;
  jenis_belanja_id?: number;
  kode_jenis_belanja: string;
  ksro_id?: number | null;
  kode_ksro?: string | null;
  nama_ksro?: string | null;
  pagu_saat_ini: number;
  pending_shift?: boolean;
};

export type BudgetPaguPergeseranRow = {
  id: number;
  budget_year_id: number;
  nomor_pengajuan: string | null;
  level: PergeseranLevel;
  level_label: string;
  pagu_jenis_belanja_id: number | null;
  tahun: string;
  source_finance_id: number;
  dest_finance_id: number;
  source_nama_satuan_ptk: string | null;
  source_kode_jenis_belanja: string | null;
  source_kode_ksro: string | null;
  source_nama_ksro: string | null;
  dest_nama_satuan_ptk: string | null;
  dest_kode_jenis_belanja: string | null;
  dest_kode_ksro: string | null;
  dest_nama_ksro: string | null;
  source_pagu_sebelum: number;
  source_pagu_sesudah: number;
  dest_pagu_sebelum: number;
  dest_pagu_sesudah: number;
  nominal: number;
  alasan: string;
  status: PergeseranStatus;
  status_label: string;
  approval_instance_id: number | null;
  applied_at: string | null;
  created_at: string | null;
};

export type BudgetPaguPergeseranSummary = {
  total: number;
  draft: number;
  in_progress: number;
  applied: number;
  rejected: number;
  total_nominal: number;
};

export type BudgetPaguPergeseranListMeta = {
  page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export type BudgetPaguPergeseranMeta = BudgetPaguSetupMeta;

export type BudgetPaguPergeseranFormData = {
  budget_year_id: number;
  level: PergeseranLevel;
  source_finance_id: number;
  dest_finance_id: number;
  nominal: string;
  alasan: string;
};

export function formatPergeseranAmount(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Math.trunc(value));
}

export const PERGESERAN_LEVEL_OPTIONS: {
  value: PergeseranLevel;
  label: string;
  shortLabel: string;
  hint?: string;
}[] = [
  {
    value: "jenis_belanja",
    label: "Pagu Induk",
    shortLabel: "Induk",
    hint: "Pergeseran antar unit / jenis belanja",
  },
  {
    value: "ksro",
    label: "Distribusi KSRO",
    shortLabel: "KSRO",
    hint: "Pergeseran antar KSRO dalam pagu induk sama",
  },
];

export const PERGESERAN_STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Semua status" },
  { value: "draft", label: "Draft" },
  { value: "in_review", label: "Dalam review" },
  { value: "applied", label: "Diterapkan" },
  { value: "rejected", label: "Ditolak" },
];

export function targetLabel(row: BudgetPaguPergeseranTarget): string {
  if (row.level === "ksro" && row.kode_ksro) {
    return `${row.kode_ksro} · ${formatPergeseranAmount(row.pagu_saat_ini)}`;
  }
  return `${row.nama_satuan_ptk} · ${row.kode_jenis_belanja} · ${formatPergeseranAmount(row.pagu_saat_ini)}`;
}
