export type SettingsNavLabelKey =
  | "finance.settings.dashboard"
  | "finance.settings.dokumenWorkflow"
  | "finance.settings.mappingReferensi"
  | "finance.settings.parameterAudit";

export type SettingsSectionLabelKey =
  | "finance.settings.templateNomorDokumen"
  | "finance.settings.workflowKeuangan"
  | "finance.settings.mappingApproval"
  | "finance.settings.mappingAkunAnggaranCoa"
  | "finance.settings.mappingSumberDana"
  | "finance.settings.mappingUnitAnggaran"
  | "finance.settings.parameterDayaSerap"
  | "finance.settings.parameterCashflow"
  | "finance.settings.parameterTahunAnggaran"
  | "finance.settings.auditTrailKeuangan";

export type SettingsNavItem = {
  labelKey: SettingsNavLabelKey;
  href: string;
};

/** Sidebar Pengaturan — 4 menu. Konfigurasi dokumen, mapping, parameter, dan audit. */
export const SETTINGS_SUB_NAV: SettingsNavItem[] = [
  { labelKey: "finance.settings.dashboard", href: "/finance/settings" },
  {
    labelKey: "finance.settings.dokumenWorkflow",
    href: "/finance/settings/dokumen-workflow",
  },
  {
    labelKey: "finance.settings.mappingReferensi",
    href: "/finance/settings/mapping-referensi",
  },
  {
    labelKey: "finance.settings.parameterAudit",
    href: "/finance/settings/parameter-audit",
  },
];
