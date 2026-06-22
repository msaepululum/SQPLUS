"use client";

import Link from "next/link";
import { LineChartDual } from "@/components/beranda/BerandaCharts";
import { MainSummaryKpis } from "@/components/finance/dashboard/main-summary/MainSummaryKpis";
import { MainSummaryInsights } from "@/components/finance/dashboard/main-summary/MainSummaryInsights";
import {
  MonthlyTrendChart,
} from "@/components/finance/dashboard/main-summary/MainSummaryCharts";
import { PageFrame } from "@/components/layout/PageFrame";
import { Card, cardClassName, CardDescription, CardTitle } from "@/components/ui/Card";
import { EXECUTIVE_INSIGHT_SUB_NAV } from "@/constants/executive-insight-navigation";
import { EI_TREN_PENDAPATAN } from "@/constants/executive-insight-data";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { BarChart3, ChevronRight } from "lucide-react";

export function ExecutiveInsightDashboard() {
  const { t } = useTranslation();
  const categories = EXECUTIVE_INSIGHT_SUB_NAV.filter(
    (item) => item.href !== "/finance/executive-insight"
  );
  const d = EI_TREN_PENDAPATAN;

  return (
    <PageFrame
      title="Ringkasan Utama"
      description="Dashboard eksekutif kinerja keuangan rumah sakit untuk pimpinan dan dewan pengawas"
    >
      <MainSummaryKpis />

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-3">
        <MonthlyTrendChart />
        <div className={cardClassName({ variant: "default", className: "!p-3.5" })}>
          <h3 className="text-xs font-semibold text-slate-800">Snapshot Kinerja</h3>
          <p className="mt-0.5 text-[0.5625rem] text-slate-400">Tren 6 bulan terakhir</p>
          <div className="mt-2">
            <LineChartDual
              months={d.months}
              seriesA={d.pendapatan}
              seriesB={d.belanja}
              labelA="Pendapatan"
              labelB="Belanja"
              colorA="#3b82f6"
              colorB="#f97316"
              max={200}
            />
          </div>
        </div>
        <MainSummaryInsights />
      </div>

      <div className="mt-3">
        <div className="mb-2 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-[#0d6e63]" />
          <h3 className="text-sm font-semibold text-slate-800">Analitik per Domain</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {categories.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={cardClassName({
                  variant: "default",
                  className: "group h-full transition-shadow hover:shadow-md",
                })}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm group-hover:text-[#0d6e63]">
                      {t(item.labelKey)}
                    </CardTitle>
                    <CardDescription className="mt-1.5 text-xs">
                      Grafik, insight, dan detail analitik
                    </CardDescription>
                  </div>
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#0d6e63]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageFrame>
  );
}
