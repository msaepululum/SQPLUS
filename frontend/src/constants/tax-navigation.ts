export type TaxNavLabelKey =
  | "finance.tax.dashboard"
  | "finance.tax.manajemenPajak";

export type TaxSectionLabelKey =
  | "finance.tax.antrianVerifikasi"
  | "finance.tax.tagihanPembelian"
  | "finance.tax.tukarFaktur"
  | "finance.tax.detailPerhitungan"
  | "finance.tax.setoranPajak"
  | "finance.tax.pajakPengajuan"
  | "finance.tax.rekapBulanan";

export type TaxNavItem = {
  labelKey: TaxNavLabelKey;
  href: string;
};

export const TAX_SUB_NAV: TaxNavItem[] = [
  { labelKey: "finance.tax.dashboard", href: "/finance/tax" },
  { labelKey: "finance.tax.manajemenPajak", href: "/finance/tax/manajemen-pajak" },
];
