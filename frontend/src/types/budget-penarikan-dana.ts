import type { BudgetPaguSetupMeta } from "@/types/budget-pagu-setup";

export type BudgetMonthlyCell = {
  bulan: number;
  nama_bulan: string;
  rencana: number;
  realisasi: number;
};

export type BudgetPenarikanDanaRow = {
  pagu_ksro_id: number;
  ksro_id: number;
  kode_ksro: string;
  nama_ksro: string;
  ptk_id: number;
  nama_satuan_ptk: string;
  kelompok_belanja_id: number;
  kode_kelompok_belanja: string;
  jenis_belanja_id: number;
  kode_jenis_belanja: string;
  pagu_ksro_total: number;
  pagu_induk_total: number;
  months: BudgetMonthlyCell[];
  total_rencana: number;
  total_realisasi: number;
};

export type BudgetPenarikanDanaSummary = {
  tahun: number;
  jumlah_baris: number;
  total_rencana: number;
  total_realisasi: number;
  months: BudgetMonthlyCell[];
};

export type BudgetPenarikanDanaMeta = BudgetPaguSetupMeta;

export type BudgetPenarikanBulkItem = {
  pagu_ksro_id: number;
  bulan: number;
  rencana_penarikan: number;
};

export function formatPenarikanAmount(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  if (value === 0) return "0";
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value);
}

export function parsePenarikanInput(value: string): number {
  return Number(value.replace(/\D/g, "") || 0);
}
