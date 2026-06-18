import { MainSummaryKpis } from "@/components/finance/dashboard/main-summary/MainSummaryKpis";
import {
  BudgetGroupBarChart,
  CashInOutChart,
  MonthlyTrendChart,
} from "@/components/finance/dashboard/main-summary/MainSummaryCharts";
import {
  ExpenseRealizationTable,
  MonthlyRevenueTable,
  RevenueCompositionCard,
  SideSummaryTables,
  UnitExpenseBarChart,
} from "@/components/finance/dashboard/main-summary/MainSummaryDetails";
import { MainSummaryInsights } from "@/components/finance/dashboard/main-summary/MainSummaryInsights";

export function MainSummaryDashboard() {
  return (
    <div className="space-y-3">
      <MainSummaryKpis />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <MonthlyTrendChart />
        <BudgetGroupBarChart />
        <CashInOutChart />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-12">
        <div className="xl:col-span-2">
          <RevenueCompositionCard />
        </div>
        <div className="xl:col-span-2">
          <UnitExpenseBarChart />
        </div>
        <div className="xl:col-span-3">
          <MonthlyRevenueTable />
        </div>
        <div className="xl:col-span-3">
          <ExpenseRealizationTable />
        </div>
        <div className="xl:col-span-2">
          <SideSummaryTables />
        </div>
      </div>

      <MainSummaryInsights />
    </div>
  );
}
