export type FundingSourceJenis =
  | "operasional"
  | "investasi"
  | "bantuan"
  | "lainnya";

export type FundingSource = {
  id: number;
  kode: string;
  nama: string;
  jenis: FundingSourceJenis;
  is_active: boolean;
  keterangan: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
};

export type FundingSourceFormData = {
  kode: string;
  nama: string;
  jenis: FundingSourceJenis;
  is_active: string;
  keterangan: string;
};

export const FUNDING_SOURCE_JENIS_OPTIONS: {
  value: FundingSourceJenis;
  label: string;
}[] = [
  { value: "operasional", label: "Operasional" },
  { value: "investasi", label: "Investasi" },
  { value: "bantuan", label: "Bantuan / Hibah" },
  { value: "lainnya", label: "Lainnya" },
];

export const EMPTY_FUNDING_SOURCE_FORM: FundingSourceFormData = {
  kode: "",
  nama: "",
  jenis: "operasional",
  is_active: "1",
  keterangan: "",
};

export const JENIS_LABEL: Record<FundingSourceJenis, string> = {
  operasional: "Operasional",
  investasi: "Investasi",
  bantuan: "Bantuan / Hibah",
  lainnya: "Lainnya",
};

export function fundingSourceToForm(row: FundingSource): FundingSourceFormData {
  return {
    kode: row.kode,
    nama: row.nama,
    jenis: row.jenis,
    is_active: row.is_active ? "1" : "0",
    keterangan: row.keterangan ?? "",
  };
}
