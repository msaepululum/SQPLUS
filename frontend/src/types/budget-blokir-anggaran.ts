import type { BudgetPaguSetupMeta } from "@/types/budget-pagu-setup";

export type BlokirBlockType = "P" | "T" | "O";

export type BlokirStatusKey = "aktif" | "sebagian" | "total";

export type BudgetBlokirAnggaranRow = {
  rba_id: number;
  tahun: string;
  ptk_id: number;
  nama_satuan_ptk: string;
  ksro_id: number;
  kode_ksro: string;
  nama_ksro: string;
  kode_kelompok_belanja: string;
  kode_jenis_belanja: string;
  nama_komponen: string;
  volume: number;
  nama_satuan: string | null;
  harga_satuan: number;
  total: number;
  block_type: BlokirBlockType | null;
  block_volume: number | null;
  block_catatan: string | null;
  blocked_at: string | null;
  blocked_by: string | null;
  status: BlokirStatusKey;
  status_label: string;
};

export type BudgetBlokirAnggaranSummary = {
  total_rows: number;
  blocked_partial: number;
  blocked_total: number;
  active_rows: number;
  total_nilai: number;
  blocked_nilai: number;
};

export type BudgetBlokirAnggaranListMeta = {
  page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export type BudgetBlokirAnggaranMeta = BudgetPaguSetupMeta;

export type BudgetBlokirHistoriRow = {
  id: number;
  rba_id: number;
  block_type: BlokirBlockType;
  block_volume: number;
  catatan: string | null;
  created_at: string | null;
  created_by: string | null;
};

export type BudgetBlokirFormData = {
  rba_id: number;
  block_type: BlokirBlockType;
  block_volume: string;
  catatan: string;
};

export function formatBlokirAmount(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(Math.trunc(value));
}

export const BLOKIR_BLOCK_TYPE_LABELS: Record<BlokirBlockType, string> = {
  P: "Blokir Sebagian",
  T: "Blokir Total",
  O: "Lepas Blokir",
};

export const BLOKIR_STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Semua status" },
  { value: "aktif", label: "Aktif" },
  { value: "sebagian", label: "Blokir sebagian" },
  { value: "total", label: "Blokir total" },
];
