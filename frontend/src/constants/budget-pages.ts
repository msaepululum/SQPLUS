import type { BudgetNavLabelKey, BudgetSectionLabelKey } from "./budget-navigation";

export type BudgetSection = {
  id: string;
  labelKey: BudgetSectionLabelKey;
  description: string;
};

export type BudgetModuleConfig = {
  slug: string;
  labelKey: BudgetNavLabelKey;
  title: string;
  subtitle: string;
  sections: BudgetSection[];
};

export const BUDGET_MODULES: BudgetModuleConfig[] = [
  {
    slug: "referensi",
    labelKey: "finance.budget.referensi",
    title: "Referensi Anggaran",
    subtitle: "Data master tahun anggaran, struktur APBD, dan referensi belanja dari FINANCE",
    sections: [
      {
        id: "tahun-anggaran",
        labelKey: "finance.budget.tahunAnggaran",
        description: "Pengaturan tahun anggaran berjalan dan periode fiskal",
      },
      {
        id: "sumber-dana",
        labelKey: "finance.budget.sumberDana",
        description: "Master data sumber pendanaan anggaran rumah sakit",
      },
      {
        id: "program-kegiatan",
        labelKey: "finance.budget.programKegiatan",
        description: "Struktur program, kegiatan, dan sub kegiatan (master tanpa nilai pagu)",
      },
      {
        id: "kelompok-belanja",
        labelKey: "finance.budget.kelompokBelanja",
        description: "Kelompok belanja APBD (5.1 Operasi, 5.2 Modal, dll.) dari FINANCE",
      },
      {
        id: "jenis-belanja",
        labelKey: "finance.budget.jenisBelanja",
        description: "Jenis belanja per kelompok (pegawai, barang & jasa, modal) dari FINANCE",
      },
      {
        id: "jenis-rekening",
        labelKey: "finance.budget.jenisRekening",
        description: "Kode rekening belanja standar dari FINANCE",
      },
      {
        id: "sro",
        labelKey: "finance.budget.sro",
        description: "Standar Rekening Objek belanja dari FINANCE",
      },
      {
        id: "pptk",
        labelKey: "finance.budget.pptk",
        description: "Pejabat Pelaksana Teknis Kegiatan dari FINANCE",
      },
      {
        id: "unit-ptk",
        labelKey: "finance.budget.unitPtk",
        description: "Satuan pelaksana teknis kegiatan (unit kerja) dari FINANCE",
      },
      {
        id: "satuan",
        labelKey: "finance.budget.satuan",
        description: "Satuan barang dan jasa dari FINANCE",
      },
    ],
  },
  {
    slug: "perencanaan-pagu",
    labelKey: "finance.budget.perencanaanPagu",
    title: "Perencanaan Pagu",
    subtitle: "Setup, input, dan distribusi pagu anggaran ke unit kerja",
    sections: [
      {
        id: "setup-pagu",
        labelKey: "finance.budget.setupPagu",
        description: "Pagu induk per program, kegiatan, dan sub kegiatan (struktur APBD)",
      },
      {
        id: "input-pagu-unit",
        labelKey: "finance.budget.inputPaguUnit",
        description: "Input pagu per unit PTK dari database FINANCE (kelompok & jenis belanja)",
      },
      {
        id: "distribusi-pagu",
        labelKey: "finance.budget.distribusiPagu",
        description: "Pembagian pagu induk jenis belanja ke detail KSRO per unit PTK",
      },
      {
        id: "rencana-penarikan-realisasi",
        labelKey: "finance.budget.rencanaPenarikanRealisasi",
        description: "Rencana penarikan dana per bulan dan realisasi dari AJU hingga akhir tahun anggaran",
      },
    ],
  },
  {
    slug: "perubahan-anggaran",
    labelKey: "finance.budget.perubahanAnggaran",
    title: "Perubahan Anggaran",
    subtitle: "Blokir, revisi, dan pergeseran pagu anggaran",
    sections: [
      {
        id: "blokir-anggaran",
        labelKey: "finance.budget.blokirAnggaran",
        description: "Blokir dan lepas blokir pagu anggaran",
      },
      {
        id: "revisi-pagu",
        labelKey: "finance.budget.revisiPagu",
        description: "Revisi pagu anggaran dengan persetujuan berjenjang",
      },
      {
        id: "pergeseran-pagu",
        labelKey: "finance.budget.pergeseranPagu",
        description: "Pergeseran pagu antar akun, kegiatan, atau unit",
      },
    ],
  },
  {
    slug: "monitoring-riwayat",
    labelKey: "finance.budget.monitoringRiwayat",
    title: "Monitoring & Riwayat",
    subtitle: "Pemantauan realisasi pagu dan audit trail perubahan anggaran",
    sections: [
      {
        id: "monitoring-pagu",
        labelKey: "finance.budget.monitoringPagu",
        description: "Monitoring realisasi dan sisa pagu anggaran",
      },
      {
        id: "riwayat-perubahan-anggaran",
        labelKey: "finance.budget.riwayatPerubahanAnggaran",
        description: "Audit trail perubahan pagu, revisi, dan pergeseran",
      },
    ],
  },
];

