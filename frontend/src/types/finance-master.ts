export type FinanceMasterTabId =
  | "kelompok-belanja"
  | "jenis-belanja"
  | "pptk"
  | "unit-ptk"
  | "jenis-rekening"
  | "sro"
  | "satuan";

export type KelompokBelanjaRow = {
  id: number;
  kode_kelompok_belanja: string;
};

export type JenisBelanjaRow = {
  id: number;
  kode_jenis_belanja: string;
  kelompok_belanja_id: number;
  kelompok_kode: string | null;
};

export type PptkRow = {
  id: number;
  nama_pptk: string;
  nip_pptk: string | null;
  no_absen: string | null;
  jabatan_pptk_id: number | null;
};

export type PtkRow = {
  id: number;
  pptk_id: number | null;
  pptk_nama: string | null;
  nama_satuan_ptk: string;
  nama_ptk: string;
  nip_ptk: string | null;
  no_absen: string | null;
};

export type JenisRekeningRow = {
  id: number;
  no_rekening: string;
  nama_jenis_rekening: string;
};

export type SroRow = {
  id: number;
  no_rekening: string;
  nama_sro: string;
  jenis_belanja_id: number | null;
  jenis_belanja_kode: string | null;
};

export type SatuanRow = {
  id: number;
  nama_satuan: string;
};

export const FINANCE_MASTER_TAB_IDS = new Set<FinanceMasterTabId>([
  "kelompok-belanja",
  "jenis-belanja",
  "pptk",
  "unit-ptk",
  "jenis-rekening",
  "sro",
  "satuan",
]);

export function isFinanceMasterTab(id: string): id is FinanceMasterTabId {
  return FINANCE_MASTER_TAB_IDS.has(id as FinanceMasterTabId);
}
