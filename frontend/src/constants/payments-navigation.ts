export type PaymentsNavLabelKey =
  | "finance.payments.dashboard"
  | "finance.payments.alurPembayaran"
  | "finance.payments.riwayat";

export type PaymentsSectionLabelKey =
  | "finance.payments.tahap.belumProsesTagihan"
  | "finance.payments.tahap.permintaanBayar"
  | "finance.payments.tahap.rencanaBayar"
  | "finance.payments.tahap.verifikasiPajak"
  | "finance.payments.tahap.pembayaranSelesai"
  | "finance.payments.riwayatPembayaran";

export type PaymentsNavItem = {
  labelKey: PaymentsNavLabelKey;
  href: string;
};

/**
 * Sidebar Pembayaran — dashboard + alur 5 tahap + riwayat.
 */
export const PAYMENTS_SUB_NAV: PaymentsNavItem[] = [
  { labelKey: "finance.payments.dashboard", href: "/finance/payments" },
  {
    labelKey: "finance.payments.alurPembayaran",
    href: "/finance/payments/alur-pembayaran",
  },
  { labelKey: "finance.payments.riwayat", href: "/finance/payments/riwayat" },
];
