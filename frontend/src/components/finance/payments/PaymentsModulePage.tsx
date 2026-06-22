"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PaymentWorkflowTabCrud } from "@/components/finance/payments/PaymentWorkflowTabCrud";
import { PaymentsSectionTabs } from "@/components/finance/payments/PaymentsSectionTabs";
import {
  BudgetYearScopeBar,
  BudgetYearScopeProvider,
  BudgetYearScopedContent,
  BudgetYearToolbarFilter,
} from "@/components/finance/budget/BudgetYearScope";
import { PageFrame } from "@/components/layout/PageFrame";
import { useTranslation } from "@/components/providers/LocaleProvider";
import type { PaymentsModuleConfig } from "@/constants/payments-pages";
import {
  resolvePaymentWorkflowStageId,
  type PaymentWorkflowStageId,
} from "@/constants/payment-workflow";

const YEAR_SCOPED_SLUGS = new Set(["alur-pembayaran", "riwayat"]);

type PaymentsModulePageProps = {
  config: PaymentsModuleConfig;
  initialTab?: string;
};

const STAGE_TITLES: Record<PaymentWorkflowStageId, { title: string; description: string }> = {
  "belum-proses-tagihan": {
    title: "Belum Proses Tagihan",
    description:
      "Daftar penerimaan barang (INBELIH) yang belum masuk proses tukar faktur / rencana bayar.",
  },
  "permintaan-bayar": {
    title: "Permintaan Bayar",
    description: "Tukar faktur (TKRFKTR) yang baru dibuat — belum masuk rencana pembayaran.",
  },
  "rencana-bayar": {
    title: "Rencana Bayar",
    description: "Tukar faktur dengan detail rencana bayar aktif — menunggu verifikasi dan pencairan.",
  },
  "verifikasi-pajak": {
    title: "Verifikasi Pajak",
    description: "Detail tukar faktur yang menunggu verifikasi pajak (LTAX belum selesai).",
  },
  "pembayaran-selesai": {
    title: "Pembayaran Selesai",
    description:
      "Pembayaran yang sudah tercatat di BKU — terhubung ke nomor tukar faktur via penerimaan barang.",
  },
};

export function PaymentsModulePage({ config, initialTab }: PaymentsModulePageProps) {
  const isYearScoped = YEAR_SCOPED_SLUGS.has(config.slug);

  const inner = (
    <PaymentsModulePageInner config={config} initialTab={initialTab} isYearScoped={isYearScoped} />
  );

  if (!isYearScoped) {
    return inner;
  }

  return <BudgetYearScopeProvider>{inner}</BudgetYearScopeProvider>;
}

function PaymentsModulePageInner({
  config,
  initialTab,
  isYearScoped,
}: PaymentsModulePageProps & { isYearScoped: boolean }) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const resolvedInitial =
    resolvePaymentWorkflowStageId(initialTab ?? tabFromUrl) ||
    resolvePaymentWorkflowStageId(config.sections[0]?.id) ||
    "belum-proses-tagihan";

  const [activeTab, setActiveTab] = useState(resolvedInitial);

  useEffect(() => {
    const next =
      resolvePaymentWorkflowStageId(tabFromUrl) ||
      resolvePaymentWorkflowStageId(config.sections[0]?.id) ||
      "belum-proses-tagihan";
    setActiveTab(next);
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

  const stageId = resolvePaymentWorkflowStageId(activeSection?.id) as PaymentWorkflowStageId;
  const stageCopy = STAGE_TITLES[stageId] ?? {
    title: activeSection ? sectionLabels[activeSection.labelKey] : "",
    description: activeSection?.description ?? "",
  };

  const tabContent = activeSection ? (
    <div className="mt-3">
      <PaymentWorkflowTabCrud
        stage={stageId}
        title={stageCopy.title}
        description={stageCopy.description}
      />
    </div>
  ) : null;

  const tabsRow = (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
      <div className="min-w-0 flex-1">
        {config.sections.length > 1 && (
          <PaymentsSectionTabs
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
    </div>
  ) : null;

  return (
    <PageFrame title={config.title} description={config.subtitle}>
      {isYearScoped ? (
        <>
          {tabsRow}
          {filterRow}
          <BudgetYearScopedContent>{tabContent}</BudgetYearScopedContent>
        </>
      ) : (
        <>
          {config.sections.length > 1 && (
            <PaymentsSectionTabs
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
