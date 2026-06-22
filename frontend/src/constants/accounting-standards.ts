/** Siklus akuntansi standar — referensi modul Akuntansi */
export const ACCOUNTING_CYCLE_SUMMARY =
  "COA & Mapping → Jurnal → Posting → Buku Besar → Laporan Keuangan → Tutup Buku";

export type AccountingReportId =
  | "neraca"
  | "laporan-operasional"
  | "arus-kas"
  | "perubahan-ekuitas";

export type AccountingReport = {
  id: AccountingReportId;
  labelKey:
    | "finance.accounting.neraca"
    | "finance.accounting.laporanOperasional"
    | "finance.accounting.laporanArusKas"
    | "finance.accounting.laporanPerubahanEkuitas";
  psakRef: string;
};

/** Laporan keuangan utama sesuai PSAK */
export const ACCOUNTING_FINANCIAL_REPORTS: AccountingReport[] = [
  {
    id: "neraca",
    labelKey: "finance.accounting.neraca",
    psakRef: "PSAK 1 — Penyajian Laporan Keuangan",
  },
  {
    id: "laporan-operasional",
    labelKey: "finance.accounting.laporanOperasional",
    psakRef: "PSAK 1 — Laporan Laba Rugi Komprehensif",
  },
  {
    id: "arus-kas",
    labelKey: "finance.accounting.laporanArusKas",
    psakRef: "PSAK 2 — Laporan Arus Kas",
  },
  {
    id: "perubahan-ekuitas",
    labelKey: "finance.accounting.laporanPerubahanEkuitas",
    psakRef: "PSAK 1 — Laporan Perubahan Ekuitas",
  },
];
