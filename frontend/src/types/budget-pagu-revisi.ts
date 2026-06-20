import type { BudgetPaguSetupMeta } from "@/types/budget-pagu-setup";

export type RevisiLevel = "jenis_belanja" | "ksro";

export type RevisiStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "approved"
  | "applied"
  | "rejected";

export type BudgetPaguRevisiTarget = {
  level: RevisiLevel;
  finance_id: number;
  pagu_id: number;
  tahun: string;
  ptk_id: number;
  nama_satuan_ptk: string;
  kelompok_belanja_id: number;
  kode_kelompok_belanja: string;
  jenis_belanja_id: number;
  kode_jenis_belanja: string;
  ksro_id: number | null;
  kode_ksro: string | null;
  nama_ksro: string | null;
  pagu_saat_ini: number;
  pending_revision: boolean;
};

export type BudgetPaguRevisiRow = {
  id: number;
  budget_year_id: number;
  nomor_pengajuan: string | null;
  level: RevisiLevel;
  level_label: string;
  finance_id: number;
  tahun: string;
  ptk_id: number | null;
  nama_satuan_ptk: string | null;
  kode_kelompok_belanja: string | null;
  kode_jenis_belanja: string | null;
  kode_ksro: string | null;
  nama_ksro: string | null;
  pagu_sebelum: number;
  pagu_sesudah: number;
  selisih: number;
  alasan: string;
  status: RevisiStatus;
  status_label: string;
  approval_instance_id: number | null;
  applied_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type BudgetPaguRevisiSummary = {
  total: number;
  draft: number;
  in_progress: number;
  approved: number;
  applied: number;
  rejected: number;
  total_selisih: number;
};

export type BudgetPaguRevisiListMeta = {
  page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export type BudgetPaguRevisiMeta = BudgetPaguSetupMeta;

export type BudgetPaguRevisiFormData = {
  budget_year_id: number;
  level: RevisiLevel;
  finance_id: number;
  pagu_sesudah: string;
  alasan: string;
};

export function formatRevisiAmount(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Math.trunc(value));
}

export function formatRevisiSelisih(value: number): string {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatRevisiAmount(value)}`;
}

export const REVISI_LEVEL_OPTIONS: { value: RevisiLevel; label: string; shortLabel: string }[] = [
  { value: "jenis_belanja", label: "Pagu Induk", shortLabel: "Induk" },
  { value: "ksro", label: "Distribusi KSRO", shortLabel: "KSRO" },
];

export const REVISI_STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Semua status" },
  { value: "draft", label: "Draft" },
  { value: "in_review", label: "Dalam review" },
  { value: "applied", label: "Diterapkan" },
  { value: "rejected", label: "Ditolak" },
];

export const REVISI_STATUS_LABELS: Record<RevisiStatus, string> = {
  draft: "Draft",
  submitted: "Diajukan",
  in_review: "Dalam Review",
  approved: "Disetujui",
  applied: "Diterapkan",
  rejected: "Ditolak",
};
