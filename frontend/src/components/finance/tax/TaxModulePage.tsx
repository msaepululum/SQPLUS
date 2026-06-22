"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TaxTabCrud } from "@/components/finance/tax/TaxTabCrud";
import { TaxSectionTabs } from "@/components/finance/tax/TaxSectionTabs";
import {
  BudgetYearScopeBar,
  BudgetYearScopeProvider,
  BudgetYearScopedContent,
  BudgetYearToolbarFilter,
} from "@/components/finance/budget/BudgetYearScope";
import { PageFrame } from "@/components/layout/PageFrame";
import { useTranslation } from "@/components/providers/LocaleProvider";
import type { TaxModuleConfig } from "@/constants/tax-pages";
import type { TaxStageId } from "@/types/finance-tax";

const STAGE_COPY: Record<TaxStageId, { title: string; description: string }> = {
  "antrian-verifikasi": {
    title: "Antrian Verifikasi Pajak",
    description: "Faktur detail dengan LTAX belum selesai — perlu verifikasi keuangan/pajak.",
  },
  "tagihan-pembelian": {
    title: "Pajak Tagihan Pembelian",
    description: "Perhitungan DPP, PPN, PPh 22/23 pada penerimaan barang (INBELIH).",
  },
  "tukar-faktur": {
    title: "Pajak Tukar Faktur",
    description: "Agregat pajak per nomor tukar faktur beserta jumlah detail belum diverifikasi.",
  },
  "detail-perhitungan": {
    title: "Detail Perhitungan Pajak",
    description: "Rincian per faktur: DPP, PPN (BYR_PPN), PPh 22, PPh 23, tarif efektif, total pajak.",
  },
  "setoran-pajak": {
    title: "Setoran Pajak",
    description: "Transaksi BKU terkait PPN/PPh — bukti setoran pajak.",
  },
  "pajak-pengajuan": {
    title: "Pajak Pengajuan Belanja",
    description: "PPN pada rincian pengajuan belanja (perencanaan) dari database FINANCE.",
  },
  "rekap-bulanan": {
    title: "Rekap Bulanan Pajak",
    description: "Ringkasan PPN, PPh, dan setoran per bulan dalam tahun anggaran.",
  },
};

type TaxModulePageProps = {
  config: TaxModuleConfig;
  initialTab?: string;
};

export function TaxModulePage({ config, initialTab }: TaxModulePageProps) {
  return (
    <BudgetYearScopeProvider>
      <TaxModulePageInner config={config} initialTab={initialTab} />
    </BudgetYearScopeProvider>
  );
}

function TaxModulePageInner({ config, initialTab }: TaxModulePageProps) {
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
    const next = config.sections.find((s) => s.id === tabFromUrl)?.id ?? config.sections[0]?.id;
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
    config.sections.map((s) => [s.labelKey, t(s.labelKey)])
  );
  const activeSection = config.sections.find((s) => s.id === activeTab) ?? config.sections[0];
  const stageId = (activeSection?.id ?? "antrian-verifikasi") as TaxStageId;
  const copy = STAGE_COPY[stageId];

  return (
    <PageFrame title={config.title} description={config.subtitle}>
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
        <div className="min-w-0 flex-1">
          {config.sections.length > 1 && (
            <TaxSectionTabs
              sections={config.sections}
              labels={sectionLabels}
              activeId={activeTab}
              onChange={handleTabChange}
            />
          )}
        </div>
        <BudgetYearScopeBar compact className="lg:mb-0.5" />
      </div>
      <div className="mt-2 rounded-lg border border-slate-200/80 bg-slate-50/40 px-2.5 py-2">
        <BudgetYearToolbarFilter />
      </div>
      <BudgetYearScopedContent>
        <div className="mt-3">
          <TaxTabCrud stage={stageId} title={copy.title} description={copy.description} />
        </div>
      </BudgetYearScopedContent>
    </PageFrame>
  );
}
