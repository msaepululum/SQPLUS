import type { PaymentsNavLabelKey, PaymentsSectionLabelKey } from "./payments-navigation";
import { PAYMENT_WORKFLOW_SUMMARY } from "./payment-workflow";

export type PaymentsSection = {
  id: string;
  labelKey: PaymentsSectionLabelKey;
  description: string;
};

export type PaymentsModuleConfig = {
  slug: string;
  labelKey: PaymentsNavLabelKey;
  title: string;
  subtitle: string;
  sections: PaymentsSection[];
};

export const PAYMENTS_MODULES: PaymentsModuleConfig[] = [
  {
    slug: "alur-pembayaran",
    labelKey: "finance.payments.alurPembayaran",
    title: "Alur Pembayaran",
    subtitle: PAYMENT_WORKFLOW_SUMMARY,
    sections: [
      {
        id: "belum-proses-tagihan",
        labelKey: "finance.payments.tahap.belumProsesTagihan",
        description:
          "Penerimaan barang (INBELIH) yang belum masuk tukar faktur — relasi CNOBELI ke TKRFKTRD",
      },
      {
        id: "permintaan-bayar",
        labelKey: "finance.payments.tahap.permintaanBayar",
        description:
          "Tukar faktur (TKRFKTR) baru dibuat — detail belum masuk rencana bayar (LRCBYR = 0)",
      },
      {
        id: "rencana-bayar",
        labelKey: "finance.payments.tahap.rencanaBayar",
        description:
          "Rencana pembayaran aktif pada TKRFKTRD — menunggu proses verifikasi dan pencairan",
      },
      {
        id: "verifikasi-pajak",
        labelKey: "finance.payments.tahap.verifikasiPajak",
        description:
          "Verifikasi pajak (PPN/PPH) pada detail tukar faktur — LTAX belum selesai",
      },
      {
        id: "pembayaran-selesai",
        labelKey: "finance.payments.tahap.pembayaranSelesai",
        description:
          "Sudah dibayar dan tercatat di BKU — relasi TKRFKTRD.CNOBELI ↔ BKUD.cnobeli",
      },
    ],
  },
  {
    slug: "riwayat",
    labelKey: "finance.payments.riwayat",
    title: "Riwayat Pembayaran",
    subtitle: "Rekap pembayaran selesai dari BKU — filter periode dan pencarian",
    sections: [
      {
        id: "pembayaran-selesai",
        labelKey: "finance.payments.tahap.pembayaranSelesai",
        description:
          "Riwayat pembayaran yang sudah tercatat di BKUH/BKUD — terhubung ke nomor tukar faktur",
      },
    ],
  },
];

export const PAYMENTS_MODULE_BY_SLUG = Object.fromEntries(
  PAYMENTS_MODULES.map((module) => [module.slug, module])
) as Record<string, PaymentsModuleConfig>;

/** Redirect slug lama / bookmark ke modul + tab baru */
export const PAYMENTS_LEGACY_SLUG_REDIRECT: Record<
  string,
  { slug: string; tab: string; jenis?: string }
> = {
  permintaan: { slug: "alur-pembayaran", tab: "permintaan-bayar" },
  dokumen: { slug: "alur-pembayaran", tab: "belum-proses-tagihan" },
  tagihan: { slug: "alur-pembayaran", tab: "belum-proses-tagihan" },
  "daftar-permintaan-pembayaran": { slug: "alur-pembayaran", tab: "permintaan-bayar" },
  "daftar-permintaan": { slug: "alur-pembayaran", tab: "permintaan-bayar" },
  "buat-permintaan-pembayaran": { slug: "alur-pembayaran", tab: "permintaan-bayar" },
  "buat-permintaan": { slug: "alur-pembayaran", tab: "permintaan-bayar" },
  "verifikasi-pembayaran": { slug: "alur-pembayaran", tab: "verifikasi-pajak" },
  "verifikasi-keuangan": { slug: "alur-pembayaran", tab: "verifikasi-pajak" },
  approval: { slug: "alur-pembayaran", tab: "rencana-bayar" },
  "pembayaran-pengadaan": { slug: "alur-pembayaran", tab: "permintaan-bayar", jenis: "pengadaan" },
  "pembayaran-payroll": { slug: "alur-pembayaran", tab: "permintaan-bayar", jenis: "payroll" },
  "pembayaran-reimbursement": {
    slug: "alur-pembayaran",
    tab: "permintaan-bayar",
    jenis: "reimbursement",
  },
  "tagihan-dokumen": { slug: "alur-pembayaran", tab: "belum-proses-tagihan" },
  "belum-proses-tagihan": { slug: "alur-pembayaran", tab: "belum-proses-tagihan" },
  "permintaan-bayar": { slug: "alur-pembayaran", tab: "permintaan-bayar" },
  "rencana-bayar": { slug: "alur-pembayaran", tab: "rencana-bayar" },
  "verifikasi-pajak": { slug: "alur-pembayaran", tab: "verifikasi-pajak" },
  "voucher-pembayaran": { slug: "alur-pembayaran", tab: "pembayaran-selesai" },
  "bukti-pembayaran": { slug: "alur-pembayaran", tab: "pembayaran-selesai" },
  "pembayaran-tertunda": { slug: "alur-pembayaran", tab: "rencana-bayar" },
  "pembayaran-selesai": { slug: "riwayat", tab: "pembayaran-selesai" },
  "posting-jurnal": { slug: "alur-pembayaran", tab: "pembayaran-selesai" },
  "riwayat-pembayaran": { slug: "riwayat", tab: "pembayaran-selesai" },
  "payment-request": { slug: "alur-pembayaran", tab: "permintaan-bayar" },
};
