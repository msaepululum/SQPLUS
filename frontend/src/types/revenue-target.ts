import type { RevenueCategoryId } from "@/constants/revenue-categories";

export type RevenueSetupStatus = "semula" | "pergeseran" | "perubahan";

export type RevenueSetupMeta = {
  setup_status: RevenueSetupStatus;
  semula_locked_at: string | null;
  pergeseran_opened_at: string | null;
  perubahan_opened_at: string | null;
  can_edit_semula: boolean;
  can_edit_pergeseran: boolean;
  can_edit_perubahan: boolean;
  can_advance: boolean;
  next_status_label: string | null;
};

export type RevenueTargetRow = {
  category_id: RevenueCategoryId;
  kode: string;
  label: string;
  semula_amount: number;
  pergeseran_amount: number;
  perubahan_amount: number;
  menjadi_amount: number;
  perubahan_pct: number | null;
};

export type RevenueTargetSummary = {
  budget_year_id: number;
  tahun: number;
  total_target: number;
  total_semula: number;
  total_pergeseran: number;
  total_perubahan: number;
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

export function formatRevenueSetupStatus(status: RevenueSetupStatus): string {
  switch (status) {
    case "semula":
      return "Input Semula";
    case "pergeseran":
      return "Pergeseran";
    case "perubahan":
      return "Perubahan";
    default:
      return status;
  }
}
