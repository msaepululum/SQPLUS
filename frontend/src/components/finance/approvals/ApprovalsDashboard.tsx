"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ApprovalJenisFilter } from "@/components/finance/approvals/ApprovalJenisFilter";
import {
  BudgetYearScopeBar,
  BudgetYearScopeProvider,
  BudgetYearScopedContent,
  BudgetYearToolbarFilter,
} from "@/components/finance/budget/BudgetYearScope";
import { PageFrame } from "@/components/layout/PageFrame";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { Card, CardDescription, CardTitle, cardClassName } from "@/components/ui/Card";
import {
  getApprovalJenis,
  resolveApprovalJenisId,
  type ApprovalJenisId,
} from "@/constants/approval-categories";
import { APPROVALS_SUB_NAV } from "@/constants/approvals-navigation";

const INBOX_KPIS = [
  { label: "Menunggu Approval", value: "—", tone: "text-amber-600" },
  { label: "Disetujui Hari Ini", value: "—", tone: "text-emerald-600" },
  { label: "Ditolak / Dikembalikan", value: "—", tone: "text-red-600" },
  { label: "Delegasi Aktif", value: "—", tone: "text-slate-600" },
];

function ApprovalsInboxInner() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const jenisFromUrl = searchParams.get("jenis");
  const [activeJenis, setActiveJenis] = useState<ApprovalJenisId | "">(
    resolveApprovalJenisId(jenisFromUrl)
  );

  const handleJenisChange = useCallback(
    (jenis: ApprovalJenisId | "") => {
      setActiveJenis(jenis);
      const params = new URLSearchParams(searchParams.toString());
      if (jenis) params.set("jenis", jenis);
      else params.delete("jenis");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const categories = APPROVALS_SUB_NAV.filter((item) => item.href !== "/finance/approvals");

  return (
    <PageFrame
      title="Inbox Approval"
      description="Antrian terpusat dokumen keuangan yang menunggu persetujuan Anda"
    >
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-end">
        <BudgetYearScopeBar compact className="lg:mb-0" />
      </div>
      <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-2 rounded-lg border border-slate-200/80 bg-slate-50/40 px-2.5 py-2">
        <BudgetYearToolbarFilter />
        <ApprovalJenisFilter value={activeJenis} onChange={handleJenisChange} />
      </div>

      <BudgetYearScopedContent>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {INBOX_KPIS.map((kpi) => (
            <Card key={kpi.label} variant="default" className="!p-4">
              <p className="text-xs text-slate-500">{kpi.label}</p>
              <p className={`mt-1 text-lg font-semibold ${kpi.tone}`}>{kpi.value}</p>
            </Card>
          ))}
        </div>

        {activeJenis && (
          <p className="mt-3 text-xs text-slate-500">
            Filter jenis:{" "}
            <strong className="text-slate-700">{t(getApprovalJenis(activeJenis).labelKey)}</strong>
          </p>
        )}

        <Card variant="dashed" className="mt-3 py-8 text-center sm:py-10">
          <CardTitle className="text-base sm:text-lg">Daftar Antrian Approval</CardTitle>
          <CardDescription className="mt-2">
            Semua jenis approval — anggaran, belanja, pembayaran, dan jurnal — dalam satu inbox.
          </CardDescription>
          <p className="mt-4 text-xs text-slate-400">Dalam pengembangan</p>
        </Card>

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
                <CardDescription className="mt-1.5 text-xs">Buka antrian per domain</CardDescription>
              </div>
            </Link>
          ))}
        </div>
      </BudgetYearScopedContent>
    </PageFrame>
  );
}

export function ApprovalsDashboard() {
  return (
    <BudgetYearScopeProvider>
      <ApprovalsInboxInner />
    </BudgetYearScopeProvider>
  );
}
