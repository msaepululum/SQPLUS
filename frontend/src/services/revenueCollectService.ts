import type {
  RevenueAnalysisRow,
  RevenueAnalysisSummary,
  RevenueImportBatchRow,
  RevenueRealizationRow,
  RevenueRealizationSummary,
  RevenueRecapBulananRow,
  RevenueRecapHarianRow,
  RevenueReconciliationRow,
  RevenueReconciliationSummary,
} from "@/types/revenue-collect";

import type { RevenueDashboardData } from "@/types/revenue-dashboard";

async function revenueCollectFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? (await import("@/utils/token")).getToken()
      : null;

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  let body: { message?: string } = {};
  try {
    body = (await response.json()) as typeof body;
  } catch {
    // ignore
  }

  if (!response.ok) {
    throw new Error(body.message ?? `API error: ${response.status}`);
  }

  return body as T;
}

function toQuery(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") q.set(key, String(value));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

// --- Realizations ---

export async function fetchRevenueRealizations(
  budgetYearId: number,
  filters: { category_id?: string; tanggal_from?: string; tanggal_to?: string } = {}
): Promise<{ rows: RevenueRealizationRow[]; summary: RevenueRealizationSummary }> {
  const res = await revenueCollectFetch<{
    data: RevenueRealizationRow[];
    summary: RevenueRealizationSummary;
  }>(
    `/finance/revenue-realizations${toQuery({
      budget_year_id: budgetYearId,
      ...filters,
    })}`
  );
  return { rows: res.data, summary: res.summary };
}

export async function createRevenueRealization(payload: {
  budget_year_id: number;
  category_id: string;
  tanggal: string;
  amount: number;
  reference_note?: string;
}): Promise<RevenueRealizationRow> {
  const res = await revenueCollectFetch<{ data: RevenueRealizationRow; message: string }>(
    "/finance/revenue-realizations",
    { method: "POST", body: JSON.stringify(payload) }
  );
  return res.data;
}

export async function updateRevenueRealization(
  id: number,
  payload: Partial<{
    category_id: string;
    tanggal: string;
    amount: number;
    reference_note: string | null;
  }>
): Promise<RevenueRealizationRow> {
  const res = await revenueCollectFetch<{ data: RevenueRealizationRow; message: string }>(
    `/finance/revenue-realizations/${id}`,
    { method: "PATCH", body: JSON.stringify(payload) }
  );
  return res.data;
}

export async function deleteRevenueRealization(id: number): Promise<void> {
  await revenueCollectFetch<{ message: string }>(`/finance/revenue-realizations/${id}`, {
    method: "DELETE",
  });
}

export async function fetchRevenueRecapHarian(
  budgetYearId: number,
  filters: { tanggal_from?: string; tanggal_to?: string; category_id?: string } = {}
): Promise<{ rows: RevenueRecapHarianRow[]; summary: Record<string, unknown> }> {
  const res = await revenueCollectFetch<{
    data: RevenueRecapHarianRow[];
    summary: Record<string, unknown>;
  }>(
    `/finance/revenue-realizations/recap-harian${toQuery({
      budget_year_id: budgetYearId,
      ...filters,
    })}`
  );
  return { rows: res.data, summary: res.summary };
}

export async function fetchRevenueRecapBulanan(
  budgetYearId: number,
  filters: { bulan?: number; category_id?: string } = {}
): Promise<{ rows: RevenueRecapBulananRow[]; summary: Record<string, unknown> }> {
  const res = await revenueCollectFetch<{
    data: RevenueRecapBulananRow[];
    summary: Record<string, unknown>;
  }>(
    `/finance/revenue-realizations/recap-bulanan${toQuery({
      budget_year_id: budgetYearId,
      ...filters,
    })}`
  );
  return { rows: res.data, summary: res.summary };
}

// --- Import ---

export async function fetchRevenueImports(budgetYearId: number): Promise<{
  rows: RevenueImportBatchRow[];
  summary: Record<string, unknown>;
}> {
  const res = await revenueCollectFetch<{
    data: RevenueImportBatchRow[];
    summary: Record<string, unknown>;
  }>(`/finance/revenue-imports?budget_year_id=${budgetYearId}`);
  return { rows: res.data, summary: res.summary };
}

export async function runRevenueImport(payload: {
  budget_year_id: number;
  periode_from: string;
  periode_to: string;
  source_system?: string;
}): Promise<{ message: string; rows: RevenueImportBatchRow[] }> {
  const res = await revenueCollectFetch<{
    message: string;
    data: RevenueImportBatchRow[];
  }>("/finance/revenue-imports", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return { message: res.message, rows: res.data };
}

// --- Dashboard ---

export async function fetchRevenueDashboard(
  budgetYearId: number,
  filters: { bulan?: number; category_id?: string } = {}
): Promise<RevenueDashboardData> {
  return revenueCollectFetch<RevenueDashboardData>(
    `/finance/revenue-dashboard${toQuery({
      budget_year_id: budgetYearId,
      bulan: filters.bulan,
      category_id: filters.category_id,
    })}`
  );
}

// --- Analysis ---

export async function fetchRevenueAnalysis(
  budgetYearId: number,
  bulan?: number
): Promise<{ rows: RevenueAnalysisRow[]; summary: RevenueAnalysisSummary }> {
  const res = await revenueCollectFetch<{
    data: RevenueAnalysisRow[];
    summary: RevenueAnalysisSummary;
  }>(
    `/finance/revenue-analysis/per-kategori${toQuery({
      budget_year_id: budgetYearId,
      bulan,
    })}`
  );
  return { rows: res.data, summary: res.summary };
}

// --- Reconciliation ---

export async function fetchRevenueReconciliations(
  budgetYearId: number,
  bulan: number
): Promise<{ rows: RevenueReconciliationRow[]; summary: RevenueReconciliationSummary }> {
  const res = await revenueCollectFetch<{
    data: RevenueReconciliationRow[];
    summary: RevenueReconciliationSummary;
  }>(
    `/finance/revenue-reconciliations${toQuery({
      budget_year_id: budgetYearId,
      bulan,
    })}`
  );
  return { rows: res.data, summary: res.summary };
}

export async function saveRevenueReconciliationsBulk(
  budgetYearId: number,
  bulan: number,
  items: {
    category_id: string;
    akuntansi_amount: number;
    status?: string;
    catatan?: string | null;
  }[]
): Promise<{
  rows: RevenueReconciliationRow[];
  summary: RevenueReconciliationSummary;
  message: string;
}> {
  const res = await revenueCollectFetch<{
    data: RevenueReconciliationRow[];
    summary: RevenueReconciliationSummary;
    message: string;
  }>("/finance/revenue-reconciliations/bulk", {
    method: "POST",
    body: JSON.stringify({ budget_year_id: budgetYearId, bulan, items }),
  });
  return { rows: res.data, summary: res.summary, message: res.message };
}
