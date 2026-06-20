export type BudgetPaguPtk = {
  id: number;
  nama_satuan_ptk: string;
  nama_ptk: string;
  no_absen: string | null;
};

export type BudgetPaguKelompokBelanja = {
  id: number;
  kode_kelompok_belanja: string;
};

export type BudgetPaguJenisBelanja = {
  id: number;
  kode_jenis_belanja: string;
  kelompok_belanja_id: number;
};

export type BudgetPaguSetupMeta = {
  tahun_options: string[];
  ptk: BudgetPaguPtk[];
  kelompok_belanja: BudgetPaguKelompokBelanja[];
  jenis_belanja: BudgetPaguJenisBelanja[];
};

export type BudgetPaguSetupRow = {
  id: number;
  tahun: string;
  ptk_id: number;
  nama_satuan_ptk: string;
  nama_ptk: string;
  pagu_kelompok_belanja_id: number;
  kelompok_belanja_id: number;
  kode_kelompok_belanja: string;
  pagu_jenis_belanja_id: number;
  jenis_belanja_id: number;
  kode_jenis_belanja: string;
  total_pagu: string;
  sisa_pagu: string | null;
  created_at: string | null;
};

export type BudgetPaguSetupFormData = {
  tahun: string;
  ptk_id: string;
  kelompok_belanja_id: string;
  jenis_belanja_id: string;
  total_pagu: string;
};

export const EMPTY_BUDGET_PAGU_FORM: BudgetPaguSetupFormData = {
  tahun: "",
  ptk_id: "",
  kelompok_belanja_id: "",
  jenis_belanja_id: "",
  total_pagu: "",
};

export function budgetPaguToForm(row: BudgetPaguSetupRow): BudgetPaguSetupFormData {
  return {
    tahun: row.tahun,
    ptk_id: String(row.ptk_id),
    kelompok_belanja_id: String(row.kelompok_belanja_id),
    jenis_belanja_id: String(row.jenis_belanja_id),
    total_pagu: String(Math.trunc(Number(row.total_pagu))),
  };
}

export function formatPaguAmount(value: string | number | null): string {
  if (value == null || value === "") return "—";
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return "—";
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(num);
}
