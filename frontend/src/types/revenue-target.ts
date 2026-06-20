import type { RevenueCategoryId } from "@/constants/revenue-categories";

export type RevenueTargetRow = {
  category_id: RevenueCategoryId;
  kode: string;
  label: string;
  target_amount: number;
};

export type RevenueTargetSummary = {
  budget_year_id: number;
  tahun: number;
  total_target: number;
  jumlah_kategori: number;
};

export function formatRevenueTargetAmount(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Math.trunc(value));
}

export function parseRevenueTargetInput(value: string): number {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return 0;
  return Number(digits);
}

export function formatRevenueTargetInput(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "";
  return formatRevenueTargetAmount(value);
}
