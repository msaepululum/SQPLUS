export type BudgetYearStatus = "draft" | "active" | "closed";

export type BudgetYear = {
  id: number;
  tahun: number;
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: BudgetYearStatus;
  keterangan: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
};

export type BudgetYearFormData = {
  tahun: string;
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: BudgetYearStatus;
  keterangan: string;
};

export const BUDGET_YEAR_STATUS_OPTIONS: {
  value: BudgetYearStatus;
  label: string;
}[] = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Aktif" },
  { value: "closed", label: "Ditutup" },
];

export const EMPTY_BUDGET_YEAR_FORM: BudgetYearFormData = {
  tahun: String(new Date().getFullYear()),
  nama: "",
  tanggal_mulai: `${new Date().getFullYear()}-01-01`,
  tanggal_selesai: `${new Date().getFullYear()}-12-31`,
  status: "draft",
  keterangan: "",
};

export function nextAvailableBudgetYear(
  existingYears: number[],
  startYear = new Date().getFullYear()
): number {
  const taken = new Set(existingYears);
  let year = startYear;

  while (taken.has(year) && year <= 2100) {
    year += 1;
  }

  return year;
}

export function buildEmptyBudgetYearForm(
  existingYears: number[] = []
): BudgetYearFormData {
  const tahun = nextAvailableBudgetYear(existingYears);

  return {
    tahun: String(tahun),
    nama: `Anggaran Tahun ${tahun}`,
    tanggal_mulai: `${tahun}-01-01`,
    tanggal_selesai: `${tahun}-12-31`,
    status: "draft",
    keterangan: "",
  };
}

export function budgetYearToForm(row: BudgetYear): BudgetYearFormData {
  return {
    tahun: String(row.tahun),
    nama: row.nama,
    tanggal_mulai: row.tanggal_mulai.slice(0, 10),
    tanggal_selesai: row.tanggal_selesai.slice(0, 10),
    status: row.status,
    keterangan: row.keterangan ?? "",
  };
}

export function formatBudgetYearPeriod(row: BudgetYear): string {
  const start = row.tanggal_mulai.slice(0, 10);
  const end = row.tanggal_selesai.slice(0, 10);
  return `${start} s/d ${end}`;
}
