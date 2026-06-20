/** Klasifikasi pendapatan BLU — satu-satunya kategori yang dipakai modul Pendapatan */

export type RevenueCategoryId =
  | "apbn"
  | "jasa-rs"
  | "jasa-entitas"
  | "kerja-sama"
  | "usaha-lain"
  | "pnbp"
  | "hibah"
  | "pengembalian-blu";

export type RevenueCategory = {
  id: RevenueCategoryId;
  /** Kode ringkas untuk tabel */
  kode: string;
  labelKey: `finance.revenue.kategori.${RevenueCategoryId}`;
};

export const REVENUE_CATEGORIES: readonly RevenueCategory[] = [
  {
    id: "apbn",
    kode: "P01",
    labelKey: "finance.revenue.kategori.apbn",
  },
  {
    id: "jasa-rs",
    kode: "P02",
    labelKey: "finance.revenue.kategori.jasa-rs",
  },
  {
    id: "jasa-entitas",
    kode: "P03",
    labelKey: "finance.revenue.kategori.jasa-entitas",
  },
  {
    id: "kerja-sama",
    kode: "P04",
    labelKey: "finance.revenue.kategori.kerja-sama",
  },
  {
    id: "usaha-lain",
    kode: "P05",
    labelKey: "finance.revenue.kategori.usaha-lain",
  },
  {
    id: "pnbp",
    kode: "P06",
    labelKey: "finance.revenue.kategori.pnbp",
  },
  {
    id: "hibah",
    kode: "P07",
    labelKey: "finance.revenue.kategori.hibah",
  },
  {
    id: "pengembalian-blu",
    kode: "P08",
    labelKey: "finance.revenue.kategori.pengembalian-blu",
  },
] as const;

export function resolveRevenueCategoryId(
  value: string | null | undefined
): RevenueCategoryId | "" {
  if (!value) return "";
  const found = REVENUE_CATEGORIES.find((c) => c.id === value);
  return found?.id ?? "";
}

export function getRevenueCategory(id: RevenueCategoryId): RevenueCategory {
  return REVENUE_CATEGORIES.find((c) => c.id === id)!;
}
