import type { AccountingNavLabelKey, AccountingSectionLabelKey } from "./accounting-navigation";
import { ACCOUNTING_CYCLE_SUMMARY } from "./accounting-standards";

export type AccountingSection = {
  id: string;
  labelKey: AccountingSectionLabelKey;
  description: string;
};

export type AccountingModuleConfig = {
  slug: string;
  labelKey: AccountingNavLabelKey;
  title: string;
  subtitle: string;
  sections: AccountingSection[];
};

export const ACCOUNTING_MODULES: AccountingModuleConfig[] = [
  {
    slug: "referensi-akun",
    labelKey: "finance.accounting.referensiAkun",
    title: "Referensi Akun",
    subtitle: "Chart of Accounts (COA) dan pemetaan akun integrasi modul keuangan",
    sections: [
      {
        id: "coa",
        labelKey: "finance.accounting.coa",
        description:
          "Chart of Account — struktur akun hierarkis (header, detail, sub-akun) sesuai standar akuntansi BLU/RS",
      },
      {
        id: "mapping-akun",
        labelKey: "finance.accounting.mappingAkun",
        description:
          "Mapping akun — petakan transaksi modul (pendapatan, belanja, kas, payroll) ke akun COA",
      },
    ],
  },
  {
    slug: "jurnal-buku-besar",
    labelKey: "finance.accounting.jurnalBukuBesar",
    title: "Jurnal & Buku Besar",
    subtitle: ACCOUNTING_CYCLE_SUMMARY,
    sections: [
      {
        id: "jurnal-umum",
        labelKey: "finance.accounting.jurnalUmum",
        description:
          "Jurnal umum (general journal) — entri manual debit/kredit dengan validasi keseimbangan",
      },
      {
        id: "jurnal-otomatis",
        labelKey: "finance.accounting.jurnalOtomatis",
        description:
          "Jurnal otomatis — hasil generate dari modul pendapatan, belanja, pembayaran, dan kas",
      },
      {
        id: "posting-jurnal",
        labelKey: "finance.accounting.postingJurnal",
        description:
          "Posting jurnal — proses memindahkan jurnal yang sudah disetujui ke buku besar",
      },
      {
        id: "buku-besar",
        labelKey: "finance.accounting.bukuBesar",
        description:
          "Buku besar (general ledger) — saldo dan mutasi per akun setelah posting",
      },
    ],
  },
  {
    slug: "laporan-keuangan",
    labelKey: "finance.accounting.laporanKeuangan",
    title: "Laporan Keuangan",
    subtitle: "Laporan keuangan utama sesuai PSAK — neraca, laba rugi, arus kas, dan ekuitas",
    sections: [
      {
        id: "neraca",
        labelKey: "finance.accounting.neraca",
        description: "Neraca (balance sheet) — posisi keuangan aset, liabilitas, dan ekuitas per periode",
      },
      {
        id: "laporan-operasional",
        labelKey: "finance.accounting.laporanOperasional",
        description:
          "Laporan operasional / laba rugi — pendapatan, beban, dan surplus/defisit periode berjalan",
      },
      {
        id: "arus-kas",
        labelKey: "finance.accounting.laporanArusKas",
        description: "Laporan arus kas — aktivitas operasi, investasi, dan pendanaan (metode langsung/tidak langsung)",
      },
      {
        id: "perubahan-ekuitas",
        labelKey: "finance.accounting.laporanPerubahanEkuitas",
        description: "Laporan perubahan ekuitas — mutasi modal, surplus, dan komponen ekuitas lainnya",
      },
    ],
  },
  {
    slug: "tutup-buku",
    labelKey: "finance.accounting.tutupBuku",
    title: "Tutup Buku",
    subtitle: "Penutupan periode akuntansi — rekonsiliasi, jurnal penutup, dan kunci periode",
    sections: [
      {
        id: "tutup-buku-periode",
        labelKey: "finance.accounting.tutupBukuPeriode",
        description:
          "Tutup buku periode — validasi neraca, jurnal penutup otomatis, dan penguncian transaksi periode",
      },
    ],
  },
];

export const ACCOUNTING_MODULE_BY_SLUG = Object.fromEntries(
  ACCOUNTING_MODULES.map((module) => [module.slug, module])
) as Record<string, AccountingModuleConfig>;

/** Redirect slug lama / bookmark ke modul + tab baru */
export const ACCOUNTING_LEGACY_SLUG_REDIRECT: Record<string, { slug: string; tab: string }> = {
  coa: { slug: "referensi-akun", tab: "coa" },
  "chart-of-account": { slug: "referensi-akun", tab: "coa" },
  "chart-of-accounts": { slug: "referensi-akun", tab: "coa" },
  "mapping-akun": { slug: "referensi-akun", tab: "mapping-akun" },
  "jurnal-umum": { slug: "jurnal-buku-besar", tab: "jurnal-umum" },
  "jurnal-otomatis": { slug: "jurnal-buku-besar", tab: "jurnal-otomatis" },
  "posting-jurnal": { slug: "jurnal-buku-besar", tab: "posting-jurnal" },
  "buku-besar": { slug: "jurnal-buku-besar", tab: "buku-besar" },
  neraca: { slug: "laporan-keuangan", tab: "neraca" },
  "laporan-operasional": { slug: "laporan-keuangan", tab: "laporan-operasional" },
  "laporan-arus-kas": { slug: "laporan-keuangan", tab: "arus-kas" },
  "laporan-perubahan-ekuitas": { slug: "laporan-keuangan", tab: "perubahan-ekuitas" },
  "tutup-buku": { slug: "tutup-buku", tab: "tutup-buku-periode" },
};
