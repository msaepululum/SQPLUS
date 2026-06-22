export type CashBankNavLabelKey =
  | "finance.cashBank.dashboard"
  | "finance.cashBank.transaksiKas"
  | "finance.cashBank.saldoRekap"
  | "finance.cashBank.bankRekonsiliasi";

export type CashBankSectionLabelKey =
  | "finance.cashBank.kasMasuk"
  | "finance.cashBank.kasKeluar"
  | "finance.cashBank.riwayatTransaksi"
  | "finance.cashBank.posisiSaldo"
  | "finance.cashBank.rekapBulanan"
  | "finance.cashBank.bukuKasBesar"
  | "finance.cashBank.proyeksiCashflow"
  | "finance.cashBank.rekeningBank"
  | "finance.cashBank.rekonsiliasiBank";

export type CashBankNavItem = {
  labelKey: CashBankNavLabelKey;
  href: string;
};

/**
 * Sidebar Kas & Bank — 4 menu.
 * Posisi/saldo awal/akhir digabung; proyeksi masuk Saldo & Rekap.
 */
export const CASH_BANK_SUB_NAV: CashBankNavItem[] = [
  { labelKey: "finance.cashBank.dashboard", href: "/finance/cash-bank" },
  { labelKey: "finance.cashBank.transaksiKas", href: "/finance/cash-bank/transaksi-kas" },
  { labelKey: "finance.cashBank.saldoRekap", href: "/finance/cash-bank/saldo-rekap" },
  { labelKey: "finance.cashBank.bankRekonsiliasi", href: "/finance/cash-bank/bank" },
];
