import type {
  ExecutiveInsightNavLabelKey,
  ExecutiveInsightSectionLabelKey,
} from "./executive-insight-navigation";

export type ExecutiveInsightSection = {
  id: string;
  labelKey: ExecutiveInsightSectionLabelKey;
  description: string;
};

export type ExecutiveInsightModuleConfig = {
  slug: string;
  labelKey: ExecutiveInsightNavLabelKey;
  title: string;
  subtitle: string;
  sections: ExecutiveInsightSection[];
};

export const EXECUTIVE_INSIGHT_MODULES: ExecutiveInsightModuleConfig[] = [
  {
    slug: "kinerja-keuangan",
    labelKey: "finance.executiveInsight.kinerjaKeuangan",
    title: "Kinerja Keuangan",
    subtitle: "Tren pendapatan & belanja, posisi keuangan riil, dan analisis pendapatan per akun",
    sections: [
      {
        id: "tren-pendapatan-belanja",
        labelKey: "finance.executiveInsight.trenPendapatanBelanja",
        description:
          "Grafik tren pendapatan vs belanja — bulanan, kumulatif YTD, dan surplus/defisit operasional",
      },
      {
        id: "posisi-keuangan-riil",
        labelKey: "finance.executiveInsight.posisiKeuanganRiil",
        description:
          "Snapshot posisi keuangan riil — kas, piutang, hutang, dan ekuitas operasional RS",
      },
      {
        id: "pendapatan-per-akun",
        labelKey: "finance.executiveInsight.pendapatanPerAkun",
        description: "Analisis pendapatan per akun — kontribusi, pertumbuhan, dan deviasi dari rencana",
      },
    ],
  },
  {
    slug: "anggaran-pagu",
    labelKey: "finance.executiveInsight.anggaranPagu",
    title: "Anggaran & Pagu",
    subtitle: "Daya serap, komposisi anggaran, analisa pengadaan, revisi pagu, dan simulasi kebutuhan",
    sections: [
      {
        id: "daya-serap-anggaran",
        labelKey: "finance.executiveInsight.dayaSerapAnggaran",
        description: "Daya serap anggaran — ranking unit, heatmap bulanan, dan perbandingan antar sumber dana",
      },
      {
        id: "komposisi-anggaran",
        labelKey: "finance.executiveInsight.komposisiAnggaran",
        description: "Komposisi anggaran per kelompok belanja, program, dan unit kerja",
      },
      {
        id: "analisa-pagu-pengadaan",
        labelKey: "finance.executiveInsight.analisaPaguPengadaan",
        description: "Analisa pagu vs realisasi pengadaan — paket tender, vendor, dan sisa pagu belanja barang",
      },
      {
        id: "riwayat-revisi-pagu",
        labelKey: "finance.executiveInsight.riwayatRevisiPagu",
        description: "Riwayat revisi, pergeseran, dan perubahan pagu — dampak terhadap pagu efektif",
      },
      {
        id: "simulasi-kebutuhan-pagu",
        labelKey: "finance.executiveInsight.simulasiKebutuhanPagu",
        description:
          "Simulasi kebutuhan pagu tahun berikutnya berdasarkan tren realisasi dan proyeksi layanan",
      },
    ],
  },
  {
    slug: "hutang-likuiditas",
    labelKey: "finance.executiveInsight.hutangLikuiditas",
    title: "Hutang & Likuiditas",
    subtitle: "Tren hutang tahunan, rincian per akun, dan monitoring saldo kas bulanan",
    sections: [
      {
        id: "tren-hutang-tahunan",
        labelKey: "finance.executiveInsight.trenHutangTahunan",
        description: "Tren hutang tahunan — pertumbuhan kewajiban, aging, dan rasio hutang terhadap belanja",
      },
      {
        id: "hutang-per-akun",
        labelKey: "finance.executiveInsight.hutangPerAkun",
        description: "Rincian hutang per kode akun / rekening kewajiban — vendor, bekkes, dan jasa",
      },
      {
        id: "monitoring-saldo-bulanan",
        labelKey: "finance.executiveInsight.monitoringSaldoBulanan",
        description: "Monitoring saldo kas & bank bulanan — likuiditas, runway, dan alert saldo minimum",
      },
    ],
  },
  {
    slug: "operasional-klinis",
    labelKey: "finance.executiveInsight.operasionalKlinis",
    title: "Operasional Klinis",
    subtitle: "Analisis korelasi layanan klinis dengan beban dan pendapatan RS",
    sections: [
      {
        id: "analisa-pasien-resep-bekkes",
        labelKey: "finance.executiveInsight.analisaPasienResepBekkes",
        description:
          "Analisa volume pasien, resep, dan bekkes — dampak terhadap pendapatan farmasi dan belanja medis",
      },
    ],
  },
];

export const EXECUTIVE_INSIGHT_MODULE_BY_SLUG = Object.fromEntries(
  EXECUTIVE_INSIGHT_MODULES.map((module) => [module.slug, module])
) as Record<string, ExecutiveInsightModuleConfig>;

/** Redirect slug lama / bookmark ke modul + tab baru */
export const EXECUTIVE_INSIGHT_LEGACY_SLUG_REDIRECT: Record<
  string,
  { slug: string; tab: string }
> = {
  "ringkasan-utama": { slug: "kinerja-keuangan", tab: "tren-pendapatan-belanja" },
  "tren-pendapatan-belanja": { slug: "kinerja-keuangan", tab: "tren-pendapatan-belanja" },
  "posisi-keuangan-riil": { slug: "kinerja-keuangan", tab: "posisi-keuangan-riil" },
  "daya-serap-anggaran": { slug: "anggaran-pagu", tab: "daya-serap-anggaran" },
  "tren-hutang-tahunan": { slug: "hutang-likuiditas", tab: "tren-hutang-tahunan" },
  "hutang-per-akun": { slug: "hutang-likuiditas", tab: "hutang-per-akun" },
  "rincian-hutang-per-akun": { slug: "hutang-likuiditas", tab: "hutang-per-akun" },
  "analisa-pagu-pengadaan": { slug: "anggaran-pagu", tab: "analisa-pagu-pengadaan" },
  "analisa-pasien-resep-bekkes": {
    slug: "operasional-klinis",
    tab: "analisa-pasien-resep-bekkes",
  },
  "komposisi-anggaran": { slug: "anggaran-pagu", tab: "komposisi-anggaran" },
  "riwayat-revisi-pagu": { slug: "anggaran-pagu", tab: "riwayat-revisi-pagu" },
  "monitoring-saldo-bulanan": { slug: "hutang-likuiditas", tab: "monitoring-saldo-bulanan" },
  "pendapatan-per-akun": { slug: "kinerja-keuangan", tab: "pendapatan-per-akun" },
  "analisa-pendapatan-per-akun": { slug: "kinerja-keuangan", tab: "pendapatan-per-akun" },
  "simulasi-kebutuhan-pagu": { slug: "anggaran-pagu", tab: "simulasi-kebutuhan-pagu" },
  "executive-summary": { slug: "kinerja-keuangan", tab: "posisi-keuangan-riil" },
  "executive-insight": { slug: "kinerja-keuangan", tab: "tren-pendapatan-belanja" },
  "insight-pimpinan": { slug: "kinerja-keuangan", tab: "tren-pendapatan-belanja" },
  insight: { slug: "kinerja-keuangan", tab: "tren-pendapatan-belanja" },
};
