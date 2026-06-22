import type { CashBankNavLabelKey, CashBankSectionLabelKey } from "./cash-bank-navigation";

export type CashBankSection = {
  id: string;
  labelKey: CashBankSectionLabelKey;
  description: string;
};

export type CashBankModuleConfig = {
  slug: string;
  labelKey: CashBankNavLabelKey;
  title: string;
  subtitle: string;
  sections: CashBankSection[];
};

export const CASH_BANK_MODULES: CashBankModuleConfig[] = [
  {
    slug: "transaksi-kas",
    labelKey: "finance.cashBank.transaksiKas",
    title: "Transaksi Kas",
    subtitle: "Pencatatan kas masuk, kas keluar, dan riwayat transaksi harian",
    sections: [
      {
        id: "kas-masuk",
        labelKey: "finance.cashBank.kasMasuk",
        description: "Penerimaan kas dari pendapatan, setoran, transfer masuk, dan sumber lainnya",
      },
      {
        id: "kas-keluar",
        labelKey: "finance.cashBank.kasKeluar",
        description: "Pengeluaran kas untuk belanja, pembayaran, transfer keluar, dan keperluan operasional",
      },
      {
        id: "riwayat-transaksi",
        labelKey: "finance.cashBank.riwayatTransaksi",
        description: "Log lengkap transaksi kas — filter periode, rekening, dan jenis arus",
      },
    ],
  },
  {
    slug: "saldo-rekap",
    labelKey: "finance.cashBank.saldoRekap",
    title: "Saldo & Rekap",
    subtitle: "Posisi kas, saldo periode, rekapitulasi bulanan, buku kas besar, dan proyeksi",
    sections: [
      {
        id: "posisi-saldo",
        labelKey: "finance.cashBank.posisiSaldo",
        description:
          "Posisi kas saat ini, saldo awal periode, dan saldo akhir per rekening kas & bank",
      },
      {
        id: "rekap-bulanan",
        labelKey: "finance.cashBank.rekapBulanan",
        description: "Rekapitulasi saldo kas dan bank per bulan — masuk, keluar, dan neto",
      },
      {
        id: "buku-kas-besar",
        labelKey: "finance.cashBank.bukuKasBesar",
        description:
          "Buku Kas Umum (BKU) dari SIMARTDB — ledger operasional pembayaran & penerimaan, terhubung ke jurnal ACC2026 via cnojurnal",
      },
      {
        id: "proyeksi-cashflow",
        labelKey: "finance.cashBank.proyeksiCashflow",
        description: "Proyeksi arus kas berdasarkan rencana penerimaan dan pengeluaran mendatang",
      },
    ],
  },
  {
    slug: "bank",
    labelKey: "finance.cashBank.bankRekonsiliasi",
    title: "Bank & Rekonsiliasi",
    subtitle: "Data rekening bank rumah sakit dan proses rekonsiliasi dengan mutasi bank",
    sections: [
      {
        id: "rekening-bank",
        labelKey: "finance.cashBank.rekeningBank",
        description: "Master rekening bank — nomor, bank, saldo buku, dan status aktif",
      },
      {
        id: "rekonsiliasi-bank",
        labelKey: "finance.cashBank.rekonsiliasiBank",
        description: "Cocokkan saldo buku dengan rekening koran — selisih dan tindak lanjut",
      },
    ],
  },
];

export const CASH_BANK_MODULE_BY_SLUG = Object.fromEntries(
  CASH_BANK_MODULES.map((module) => [module.slug, module])
) as Record<string, CashBankModuleConfig>;

/** Redirect slug lama / bookmark ke modul + tab baru */
export const CASH_BANK_LEGACY_SLUG_REDIRECT: Record<string, { slug: string; tab: string }> = {
  "posisi-kas": { slug: "saldo-rekap", tab: "posisi-saldo" },
  "posisi-kas-saat-ini": { slug: "saldo-rekap", tab: "posisi-saldo" },
  "saldo-awal": { slug: "saldo-rekap", tab: "posisi-saldo" },
  "saldo-akhir": { slug: "saldo-rekap", tab: "posisi-saldo" },
  "kas-masuk": { slug: "transaksi-kas", tab: "kas-masuk" },
  "kas-keluar": { slug: "transaksi-kas", tab: "kas-keluar" },
  "rekap-saldo-bulanan": { slug: "saldo-rekap", tab: "rekap-bulanan" },
  "buku-kas-besar": { slug: "saldo-rekap", tab: "buku-kas-besar" },
  "rekening-bank": { slug: "bank", tab: "rekening-bank" },
  "rekonsiliasi-bank": { slug: "bank", tab: "rekonsiliasi-bank" },
  "proyeksi-cashflow": { slug: "saldo-rekap", tab: "proyeksi-cashflow" },
  "riwayat-transaksi-kas": { slug: "transaksi-kas", tab: "riwayat-transaksi" },
  "riwayat-transaksi": { slug: "transaksi-kas", tab: "riwayat-transaksi" },
};
