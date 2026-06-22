import type { RevenueAnalysisRow, RevenueAnalysisSummary } from "@/types/revenue-collect";

export type RevenueDashboardMonthlyTrend = {
  bulan: number;
  nama_bulan: string;
  rencana: number;
  realisasi: number;
};

export type RevenueDashboardData = {
  summary: RevenueAnalysisSummary;
  categories: RevenueAnalysisRow[];
  monthly_trend: RevenueDashboardMonthlyTrend[];
  updated_at: string | null;
};

export const REVENUE_CATEGORY_CHART_COLORS = [
  "#0d9488",
  "#0284c7",
  "#7c3aed",
  "#ea580c",
  "#ca8a04",
  "#db2777",
  "#4f46e5",
  "#64748b",
] as const;
