import type { BudgetPaguSetupMeta } from "@/types/budget-pagu-setup";

export type BudgetPaguIndukOption = {
  pagu_jenis_belanja_id: number;
  pagu_id: number;
  tahun: string;
  ptk_id: number;
  nama_satuan_ptk: string;
  kelompok_belanja_id: number;
  kode_kelompok_belanja: string;
  jenis_belanja_id: number;
  kode_jenis_belanja: string;
  total_pagu: string;
  label: string;
};

export type BudgetKsroOption = {
  id: number;
  kode_ksro: string;
  nama_ksro: string;
  jenis_belanja_id: number;
};

export type BudgetPaguDistribusiMeta = BudgetPaguSetupMeta & {
  pagu_induk: BudgetPaguIndukOption[];
  ksro: BudgetKsroOption[];
};

export type BudgetPaguDistribusiRow = {
  id: number;
  pagu_jenis_belanja_id: number;
  ksro_id: number;
  kode_ksro: string;
  nama_ksro: string;
  total_pagu: string;
  sisa_pagu: string | null;
  tahun: string;
  ptk_id: number;
  nama_satuan_ptk: string;
  kelompok_belanja_id: number;
  kode_kelompok_belanja: string;
  jenis_belanja_id: number;
  kode_jenis_belanja: string;
  pagu_induk_total: string;
};

export type BudgetPaguDistribusiSummary = {
  pagu_jenis_belanja_id: number;
  pagu_induk_total: number;
  terdistribusi: number;
  sisa: number;
  jumlah_ksro: number;
};

export type BudgetPaguDistribusiFormData = {
  pagu_jenis_belanja_id: string;
  ksro_id: string;
  total_pagu: string;
};

export const EMPTY_BUDGET_PAGU_DISTRIBUSI_FORM: BudgetPaguDistribusiFormData = {
  pagu_jenis_belanja_id: "",
  ksro_id: "",
  total_pagu: "",
};

export function distribusiToForm(row: BudgetPaguDistribusiRow): BudgetPaguDistribusiFormData {
  return {
    pagu_jenis_belanja_id: String(row.pagu_jenis_belanja_id),
    ksro_id: String(row.ksro_id),
    total_pagu: String(Math.trunc(Number(row.total_pagu))),
  };
}

export function formatDistribusiPagu(value: string | number | null): string {
  if (value == null || value === "") return "—";
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return "—";
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(num);
}
