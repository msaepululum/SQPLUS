"use client";

import { BerandaKpiRow } from "@/components/beranda/BerandaKpiRow";
import { InsightAsset } from "@/components/beranda/InsightAsset";
import { InsightKeuangan } from "@/components/beranda/InsightKeuangan";
import { InsightPersonalia } from "@/components/beranda/InsightPersonalia";
import { SorotanPimpinan } from "@/components/beranda/SorotanPimpinan";
import { PageFrame } from "@/components/layout/PageFrame";
import { useTranslation } from "@/components/providers/LocaleProvider";

export default function BerandaPage() {
  const { t } = useTranslation();

  return (
    <PageFrame
      title={t("beranda.title")}
      description={t("beranda.description")}
    >
      <div className="mt-3 space-y-4">

      <BerandaKpiRow />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-4">
        <InsightKeuangan />
        <InsightPersonalia />
        <InsightAsset />
        <SorotanPimpinan />
      </div>
      </div>
    </PageFrame>
  );
}
