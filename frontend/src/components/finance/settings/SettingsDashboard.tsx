"use client";

import Link from "next/link";
import { PageFrame } from "@/components/layout/PageFrame";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { Card, cardClassName, CardDescription, CardTitle } from "@/components/ui/Card";
import { SETTINGS_SUB_NAV } from "@/constants/settings-navigation";

const SETTINGS_KPIS = [
  { label: "Template Dokumen Aktif", value: "—" },
  { label: "Workflow Terkonfigurasi", value: "—" },
  { label: "Mapping Lengkap", value: "—" },
  { label: "Tahun Anggaran Aktif", value: "—" },
];

export function SettingsDashboard() {
  const { t } = useTranslation();
  const categories = SETTINGS_SUB_NAV.filter((item) => item.href !== "/finance/settings");

  return (
    <PageFrame
      title="Pengaturan Keuangan"
      description="Konfigurasi modul keuangan, RenGar, workflow, mapping referensi, dan parameter sistem"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {SETTINGS_KPIS.map((kpi) => (
          <Card key={kpi.label} variant="default" className="!p-4">
            <p className="text-xs text-slate-500">{kpi.label}</p>
            <p className="mt-1 text-lg font-semibold text-slate-800">{kpi.value}</p>
          </Card>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {categories.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={cardClassName({
                variant: "default",
                className: "h-full transition-shadow hover:shadow-md",
              })}
            >
              <CardTitle className="text-sm">{t(item.labelKey)}</CardTitle>
              <CardDescription className="mt-1.5 text-xs">Buka konfigurasi</CardDescription>
            </div>
          </Link>
        ))}
      </div>

      <Card variant="dashed" className="mt-3 py-8 text-center sm:py-10">
        <CardTitle className="text-base sm:text-lg">Ringkasan Konfigurasi</CardTitle>
        <CardDescription className="mt-2">
          Status kelengkapan setup modul keuangan — template, workflow, mapping, dan parameter.
        </CardDescription>
        <p className="mt-4 text-xs text-slate-400">Dalam pengembangan</p>
      </Card>
    </PageFrame>
  );
}
