export type ExpenditureNavLabelKey =
  | "finance.expenditure.dashboard"
  | "finance.expenditure.prosesBelanja"
  | "finance.expenditure.analisis"
  | "finance.expenditure.monitoringRiwayat";

export type ExpenditureSectionLabelKey =
  | "finance.expenditure.pengajuan"
  | "finance.expenditure.komitmen"
  | "finance.expenditure.realisasi"
  | "finance.expenditure.menungguPembayaran"
  | "finance.expenditure.perKodeAkun"
  | "finance.expenditure.perUnit"
  | "finance.expenditure.perSumberDana"
  | "finance.expenditure.perJenisBelanja"
  | "finance.expenditure.progresBelanja"
  | "finance.expenditure.sisaAnggaran"
  | "finance.expenditure.riwayatBelanja";

export type ExpenditureNavItem = {
  labelKey: ExpenditureNavLabelKey;
  href: string;
};

/**
 * Sidebar Belanja — 4 menu (+ dashboard).
 * Jenis belanja (pegawai, barang, jasa, dll.) sebagai filter di tab Analisis, bukan menu terpisah.
 */
export const EXPENDITURE_SUB_NAV: ExpenditureNavItem[] = [
  { labelKey: "finance.expenditure.dashboard", href: "/finance/expenditure" },
  { labelKey: "finance.expenditure.prosesBelanja", href: "/finance/expenditure/proses-belanja" },
  { labelKey: "finance.expenditure.analisis", href: "/finance/expenditure/analisis" },
  {
    labelKey: "finance.expenditure.monitoringRiwayat",
    href: "/finance/expenditure/monitoring-riwayat",
  },
];
