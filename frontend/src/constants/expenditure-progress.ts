/** Tab progres belanja di modul Proses Belanja */
export const EXPENDITURE_PROGRES_BELANJA_PROSES_PATH =
  "/finance/expenditure/proses-belanja?tab=progres-belanja";

/** Tab progres belanja di modul Monitoring & Riwayat */
export const EXPENDITURE_PROGRES_BELANJA_MONITORING_PATH =
  "/finance/expenditure/monitoring-riwayat?tab=progres-belanja";

export type ExpenditureProgressBelanjaContext = "proses-belanja" | "monitoring";

export function expenditureProgressBelanjaHref(
  context: ExpenditureProgressBelanjaContext = "monitoring"
): string {
  return context === "proses-belanja"
    ? EXPENDITURE_PROGRES_BELANJA_PROSES_PATH
    : EXPENDITURE_PROGRES_BELANJA_MONITORING_PATH;
}
