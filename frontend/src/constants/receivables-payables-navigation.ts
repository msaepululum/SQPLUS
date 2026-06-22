export type ReceivablesPayablesNavLabelKey =
  | "finance.receivablesPayables.dashboard"
  | "finance.receivablesPayables.hutang"
  | "finance.receivablesPayables.piutang"
  | "finance.receivablesPayables.klaimJkn"
  | "finance.receivablesPayables.rekonsiliasiRiwayat";

export type ReceivablesPayablesSectionLabelKey =
  | "finance.receivablesPayables.daftarHutang"
  | "finance.receivablesPayables.hutangPerKodeAkun"
  | "finance.receivablesPayables.daftarPiutang"
  | "finance.receivablesPayables.umurPiutang"
  | "finance.receivablesPayables.rekonsiliasiHutang"
  | "finance.receivablesPayables.rekonsiliasiPiutang"
  | "finance.receivablesPayables.riwayatHutangPiutang";

export type ReceivablesPayablesNavItem = {
  labelKey: ReceivablesPayablesNavLabelKey;
  href: string;
};

/**
 * Sidebar Hutang & Piutang — 5 menu.
 * Jenis hutang/piutang dan tahun hutang sebagai filter, bukan menu terpisah.
 */
export const RECEIVABLES_PAYABLES_SUB_NAV: ReceivablesPayablesNavItem[] = [
  {
    labelKey: "finance.receivablesPayables.dashboard",
    href: "/finance/receivables-payables",
  },
  {
    labelKey: "finance.receivablesPayables.hutang",
    href: "/finance/receivables-payables/hutang",
  },
  {
    labelKey: "finance.receivablesPayables.piutang",
    href: "/finance/receivables-payables/piutang",
  },
  {
    labelKey: "finance.receivablesPayables.klaimJkn",
    href: "/finance/receivables-payables/klaim-jkn",
  },
  {
    labelKey: "finance.receivablesPayables.rekonsiliasiRiwayat",
    href: "/finance/receivables-payables/rekonsiliasi-riwayat",
  },
];
