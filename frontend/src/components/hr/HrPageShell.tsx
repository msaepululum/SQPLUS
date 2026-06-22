"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { HrPageContent } from "@/components/hr/HrPageContent";
import { HrSectionTabs } from "@/components/hr/HrSectionTabs";
import { PageFrame } from "@/components/layout/PageFrame";
import { useTranslation } from "@/components/providers/LocaleProvider";
import type { HrPageConfig } from "@/constants/hr-pages";
import type { HrPagePath } from "@/constants/hr-navigation";

type HrPageShellProps = {
  config: HrPageConfig;
  initialTab?: string;
  path: HrPagePath;
};

export function HrPageShell({ config, initialTab, path }: HrPageShellProps) {
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

  return (
    <PageFrame title={config.title} description={config.subtitle}>
      {sections.length > 1 && (
        <HrSectionTabs
          sections={sections}
          labels={sectionLabels}
          activeId={activeTab}
          onChange={handleTabChange}
        />
      )}

      <div className={sections.length > 1 ? "mt-3 space-y-3" : "space-y-3"}>
        <HrPageContent path={path} config={config} activeTab={activeSection?.id ?? activeTab} />
      </div>
    </PageFrame>
  );
}
