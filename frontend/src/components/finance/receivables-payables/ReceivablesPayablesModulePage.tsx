"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { HutangDaftarTab } from "@/components/finance/receivables-payables/HutangDaftarTab";
import { HutangPerAkunTab } from "@/components/finance/receivables-payables/HutangPerAkunTab";
import { PiutangDaftarTab } from "@/components/finance/receivables-payables/PiutangDaftarTab";
import { PiutangUmurTab } from "@/components/finance/receivables-payables/PiutangUmurTab";
import { RekonHutangTab } from "@/components/finance/receivables-payables/RekonHutangTab";
import { RekonPiutangTab } from "@/components/finance/receivables-payables/RekonPiutangTab";
import { KlaimJknTab } from "@/components/finance/receivables-payables/KlaimJknTab";
import { RiwayatHutangPiutangTab } from "@/components/finance/receivables-payables/RiwayatHutangPiutangTab";
import { HutangJenisFilter } from "@/components/finance/receivables-payables/HutangJenisFilter";
import { HutangTahunPeriodeFilter } from "@/components/finance/receivables-payables/HutangTahunPeriodeFilter";
import { PiutangJenisFilter } from "@/components/finance/receivables-payables/PiutangJenisFilter";
import { ReceivablesPayablesSectionTabs } from "@/components/finance/receivables-payables/ReceivablesPayablesSectionTabs";
import {
  BudgetYearScopeBar,
  BudgetYearScopeProvider,
  BudgetYearScopedContent,
} from "@/components/finance/budget/BudgetYearScope";
import { PageFrame } from "@/components/layout/PageFrame";
import { useTranslation } from "@/components/providers/LocaleProvider";
import {
  getHutangJenis,
  getHutangTahunPeriode,
  resolveHutangJenisId,
  resolveHutangTahunPeriodeId,
  type HutangJenisId,
  type HutangTahunPeriodeId,
} from "@/constants/hutang-categories";
import {
  getPiutangJenis,
  resolvePiutangJenisId,
  type PiutangJenisId,
} from "@/constants/piutang-categories";
import type { ReceivablesPayablesModuleConfig } from "@/constants/receivables-payables-pages";

const HUTANG_FILTER_TABS = new Set(["daftar-hutang", "per-kode-akun"]);
const PIUTANG_JENIS_TABS = new Set(["daftar-piutang", "umur-piutang"]);

const YEAR_SCOPED_SLUGS = new Set(["hutang", "piutang", "klaim-jkn", "rekonsiliasi-riwayat"]);

type ReceivablesPayablesModulePageProps = {
  config: ReceivablesPayablesModuleConfig;
  initialTab?: string;
  initialJenis?: string;
  initialTahun?: string;
};

export function ReceivablesPayablesModulePage({
  config,
  initialTab,
  initialJenis,
  initialTahun,
}: ReceivablesPayablesModulePageProps) {
  const isYearScoped = YEAR_SCOPED_SLUGS.has(config.slug);

  const inner = (
    <ReceivablesPayablesModulePageInner
      config={config}
      initialTab={initialTab}
      initialJenis={initialJenis}
      initialTahun={initialTahun}
      isYearScoped={isYearScoped}
    />
  );

  if (!isYearScoped) {
    return inner;
  }

  return <BudgetYearScopeProvider>{inner}</BudgetYearScopeProvider>;
}

