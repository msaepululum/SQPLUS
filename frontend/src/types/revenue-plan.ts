import type { RevenueCategoryId } from "@/constants/revenue-categories";

export type RevenuePlanRow = {
  category_id: RevenueCategoryId;
  kode: string;
  label: string;
  target_amount: number;
  rencana_amount: number;
  selisih_amount: number;
};

export type RevenuePlanSummary = {
  budget_year_id: number;
  tahun: number;
  total_target: number;
  total_rencana: number;
  total_selisih: number;
  jumlah_kategori: number;
};

export type RevenueMonthlyPlanMonth = {
  bulan: number;
  nama_bulan: string;
  rencana: number;
};

export type RevenueMonthlyPlanRow = {
  category_id: RevenueCategoryId;
  kode: string;
  label: string;
  rencana_tahunan: number;
  months: RevenueMonthlyPlanMonth[];
  total_bulan: number;
  selisih: number;
};

export type RevenueMonthlyPlanSummary = {
  budget_year_id: number;
  tahun: number;
  jumlah_kategori: number;
  total_rencana_tahunan: number;
  total_distribusi: number;
  total_selisih: number;
  months: RevenueMonthlyPlanMonth[];
};

export const REVENUE_MONTH_NAMES = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
] as const;

export const REVENUE_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
