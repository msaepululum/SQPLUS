"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CashBankSectionTabs } from "@/components/finance/cash-bank/CashBankSectionTabs";
import { CashTransactionTabCrud } from "@/components/finance/cash-bank/CashTransactionTabCrud";
import { SaldoPosisiTab } from "@/components/finance/cash-bank/SaldoPosisiTab";
import { SaldoRekapBulananTab } from "@/components/finance/cash-bank/SaldoRekapBulananTab";
import { BukuKasBesarTab } from "@/components/finance/cash-bank/BukuKasBesarTab";
import { ProyeksiCashflowTab } from "@/components/finance/cash-bank/ProyeksiCashflowTab";
import { RekeningBankTab } from "@/components/finance/cash-bank/RekeningBankTab";
import { RekonsiliasiBankTab } from "@/components/finance/cash-bank/RekonsiliasiBankTab";
import {
  BudgetYearScopeBar,
  BudgetYearScopeProvider,
  BudgetYearScopedContent,
} from "@/components/finance/budget/BudgetYearScope";
import { PageFrame } from "@/components/layout/PageFrame";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import type { CashBankModuleConfig } from "@/constants/cash-bank-pages";

const YEAR_SCOPED_SLUGS = new Set(["transaksi-kas", "saldo-rekap", "bank"]);

type CashBankModulePageProps = {
  config: CashBankModuleConfig;
  initialTab?: string;
};

export function CashBankModulePage({ config, initialTab }: CashBankModulePageProps) {
  const isYearScoped = YEAR_SCOPED_SLUGS.has(config.slug);

  const inner = (
    <CashBankModulePageInner
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

function CashBankModulePageInner({
  config,
  initialTab,
  isYearScoped,
}: CashBankModulePageProps & { isYearScoped: boolean }) {
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

  const isTransaksiKas = config.slug === "transaksi-kas";
  const isSaldoRekap = config.slug === "saldo-rekap";
  const isBank = config.slug === "bank";
  const pageTitle =
    (isTransaksiKas || isSaldoRekap || isBank) && activeSection
      ? sectionLabels[activeSection.labelKey]
      : config.title;
  const pageDescription =
    (isTransaksiKas || isSaldoRekap || isBank) && activeSection
      ? activeSection.description
      : config.subtitle;

  const tabContent = activeSection ? (
    activeSection.id === "kas-masuk" ? (
      <CashTransactionTabCrud flowType="masuk" title={sectionLabels[activeSection.labelKey]} />
    ) : activeSection.id === "kas-keluar" ? (
      <CashTransactionTabCrud flowType="keluar" title={sectionLabels[activeSection.labelKey]} />
    ) : activeSection.id === "riwayat-transaksi" ? (
      <CashTransactionTabCrud flowType="riwayat" title={sectionLabels[activeSection.labelKey]} />
    ) : activeSection.id === "posisi-saldo" ? (
      <SaldoPosisiTab title={sectionLabels[activeSection.labelKey]} />
    ) : activeSection.id === "rekap-bulanan" ? (
      <SaldoRekapBulananTab title={sectionLabels[activeSection.labelKey]} />
    ) : activeSection.id === "buku-kas-besar" ? (
      <BukuKasBesarTab title={sectionLabels[activeSection.labelKey]} />
    ) : activeSection.id === "proyeksi-cashflow" ? (
      <ProyeksiCashflowTab title={sectionLabels[activeSection.labelKey]} />
    ) : activeSection.id === "rekening-bank" ? (
      <RekeningBankTab title={sectionLabels[activeSection.labelKey]} />
    ) : activeSection.id === "rekonsiliasi-bank" ? (
      <RekonsiliasiBankTab title={sectionLabels[activeSection.labelKey]} />
    ) : (
      <div className="mt-3 space-y-3">
        <Card variant="dashed" className="py-6 text-center sm:py-8">
          <CardTitle className="text-base sm:text-lg">
            {sectionLabels[activeSection.labelKey]}
          </CardTitle>
          <CardDescription className="mt-2">{activeSection.description}</CardDescription>
          <p className="mt-4 text-xs text-slate-400">Dalam pengembangan</p>
        </Card>
      </div>
    )
  ) : null;

  const tabsRow = (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1">
        {config.sections.length > 1 && (
          <CashBankSectionTabs
            sections={config.sections}
            labels={sectionLabels}
            activeId={activeTab}
            onChange={handleTabChange}
          />
        )}
      </div>
      {isYearScoped && <BudgetYearScopeBar compact className="shrink-0" />}
    </div>
  );

  return (
    <PageFrame title={pageTitle} description={pageDescription} className="[&_header]:mb-2">
      {isYearScoped ? (
        <>
          <div className="mb-2">{tabsRow}</div>
          <BudgetYearScopedContent>{tabContent}</BudgetYearScopedContent>
        </>
      ) : (
        <>
          {config.sections.length > 1 && (
            <CashBankSectionTabs
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
