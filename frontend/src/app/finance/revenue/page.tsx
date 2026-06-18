import {
  RevenueSourceDonut,
  RevenueServiceBar,
  RevenueTrendLine,
} from "@/components/finance/revenue/RevenueDetailCharts";
import { RevenueDetailHeader } from "@/components/finance/revenue/RevenueDetailHeader";
import { RevenueDetailKpis } from "@/components/finance/revenue/RevenueDetailKpis";
import { RevenueDoctorTable } from "@/components/finance/revenue/RevenueDoctorTable";
import { RevenueInsights } from "@/components/finance/revenue/RevenueInsights";
import { RevenuePoliList } from "@/components/finance/revenue/RevenuePoliList";
import { Card } from "@/components/ui/Card";
import { CardGrid } from "@/components/ui/CardGrid";

export default function RevenueDetailPage() {
  return (
    <>
      <RevenueDetailHeader />

      <div className="mt-3 space-y-4 sm:space-y-5">
        <RevenueDetailKpis />

        <CardGrid cols={3}>
          <RevenueSourceDonut />
          <RevenueServiceBar />
          <RevenueTrendLine />
        </CardGrid>

        <CardGrid cols={3}>
          <RevenuePoliList />
          <RevenueDoctorTable />
          <RevenueInsights />
        </CardGrid>

        <Card variant="flat" className="flex flex-col items-center justify-center gap-1 text-center text-xs text-slate-400 sm:flex-row sm:gap-2">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Data diperbarui terakhir: <strong className="text-slate-600">21 Mei 2025 08:30 WIB</strong>
        </Card>
      </div>
    </>
  );
}