function ReceivablesPayablesModulePageInner({
  config,
  initialTab,
  initialJenis,
  initialTahun,
  isYearScoped,
}: ReceivablesPayablesModulePageProps & { isYearScoped: boolean }) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const jenisFromUrl = searchParams.get("jenis");
  const tahunFromUrl = searchParams.get("tahun");
  const defaultTab =
    config.sections.find((s) => s.id === (initialTab ?? tabFromUrl))?.id ??
    config.sections[0]?.id ??
    "";

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [activeHutangJenis, setActiveHutangJenis] = useState<HutangJenisId | "">(
    resolveHutangJenisId(initialJenis ?? jenisFromUrl)
  );
  const [activePiutangJenis, setActivePiutangJenis] = useState<PiutangJenisId | "">(
    resolvePiutangJenisId(initialJenis ?? jenisFromUrl)
  );
  const [activeTahunPeriode, setActiveTahunPeriode] = useState<HutangTahunPeriodeId | "">(
    resolveHutangTahunPeriodeId(initialTahun ?? tahunFromUrl)
  );

  useEffect(() => {
    const next =
      config.sections.find((s) => s.id === tabFromUrl)?.id ?? config.sections[0]?.id;
    if (next) setActiveTab(next);
  }, [tabFromUrl, config.sections]);

  useEffect(() => {
    if (jenisFromUrl) {
      setActiveHutangJenis(resolveHutangJenisId(jenisFromUrl));
      setActivePiutangJenis(resolvePiutangJenisId(jenisFromUrl));
    }
  }, [jenisFromUrl]);

  useEffect(() => {
    if (tahunFromUrl) setActiveTahunPeriode(resolveHutangTahunPeriodeId(tahunFromUrl));
  }, [tahunFromUrl]);

  const syncUrl = useCallback(
    (patch: { tab?: string; jenis?: string; tahun?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (patch.tab !== undefined) params.set("tab", patch.tab);
      if (patch.jenis !== undefined) {
        if (patch.jenis) params.set("jenis", patch.jenis);
        else params.delete("jenis");
      }
      if (patch.tahun !== undefined) {
        if (patch.tahun) params.set("tahun", patch.tahun);
        else params.delete("tahun");
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const handleTabChange = useCallback(
    (id: string) => {
      setActiveTab(id);
      syncUrl({ tab: id });
    },
    [syncUrl]
  );

  const handleHutangJenisChange = useCallback(
    (jenis: HutangJenisId | "") => {
      setActiveHutangJenis(jenis);
      syncUrl({ jenis });
    },
    [syncUrl]
  );

  const handlePiutangJenisChange = useCallback(
    (jenis: PiutangJenisId | "") => {
      setActivePiutangJenis(jenis);
      syncUrl({ jenis });
    },
    [syncUrl]
  );

  const handleTahunPeriodeChange = useCallback(
    (tahun: HutangTahunPeriodeId | "") => {
      setActiveTahunPeriode(tahun);
      syncUrl({ tahun });
    },
    [syncUrl]
  );

  const sectionLabels = Object.fromEntries(
    config.sections.map((section) => [section.labelKey, t(section.labelKey)])
  );

  const activeSection =
    config.sections.find((section) => section.id === activeTab) ?? config.sections[0];

  const showHutangFilters =
    config.slug === "hutang" && activeSection && HUTANG_FILTER_TABS.has(activeSection.id);
  const showPiutangJenisFilter =
    config.slug === "piutang" &&
    activeSection &&
    PIUTANG_JENIS_TABS.has(activeSection.id);

  const isKlaimJkn = config.slug === "klaim-jkn";

  const pageTitle =
    isKlaimJkn || !activeSection
      ? config.title
      : sectionLabels[activeSection.labelKey];
  const pageDescription = isKlaimJkn || !activeSection ? config.subtitle : activeSection.description;

  const tabContent = isKlaimJkn ? (
    <KlaimJknTab />
  ) : activeSection ? (
    activeSection.id === "daftar-hutang" ? (
      <HutangDaftarTab jenis={activeHutangJenis} periode={activeTahunPeriode} />
    ) : activeSection.id === "per-kode-akun" ? (
      <HutangPerAkunTab jenis={activeHutangJenis} periode={activeTahunPeriode} />
    ) : activeSection.id === "daftar-piutang" ? (
      <PiutangDaftarTab jenis={activePiutangJenis} />
    ) : activeSection.id === "umur-piutang" ? (
      <PiutangUmurTab jenis={activePiutangJenis} />
    ) : activeSection.id === "rekonsiliasi-hutang" ? (
      <RekonHutangTab jenis={activeHutangJenis} />
    ) : activeSection.id === "rekonsiliasi-piutang" ? (
      <RekonPiutangTab jenis={activePiutangJenis} />
    ) : activeSection.id === "riwayat" ? (
      <RiwayatHutangPiutangTab />
    ) : null
  ) : null;

  const tabsRow = (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
      {config.sections.length > 1 && (
        <div className="min-w-0 flex-1">
          <ReceivablesPayablesSectionTabs
            sections={config.sections}
            labels={sectionLabels}
            activeId={activeTab}
            onChange={handleTabChange}
          />
        </div>
      )}
      {isYearScoped && <BudgetYearScopeBar compact className="lg:mb-0.5 shrink-0 ml-auto" />}
    </div>
  );

  const filterRow =
    isYearScoped && (showHutangFilters || showPiutangJenisFilter) ? (
      <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-2 rounded-lg border border-slate-200/80 bg-slate-50/40 px-2.5 py-2">
        {showHutangFilters && (
          <>
            <HutangTahunPeriodeFilter
              value={activeTahunPeriode}
              onChange={handleTahunPeriodeChange}
            />
            <HutangJenisFilter value={activeHutangJenis} onChange={handleHutangJenisChange} />
          </>
        )}
        {showPiutangJenisFilter && (
          <PiutangJenisFilter value={activePiutangJenis} onChange={handlePiutangJenisChange} />
        )}
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
            <ReceivablesPayablesSectionTabs
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
