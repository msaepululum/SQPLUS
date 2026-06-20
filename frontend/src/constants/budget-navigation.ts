export type BudgetNavLabelKey =
  | "finance.budget.referensi"
  | "finance.budget.perencanaanPagu"
  | "finance.budget.perubahanAnggaran"
  | "finance.budget.monitoringRiwayat";

export type BudgetSectionLabelKey =
  | "finance.budget.tahunAnggaran"
  | "finance.budget.sumberDana"
  | "finance.budget.programKegiatan"
  | "finance.budget.kelompokBelanja"
  | "finance.budget.jenisBelanja"
  | "finance.budget.jenisRekening"
  | "finance.budget.sro"
  | "finance.budget.pptk"
  | "finance.budget.unitPtk"
  | "finance.budget.satuan"
  | "finance.budget.setupPagu"
  | "finance.budget.inputPaguUnit"
  | "finance.budget.distribusiPagu"
  | "finance.budget.rencanaPenarikanRealisasi"
  | "finance.budget.blokirAnggaran"
  | "finance.budget.revisiPagu"
  | "finance.budget.pergeseranPagu"
  | "finance.budget.rencanaPenarikanDana"
  | "finance.budget.monitoringPagu"
  | "finance.budget.riwayatPerubahanAnggaran";

export type BudgetNavItem = {
  labelKey: BudgetNavLabelKey;
  href: string;
};

/** Sub-menu modul Anggaran (4 menu utama) */
export const BUDGET_SUB_NAV: BudgetNavItem[] = [
  { labelKey: "finance.budget.referensi", href: "/finance/budget/referensi" },
  { labelKey: "finance.budget.perencanaanPagu", href: "/finance/budget/perencanaan-pagu" },
  { labelKey: "finance.budget.perubahanAnggaran", href: "/finance/budget/perubahan-anggaran" },
  { labelKey: "finance.budget.monitoringRiwayat", href: "/finance/budget/monitoring-riwayat" },
];
