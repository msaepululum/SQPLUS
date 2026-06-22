"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AccountingArusKasTab } from "@/components/finance/accounting/AccountingArusKasTab";
import { AccountingBulanToolbarFilter } from "@/components/finance/accounting/AccountingBulanFilter";
import { AccountingBukuBesarTab } from "@/components/finance/accounting/AccountingBukuBesarTab";
import { AccountingCoaTab } from "@/components/finance/accounting/AccountingCoaTab";
import { AccountingEkuitasTab } from "@/components/finance/accounting/AccountingEkuitasTab";
import { AccountingFinancialReportTab } from "@/components/finance/accounting/AccountingFinancialReportTab";
import { AccountingJournalTab } from "@/components/finance/accounting/AccountingJournalTab";
import { AccountingMappingTab } from "@/components/finance/accounting/AccountingMappingTab";
import { AccountingSectionTabs } from "@/components/finance/accounting/AccountingSectionTabs";
import { AccountingTutupBukuTab } from "@/components/finance/accounting/AccountingTutupBukuTab";
import {
  BudgetYearScopeBar,
  BudgetYearScopeProvider,
  BudgetYearScopedContent,
  BudgetYearToolbarFilter,
} from "@/components/finance/budget/BudgetYearScope";
import { PageFrame } from "@/components/layout/PageFrame";
import { useTranslation } from "@/components/providers/LocaleProvider";
import type { AccountingModuleConfig } from "@/constants/accounting-pages";

const YEAR_SCOPED_SLUGS = new Set([
  "referensi-akun",
  "jurnal-buku-besar",
  "laporan-keuangan",
]);

const BULAN_FILTER_SLUGS = new Set(["jurnal-buku-besar", "laporan-keuangan"]);

type AccountingModulePageProps = {
  config: AccountingModuleConfig;
  initialTab?: string;
};

export function AccountingModulePage({ config, initialTab }: AccountingModulePageProps) {
  const isYearScoped = YEAR_SCOPED_SLUGS.has(config.slug);

  const inner = (
    <AccountingModulePageInner
      config={config}
      initialTab={initialTab}
      isYearScoped={isYearScoped}
    />
  );

  if (!isYearScoped) {
    return inner;
  }

  return <BudgetYearScopeProvider>{inner}</BudgetYearScopeProvider>;
}

function AccountingModulePageInner({
  config,
  initialTab,
  isYearScoped,
}: AccountingModulePageProps & { isYearScoped: boolean }) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const defaultTab =
    config.sections.find((s) => s.id === (initialTab ?? tabFromUrl))?.id ??
    config.sections[0]?.id ??
    "";

  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    const next =
      config.sections.find((s) => s.id === tabFromUrl)?.id ?? config.sections[0]?.id;
    if (next) setActiveTab(next);
  }, [tabFromUrl, config.sections]);

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
    config.sections.map((section) => [section.labelKey, t(section.labelKey)])
  );

  const activeSection =
    config.sections.find((section) => section.id === activeTab) ?? config.sections[0];

  const pageTitle = activeSection ? sectionLabels[activeSection.labelKey] : config.title;
  const pageDescription = activeSection ? activeSection.description : config.subtitle;

  const tabContent = activeSection ? renderTabContent(config.slug, activeSection.id) : null;

  const tabsRow = (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
      <div className="min-w-0 flex-1">
        {config.sections.length > 1 && (
          <AccountingSectionTabs
            sections={config.sections}
            labels={sectionLabels}
            activeId={activeTab}
            onChange={handleTabChange}
          />
        )}
      </div>
      {isYearScoped && <BudgetYearScopeBar compact className="lg:mb-0.5" />}
    </div>
  );

  const filterRow = isYearScoped ? (
    <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-2 rounded-lg border border-slate-200/80 bg-slate-50/40 px-2.5 py-2">
      <BudgetYearToolbarFilter />
      {BULAN_FILTER_SLUGS.has(config.slug) && <AccountingBulanToolbarFilter />}
    </div>
  ) : null;

  return (
    <PageFrame title={pageTitle} description={pageDescription} className="[&_header]:mb-2">
      {isYearScoped ? (
        <>
          {tabsRow}
          {filterRow}
          <BudgetYearScopedContent>{tabContent}</BudgetYearScopedContent>
        </>
      ) : (
        <>
          {config.sections.length > 1 && (
            <AccountingSectionTabs
              sections={config.sections}
              labels={sectionLabels}
              activeId={activeTab}
              onChange={handleTabChange}
            />
          )}
          {tabContent}
        </>
      )}
    </PageFrame>
  );
}

function renderTabContent(slug: string, tabId: string) {
  if (slug === "referensi-akun") {
    if (tabId === "coa") return <AccountingCoaTab />;
    if (tabId === "mapping-akun") return <AccountingMappingTab />;
  }

  if (slug === "jurnal-buku-besar") {
    if (tabId === "jurnal-umum") return <AccountingJournalTab mode="umum" />;
    if (tabId === "jurnal-otomatis") return <AccountingJournalTab mode="otomatis" />;
    if (tabId === "posting-jurnal") return <AccountingJournalTab mode="posting" />;
    if (tabId === "buku-besar") return <AccountingBukuBesarTab />;
  }

  if (slug === "laporan-keuangan") {
    if (tabId === "neraca") return <AccountingFinancialReportTab report="neraca" />;
    if (tabId === "laporan-operasional") return (
      <AccountingFinancialReportTab report="operasional" />
    );
    if (tabId === "arus-kas") return <AccountingArusKasTab />;
    if (tabId === "perubahan-ekuitas") return <AccountingEkuitasTab />;
  }

  if (slug === "tutup-buku" && tabId === "tutup-buku-periode") {
    return <AccountingTutupBukuTab />;
  }

  return null;
}
