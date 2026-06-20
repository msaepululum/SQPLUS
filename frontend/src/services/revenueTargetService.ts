import type { RevenueTargetRow, RevenueTargetSummary } from "@/types/revenue-target";

type ApiListResponse = {
  data: RevenueTargetRow[];
  summary: RevenueTargetSummary;
};

type ApiBulkResponse = ApiListResponse & { message: string };

async function revenueTargetFetch<T>(path: string, options?: RequestInit): Promise<T> {
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

  let body: { message?: string; errors?: Record<string, string[]> } = {};
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

export async function fetchRevenueTargets(budgetYearId: number): Promise<{
  rows: RevenueTargetRow[];
  summary: RevenueTargetSummary;
}> {
  const res = await revenueTargetFetch<ApiListResponse>(
    `/finance/revenue-targets?budget_year_id=${budgetYearId}`
  );
  return { rows: res.data, summary: res.summary };
}

export async function saveRevenueTargetsBulk(
  budgetYearId: number,
  items: { category_id: string; menjadi_amount: number }[]
): Promise<{ rows: RevenueTargetRow[]; summary: RevenueTargetSummary; message: string }> {
  const res = await revenueTargetFetch<ApiBulkResponse>("/finance/revenue-targets/bulk", {
    method: "POST",
    body: JSON.stringify({ budget_year_id: budgetYearId, items }),
  });
  return { rows: res.data, summary: res.summary, message: res.message };
}
