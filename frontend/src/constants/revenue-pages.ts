import type { RevenueNavLabelKey, RevenueSectionLabelKey } from "./revenue-navigation";

export type RevenueSection = {
  id: string;
  labelKey: RevenueSectionLabelKey;
  description: string;
};

export type RevenueModuleConfig = {
  slug: string;
  labelKey: RevenueNavLabelKey;
  title: string;
  subtitle: string;
  sections: RevenueSection[];
};

export const REVENUE_MODULES: RevenueModuleConfig[] = [
  {
    slug: "perencanaan-pendapatan",
    labelKey: "finance.revenue.perencanaanPendapatan",
    title: "Perencanaan Pendapatan",
    subtitle: "Penetapan target dan rencana pendapatan tahunan — dipakai membandingkan realisasi di dashboard",
    sections: [
      {
        id: "setup-target",
        labelKey: "finance.revenue.setupTarget",
        description: "Target pendapatan total rumah sakit per tahun anggaran dan status penetapan",
      },
      {
        id: "input-rencana",
        labelKey: "finance.revenue.inputRencana",
        description: "Input target rencana per 8 kategori pendapatan BLU",
      },
      {
        id: "distribusi-bulanan",
        labelKey: "finance.revenue.distribusiBulanan",
        description: "Alokasi rencana per kategori per bulan (Jan–Des)",
      },
    ],
  },
  {
    slug: "pengumpulan-rekap",
    labelKey: "finance.revenue.pengumpulanRekap",
    title: "Pengumpulan & Rekap Pendapatan",
    subtitle: "Integrasi data, input manual, dan rekapitulasi harian serta bulanan",
    sections: [
      {
        id: "import-tarik",
        labelKey: "finance.revenue.importTarik",
        description: "Tarik data realisasi pendapatan dari sistem billing dan integrasi eksternal",
      },
      {
        id: "input-manual",
        labelKey: "finance.revenue.inputManual",
        description: "Entri realisasi manual — wajib dipetakan ke salah satu kategori pendapatan BLU",
      },
      {
        id: "rekap-harian",
        labelKey: "finance.revenue.rekapHarian",
        description: "Rekapitulasi harian per kategori pendapatan",
      },
      {
        id: "rekap-bulanan",
        labelKey: "finance.revenue.rekapBulanan",
        description: "Ringkasan bulanan per kategori pendapatan",
      },
    ],
  },
  {
    slug: "analisis",
    labelKey: "finance.revenue.analisis",
    title: "Analisis Pendapatan",
    subtitle: "Laporan realisasi vs rencana per 8 kategori pendapatan BLU",
    sections: [
      {
        id: "per-kategori",
        labelKey: "finance.revenue.perKategori",
        description: "Analisis capaian per kategori: rencana, realisasi, dan selisih",
      },
    ],
  },
  {
    slug: "rekonsiliasi",
    labelKey: "finance.revenue.rekonsiliasi",
    title: "Rekonsiliasi Pendapatan",
    subtitle: "Cocokkan data pendapatan operasional dengan bukti setor dan jurnal akuntansi",
    sections: [
      {
        id: "rekonsiliasi-pendapatan",
        labelKey: "finance.revenue.rekonsiliasiPendapatan",
        description: "Daftar selisih, status rekonsiliasi, dan tindak lanjut per periode",
      },
    ],
  },
];

export const REVENUE_MODULE_BY_SLUG = Object.fromEntries(
  REVENUE_MODULES.map((module) => [module.slug, module])
) as Record<string, RevenueModuleConfig>;

/** Redirect slug lama (jika ada bookmark) ke modul + tab baru */
export const REVENUE_LEGACY_SLUG_REDIRECT: Record<string, { slug: string; tab: string }> = {
  "rencana-pendapatan": { slug: "perencanaan-pendapatan", tab: "input-rencana" },
  "input-rencana-pendapatan": { slug: "perencanaan-pendapatan", tab: "input-rencana" },
  "setup-target-pendapatan": { slug: "perencanaan-pendapatan", tab: "setup-target" },
  "import-tarik": { slug: "pengumpulan-rekap", tab: "import-tarik" },
  "input-manual": { slug: "pengumpulan-rekap", tab: "input-manual" },
  "rekap-harian": { slug: "pengumpulan-rekap", tab: "rekap-harian" },
  "rekap-bulanan": { slug: "pengumpulan-rekap", tab: "rekap-bulanan" },
  "per-layanan": { slug: "analisis", tab: "per-kategori" },
  "per-akun": { slug: "analisis", tab: "per-kategori" },
  "per-sumber": { slug: "analisis", tab: "per-kategori" },
  "pendapatan-bpjs": { slug: "analisis", tab: "per-kategori" },
  "pendapatan-tunai": { slug: "analisis", tab: "per-kategori" },
  "pendapatan-asuransi": { slug: "analisis", tab: "per-kategori" },
  "pendapatan-kerja-sama": { slug: "analisis", tab: "per-kategori" },
  "pendapatan-lainnya": { slug: "analisis", tab: "per-kategori" },
};
