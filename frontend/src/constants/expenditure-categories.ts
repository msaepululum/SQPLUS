export type ExpenditureJenisId =
  | "pegawai"
  | "barang"
  | "jasa"
  | "pemeliharaan"
  | "perjalanan"
  | "modal"
  | "bekkes";

export type ExpenditureJenis = {
  id: ExpenditureJenisId;
  labelKey: `finance.expenditure.jenis.${ExpenditureJenisId}`;
};

/** Klasifikasi jenis belanja operasional & modal RS */
export const EXPENDITURE_JENIS: ExpenditureJenis[] = [
  { id: "pegawai", labelKey: "finance.expenditure.jenis.pegawai" },
  { id: "barang", labelKey: "finance.expenditure.jenis.barang" },
  { id: "jasa", labelKey: "finance.expenditure.jenis.jasa" },
  { id: "pemeliharaan", labelKey: "finance.expenditure.jenis.pemeliharaan" },
  { id: "perjalanan", labelKey: "finance.expenditure.jenis.perjalanan" },
  { id: "modal", labelKey: "finance.expenditure.jenis.modal" },
  { id: "bekkes", labelKey: "finance.expenditure.jenis.bekkes" },
];

const JENIS_IDS = new Set<string>(EXPENDITURE_JENIS.map((j) => j.id));

export function resolveExpenditureJenisId(value: string | null | undefined): ExpenditureJenisId | "" {
  if (!value || !JENIS_IDS.has(value)) return "";
  return value as ExpenditureJenisId;
}

export function getExpenditureJenis(id: ExpenditureJenisId): ExpenditureJenis {
  const found = EXPENDITURE_JENIS.find((j) => j.id === id);
  if (!found) throw new Error(`Unknown expenditure jenis: ${id}`);
  return found;
}
