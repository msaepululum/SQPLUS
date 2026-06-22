import type { SettingsNavLabelKey, SettingsSectionLabelKey } from "./settings-navigation";

export type SettingsSection = {
  id: string;
  labelKey: SettingsSectionLabelKey;
  description: string;
};

export type SettingsModuleConfig = {
  slug: string;
  labelKey: SettingsNavLabelKey;
  title: string;
  subtitle: string;
  sections: SettingsSection[];
};

export const SETTINGS_MODULES: SettingsModuleConfig[] = [
  {
    slug: "dokumen-workflow",
    labelKey: "finance.settings.dokumenWorkflow",
    title: "Dokumen & Workflow",
    subtitle: "Template nomor dokumen, alur kerja keuangan, dan mapping approval",
    sections: [
      {
        id: "template-nomor-dokumen",
        labelKey: "finance.settings.templateNomorDokumen",
        description:
          "Format dan urutan penomoran dokumen keuangan — SP2D, voucher, jurnal, dan lainnya",
      },
      {
        id: "workflow-keuangan",
        labelKey: "finance.settings.workflowKeuangan",
        description:
          "Konfigurasi tahapan alur belanja, pembayaran, dan posting jurnal sesuai kebijakan RS",
      },
      {
        id: "mapping-approval",
        labelKey: "finance.settings.mappingApproval",
        description:
          "Pemetaan jenis dokumen ke pejabat penandatangan dan urutan approval berjenjang",
      },
    ],
  },
  {
    slug: "mapping-referensi",
    labelKey: "finance.settings.mappingReferensi",
    title: "Mapping Referensi",
    subtitle: "Pemetaan akun anggaran, sumber dana, dan unit kerja ke struktur keuangan",
    sections: [
      {
        id: "akun-anggaran-coa",
        labelKey: "finance.settings.mappingAkunAnggaranCoa",
        description:
          "Relasi kode rekening anggaran (RenGar) ke akun Chart of Accounts (COA) akuntansi",
      },
      {
        id: "sumber-dana",
        labelKey: "finance.settings.mappingSumberDana",
        description:
          "Pemetaan sumber dana anggaran ke rekening bank, akun kas, dan laporan keuangan",
      },
      {
        id: "unit-anggaran",
        labelKey: "finance.settings.mappingUnitAnggaran",
        description:
          "Relasi unit kerja / satuan kerja ke struktur pagu, RKA, dan otorisasi belanja",
      },
    ],
  },
  {
    slug: "parameter-audit",
    labelKey: "finance.settings.parameterAudit",
    title: "Parameter & Audit",
    subtitle: "Parameter perhitungan daya serap, cashflow, tahun anggaran, dan jejak audit",
    sections: [
      {
        id: "daya-serap",
        labelKey: "finance.settings.parameterDayaSerap",
        description:
          "Ambang batas, formula, dan periode perhitungan daya serap anggaran per unit",
      },
      {
        id: "cashflow",
        labelKey: "finance.settings.parameterCashflow",
        description:
          "Parameter proyeksi arus kas — saldo minimum, periode rolling, dan asumsi likuiditas",
      },
      {
        id: "tahun-anggaran",
        labelKey: "finance.settings.parameterTahunAnggaran",
        description:
          "Tahun anggaran aktif, periode buka/tutup, dan kalender fiskal modul keuangan",
      },
      {
        id: "audit-trail",
        labelKey: "finance.settings.auditTrailKeuangan",
        description:
          "Log perubahan data keuangan — siapa, kapan, dan apa yang diubah untuk kepatuhan audit",
      },
    ],
  },
];

export const SETTINGS_MODULE_BY_SLUG = Object.fromEntries(
  SETTINGS_MODULES.map((module) => [module.slug, module])
) as Record<string, SettingsModuleConfig>;

/** Redirect slug lama / bookmark ke modul + tab baru */
export const SETTINGS_LEGACY_SLUG_REDIRECT: Record<string, { slug: string; tab: string }> = {
  "template-nomor-dokumen": { slug: "dokumen-workflow", tab: "template-nomor-dokumen" },
  "template-nomor": { slug: "dokumen-workflow", tab: "template-nomor-dokumen" },
  "workflow-keuangan": { slug: "dokumen-workflow", tab: "workflow-keuangan" },
  workflow: { slug: "dokumen-workflow", tab: "workflow-keuangan" },
  "mapping-approval": { slug: "dokumen-workflow", tab: "mapping-approval" },
  "mapping-akun-anggaran-coa": { slug: "mapping-referensi", tab: "akun-anggaran-coa" },
  "mapping-akun-anggaran": { slug: "mapping-referensi", tab: "akun-anggaran-coa" },
  "akun-anggaran-coa": { slug: "mapping-referensi", tab: "akun-anggaran-coa" },
  "mapping-sumber-dana": { slug: "mapping-referensi", tab: "sumber-dana" },
  "sumber-dana": { slug: "mapping-referensi", tab: "sumber-dana" },
  "mapping-unit-anggaran": { slug: "mapping-referensi", tab: "unit-anggaran" },
  "unit-anggaran": { slug: "mapping-referensi", tab: "unit-anggaran" },
  "parameter-daya-serap": { slug: "parameter-audit", tab: "daya-serap" },
  "daya-serap": { slug: "parameter-audit", tab: "daya-serap" },
  "parameter-cashflow": { slug: "parameter-audit", tab: "cashflow" },
  cashflow: { slug: "parameter-audit", tab: "cashflow" },
  "parameter-tahun-anggaran": { slug: "parameter-audit", tab: "tahun-anggaran" },
  "tahun-anggaran": { slug: "parameter-audit", tab: "tahun-anggaran" },
  "audit-trail-keuangan": { slug: "parameter-audit", tab: "audit-trail" },
  "audit-trail": { slug: "parameter-audit", tab: "audit-trail" },
};
