"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SupplyChainSectionTabs } from "@/components/supply-chain/SupplyChainSectionTabs";
import { SupplyChainDataTab } from "@/components/supply-chain/SupplyChainDataTab";
import { SupplyChainMonitoringView } from "@/components/supply-chain/SupplyChainMonitoringView";
import { PageFrame } from "@/components/layout/PageFrame";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import type { SupplyChainModuleConfig } from "@/constants/supply-chain-pages";

type SupplyChainModulePageProps = {
  config: SupplyChainModuleConfig;
  initialTab?: string;
};

export function SupplyChainModulePage({ config, initialTab }: SupplyChainModulePageProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sections = config.sections ?? [];
  const tabFromUrl = searchParams.get("tab");
  const defaultTab =
    sections.find((s) => s.id === (initialTab ?? tabFromUrl))?.id ?? sections[0]?.id ?? "";

  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (!sections.length) return;
    const next = sections.find((s) => s.id === tabFromUrl)?.id ?? sections[0]?.id;
    if (next) setActiveTab(next);
  }, [tabFromUrl, sections]);

  const handleTabChange = useCallback(
    (id: string) => {
      setActiveTab(id);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const sectionLabels = Object.fromEntries(
    sections.map((section) => [section.labelKey, t(section.labelKey)])
  );

  const activeSection = sections.find((section) => section.id === activeTab);
  const contentTitle = activeSection ? sectionLabels[activeSection.labelKey] : config.title;
  const contentDescription = activeSection?.description ?? config.subtitle;

  if (config.customView === "monitoring") {
    return (
      <PageFrame title={config.title} description={config.subtitle}>
        <SupplyChainMonitoringView />
      </PageFrame>
    );
  }

  return (
    <PageFrame title={config.title} description={config.subtitle}>
      {sections.length > 1 && (
        <SupplyChainSectionTabs
          sections={sections}
          labels={sectionLabels}
          activeId={activeTab}
          onChange={handleTabChange}
        />
      )}

      <div className={sections.length > 1 ? "mt-3 space-y-3" : "space-y-3"}>
        {activeSection?.dataStage ? (
          <Card variant="default" className="!p-4">
            <SupplyChainDataTab
              slug={config.slug}
              section={activeSection}
              title={contentTitle}
            />
          </Card>
        ) : activeSection?.sqplusOnly ? (
          <Card variant="dashed" className="py-6 text-center sm:py-8">
            <CardTitle className="text-base sm:text-lg">{contentTitle}</CardTitle>
            <CardDescription className="mt-2">{contentDescription}</CardDescription>
            <p className="mt-3 text-xs text-slate-500">
              Fitur ini menggunakan modul SQ+ — {activeSection.source}
            </p>
            {config.slug === "permintaan-barang" && (
              <Link
                href="/procurement/permintaan"
                className="mt-4 inline-block text-sm font-medium text-[#0d6e63] hover:underline"
              >
                Buka Permintaan Pengadaan →
              </Link>
            )}
            <p className="mt-4 text-xs text-slate-400">Dalam pengembangan</p>
          </Card>
        ) : (
          <Card variant="dashed" className="py-6 text-center sm:py-8">
            <CardTitle className="text-base sm:text-lg">{contentTitle}</CardTitle>
            <CardDescription className="mt-2">{contentDescription}</CardDescription>
            <p className="mt-4 text-xs text-slate-400">Dalam pengembangan</p>
          </Card>
        )}
      </div>
    </PageFrame>
  );
}
