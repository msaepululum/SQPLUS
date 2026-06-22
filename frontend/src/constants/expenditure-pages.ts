import type { ExpenditureNavLabelKey, ExpenditureSectionLabelKey } from "./expenditure-navigation";

export type ExpenditureSection = {
  id: string;
  labelKey: ExpenditureSectionLabelKey;
  description: string;
};

export type ExpenditureModuleConfig = {
  slug: string;
  labelKey: ExpenditureNavLabelKey;
  title: string;
  subtitle: string;
  sections: ExpenditureSection[];
};

export const EXPENDITURE_MODULES: ExpenditureModuleConfig[] = [
  {
    slug: "proses-belanja",
    labelKey: "finance.expenditure.prosesBelanja",
    title: "Proses Belanja",
    subtitle:
      "Alur pengajuan, komitmen, realisasi, dan antrian pembayaran belanja operasional serta modal",
    sections: [
      {
        id: "pengajuan",
        labelKey: "finance.expenditure.pengajuan",
        description: "Daftar pengajuan belanja unit kerja — draft hingga disetujui",
      },
      {
        id: "progres-belanja",
        labelKey: "finance.expenditure.progresBelanja",
        description: "Dashboard progres AJU per tahap workflow — proses, reject, dan close",
      },
      {
        id: "komitmen",
        labelKey: "finance.expenditure.komitmen",
        description: "Komitmen belanja yang sudah disetujui dan mengurangi sisa pagu",
      },
      {
        id: "realisasi",
        labelKey: "finance.expenditure.realisasi",
        description: "Realisasi belanja tercatat setelah bukti pembayaran atau SP2D",
      },
      {
        id: "menunggu-pembayaran",
        labelKey: "finance.expenditure.menungguPembayaran",
        description: "Transaksi yang sudah disetujui namun belum dibayarkan",
      },
    ],
  },
  {
    slug: "analisis",
    labelKey: "finance.expenditure.analisis",
    title: "Analisis Belanja",
    subtitle: "Laporan belanja per dimensi anggaran — kode akun, unit, sumber dana, dan jenis belanja",
    sections: [
      {
        id: "per-kode-akun",
        labelKey: "finance.expenditure.perKodeAkun",
        description: "Rekapitulasi pagu, realisasi, dan sisa per kode rekening belanja",
      },
      {
        id: "per-unit",
        labelKey: "finance.expenditure.perUnit",
        description: "Perbandingan serapan belanja antar unit kerja / instalasi",
      },
      {
        id: "per-sumber-dana",
        labelKey: "finance.expenditure.perSumberDana",
        description: "Komposisi belanja per sumber pendanaan (RM, BLU, hibah, dll.)",
      },
      {
        id: "per-jenis-belanja",
        labelKey: "finance.expenditure.perJenisBelanja",
        description:
          "Analisis per jenis belanja — pegawai, barang, jasa, pemeliharaan, perjalanan dinas, modal, bekkes",
      },
    ],
  },
  {
    slug: "monitoring-riwayat",
    labelKey: "finance.expenditure.monitoringRiwayat",
    title: "Monitoring & Riwayat",
    subtitle: "Progres belanja, sisa pagu, dan jejak audit transaksi belanja",
    sections: [
      {
        id: "progres-belanja",
        labelKey: "finance.expenditure.progresBelanja",
        description: "Dashboard progres AJU per tahap workflow — dapat dilihat pimpinan untuk seluruh unit",
      },
      {
        id: "riwayat-belanja",
        labelKey: "finance.expenditure.riwayatBelanja",
        description: "Riwayat lengkap transaksi belanja — filter status, periode, dan unit",
      },
    ],
  },
];

export const EXPENDITURE_MODULE_BY_SLUG = Object.fromEntries(
  EXPENDITURE_MODULES.map((module) => [module.slug, module])
) as Record<string, ExpenditureModuleConfig>;

/** Redirect slug lama / bookmark ke modul + tab baru */
export const EXPENDITURE_LEGACY_SLUG_REDIRECT: Record<
  string,
  { slug: string; tab: string; jenis?: string }
> = {
  pengajuan: { slug: "proses-belanja", tab: "pengajuan" },
  "pengajuan-belanja": { slug: "proses-belanja", tab: "pengajuan" },
  komitmen: { slug: "proses-belanja", tab: "komitmen" },
  "komitmen-belanja": { slug: "proses-belanja", tab: "komitmen" },
  realisasi: { slug: "proses-belanja", tab: "realisasi" },
  "realisasi-belanja": { slug: "proses-belanja", tab: "realisasi" },
  "menunggu-pembayaran": { slug: "proses-belanja", tab: "menunggu-pembayaran" },
  "per-kode-akun": { slug: "analisis", tab: "per-kode-akun" },
  "belanja-per-kode-akun": { slug: "analisis", tab: "per-kode-akun" },
  "per-unit": { slug: "analisis", tab: "per-unit" },
  "belanja-per-unit": { slug: "analisis", tab: "per-unit" },
  "per-sumber-dana": { slug: "analisis", tab: "per-sumber-dana" },
  "belanja-per-sumber-dana": { slug: "analisis", tab: "per-sumber-dana" },
  "per-jenis-belanja": { slug: "analisis", tab: "per-jenis-belanja" },
  "belanja-pegawai": { slug: "analisis", tab: "per-jenis-belanja", jenis: "pegawai" },
  "belanja-barang": { slug: "analisis", tab: "per-jenis-belanja", jenis: "barang" },
  "belanja-jasa": { slug: "analisis", tab: "per-jenis-belanja", jenis: "jasa" },
  "belanja-pemeliharaan": { slug: "analisis", tab: "per-jenis-belanja", jenis: "pemeliharaan" },
  "belanja-perjalanan-dinas": { slug: "analisis", tab: "per-jenis-belanja", jenis: "perjalanan" },
  "belanja-modal": { slug: "analisis", tab: "per-jenis-belanja", jenis: "modal" },
  "belanja-persediaan-medis-bekkes": { slug: "analisis", tab: "per-jenis-belanja", jenis: "bekkes" },
  "belanja-bekkes": { slug: "analisis", tab: "per-jenis-belanja", jenis: "bekkes" },
  "sisa-anggaran": { slug: "monitoring-riwayat", tab: "progres-belanja" },
  "progres-belanja": { slug: "monitoring-riwayat", tab: "progres-belanja" },
  "riwayat-belanja": { slug: "monitoring-riwayat", tab: "riwayat-belanja" },
  "progres-belanja-proses": { slug: "proses-belanja", tab: "progres-belanja" },
};