export const BUDGET_MODULE_BY_SLUG = Object.fromEntries(
  BUDGET_MODULES.map((module) => [module.slug, module])
) as Record<string, BudgetModuleConfig>;

export const BUDGET_LEGACY_SLUG_REDIRECT: Record<string, { slug: string; tab: string }> = {
  "tahun-anggaran": { slug: "referensi", tab: "tahun-anggaran" },
  "sumber-dana": { slug: "referensi", tab: "sumber-dana" },
  "kode-akun-anggaran": { slug: "referensi", tab: "program-kegiatan" },
  "program-kegiatan": { slug: "referensi", tab: "program-kegiatan" },
  "kelompok-belanja": { slug: "referensi", tab: "kelompok-belanja" },
  "jenis-belanja": { slug: "referensi", tab: "jenis-belanja" },
  "jenis-rekening": { slug: "referensi", tab: "jenis-rekening" },
  sro: { slug: "referensi", tab: "sro" },
  pptk: { slug: "referensi", tab: "pptk" },
  "unit-ptk": { slug: "referensi", tab: "unit-ptk" },
  satuan: { slug: "referensi", tab: "satuan" },
  "setup-pagu": { slug: "perencanaan-pagu", tab: "setup-pagu" },
  "input-pagu-unit": { slug: "perencanaan-pagu", tab: "input-pagu-unit" },
  "distribusi-pagu": { slug: "perencanaan-pagu", tab: "distribusi-pagu" },
  "rencana-penarikan-realisasi": { slug: "perencanaan-pagu", tab: "rencana-penarikan-realisasi" },
  "rencana-penarikan-dana": { slug: "perencanaan-pagu", tab: "rencana-penarikan-realisasi" },
  "blokir-anggaran": { slug: "perubahan-anggaran", tab: "blokir-anggaran" },
  "revisi-pagu": { slug: "perubahan-anggaran", tab: "revisi-pagu" },
  "pergeseran-pagu": { slug: "perubahan-anggaran", tab: "pergeseran-pagu" },
  "monitoring-pagu": { slug: "monitoring-riwayat", tab: "monitoring-pagu" },
  "riwayat-perubahan-anggaran": { slug: "monitoring-riwayat", tab: "riwayat-perubahan-anggaran" },
};

/** Tab yang wajib memilih tahun anggaran sebagai kunci data pagu */
export const BUDGET_YEAR_SCOPED_TABS = new Set([
  "program-kegiatan",
  "setup-pagu",
  "input-pagu-unit",
  "distribusi-pagu",
  "rencana-penarikan-realisasi",
  "blokir-anggaran",
  "revisi-pagu",
  "pergeseran-pagu",
  "monitoring-pagu",
  "riwayat-perubahan-anggaran",
]);
