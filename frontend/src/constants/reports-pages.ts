import type { ReportsNavLabelKey, ReportsSectionLabelKey } from "./reports-navigation";

export type ReportsSection = {
  id: string;
  labelKey: ReportsSectionLabelKey;
  description: string;
};

export type ReportsModuleConfig = {
  slug: string;
  labelKey: ReportsNavLabelKey;
  title: string;
  subtitle: string;
  sections: ReportsSection[];
};

export const REPORTS_MODULES: ReportsModuleConfig[] = [
  {
    slug: "anggaran",
    labelKey: "finance.reports.anggaran",
    title: "Laporan Anggaran",
    subtitle: "Laporan pagu, realisasi, dan daya serap anggaran per unit dan sumber dana",
    sections: [
      {
        id: "pagu-anggaran",
        labelKey: "finance.reports.paguAnggaran",
        description: "Rekapitulasi pagu anggaran per program, kegiatan, unit PTK, dan jenis belanja",
      },
      {
        id: "realisasi-anggaran",
        labelKey: "finance.reports.realisasiAnggaran",
        description: "Perbandingan realisasi terhadap pagu — per periode, unit, dan kode rekening",
      },
      {
        id: "daya-serap",
        labelKey: "finance.reports.dayaSerap",
        description: "Analisis daya serap anggaran — persentase, ranking unit, dan tren bulanan",
      },
    ],
  },
  {
    slug: "operasional",
    labelKey: "finance.reports.operasional",
    title: "Laporan Operasional",
    subtitle: "Laporan pendapatan dan belanja operasional rumah sakit",
    sections: [
      {
        id: "pendapatan",
        labelKey: "finance.reports.pendapatan",
        description: "Rekapitulasi pendapatan per 8 kategori BLU — rencana vs realisasi",
      },
      {
        id: "pendapatan-per-akun",
        labelKey: "finance.reports.pendapatanPerAkun",
        description: "Rincian pendapatan per kode akun / rekening pendapatan",
      },
      {
        id: "belanja",
        labelKey: "finance.reports.belanja",
        description: "Rekapitulasi belanja per jenis, unit, dan kode akun belanja",
      },
    ],
  },
  {
    slug: "pos-keuangan",
    labelKey: "finance.reports.posKeuangan",
    title: "Laporan Posisi Keuangan",
    subtitle: "Laporan kas, saldo bulanan, hutang, dan piutang",
    sections: [
      {
        id: "kas-bank",
        labelKey: "finance.reports.kasBank",
        description: "Posisi kas dan saldo rekening bank — mutasi dan rekonsiliasi per periode",
      },
      {
        id: "saldo-bulanan",
        labelKey: "finance.reports.saldoBulanan",
        description: "Rekapitulasi saldo kas & bank per bulan — awal, masuk, keluar, akhir",
      },
      {
        id: "hutang",
        labelKey: "finance.reports.hutang",
        description: "Laporan hutang vendor, bekkes, jasa — aging dan outstanding per periode",
      },
      {
        id: "piutang",
        labelKey: "finance.reports.piutang",
        description: "Laporan piutang BPJS, pasien, asuransi — umur piutang dan penagihan",
      },
    ],
  },
  {
    slug: "transaksi",
    labelKey: "finance.reports.transaksi",
    title: "Laporan Transaksi",
    subtitle: "Laporan pembayaran dan jurnal akuntansi",
    sections: [
      {
        id: "pembayaran",
        labelKey: "finance.reports.pembayaran",
        description: "Rekapitulasi pembayaran per jenis, tahap alur, dan unit pengaju",
      },
      {
        id: "jurnal",
        labelKey: "finance.reports.jurnal",
        description: "Laporan jurnal umum dan otomatis — per periode, akun, dan sumber transaksi",
      },
    ],
  },
];

export const REPORTS_MODULE_BY_SLUG = Object.fromEntries(
  REPORTS_MODULES.map((module) => [module.slug, module])
) as Record<string, ReportsModuleConfig>;

/** Redirect slug lama / bookmark ke modul + tab baru */
export const REPORTS_LEGACY_SLUG_REDIRECT: Record<string, { slug: string; tab: string }> = {
  "laporan-pagu-anggaran": { slug: "anggaran", tab: "pagu-anggaran" },
  "pagu-anggaran": { slug: "anggaran", tab: "pagu-anggaran" },
  "laporan-realisasi-anggaran": { slug: "anggaran", tab: "realisasi-anggaran" },
  "realisasi-anggaran": { slug: "anggaran", tab: "realisasi-anggaran" },
  "laporan-daya-serap": { slug: "anggaran", tab: "daya-serap" },
  "daya-serap": { slug: "anggaran", tab: "daya-serap" },
  "laporan-pendapatan": { slug: "operasional", tab: "pendapatan" },
  pendapatan: { slug: "operasional", tab: "pendapatan" },
  "laporan-pendapatan-per-akun": { slug: "operasional", tab: "pendapatan-per-akun" },
  "pendapatan-per-akun": { slug: "operasional", tab: "pendapatan-per-akun" },
  "laporan-belanja": { slug: "operasional", tab: "belanja" },
  belanja: { slug: "operasional", tab: "belanja" },
  "laporan-kas-bank": { slug: "pos-keuangan", tab: "kas-bank" },
  "kas-bank": { slug: "pos-keuangan", tab: "kas-bank" },
  "laporan-saldo-bulanan": { slug: "pos-keuangan", tab: "saldo-bulanan" },
  "saldo-bulanan": { slug: "pos-keuangan", tab: "saldo-bulanan" },
  "laporan-hutang": { slug: "pos-keuangan", tab: "hutang" },
  hutang: { slug: "pos-keuangan", tab: "hutang" },
  "laporan-piutang": { slug: "pos-keuangan", tab: "piutang" },
  piutang: { slug: "pos-keuangan", tab: "piutang" },
  "laporan-pembayaran": { slug: "transaksi", tab: "pembayaran" },
  pembayaran: { slug: "transaksi", tab: "pembayaran" },
  "laporan-jurnal": { slug: "transaksi", tab: "jurnal" },
  jurnal: { slug: "transaksi", tab: "jurnal" },
  "transaksi-insight": { slug: "transaksi", tab: "pembayaran" },
};
