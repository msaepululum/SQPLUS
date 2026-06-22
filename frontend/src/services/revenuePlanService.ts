import type {
  RevenueMonthlyPlanRow,
  RevenueMonthlyPlanSummary,
  RevenuePlanRow,
  RevenuePlanSummary,
} from "@/types/revenue-plan";

type ApiPlanListResponse = {
  ready: boolean;
  data: RevenuePlanRow[];
  summary: RevenuePlanSummary;
};

type ApiMonthlyListResponse = ApiPlanListResponse & {
  data: RevenueMonthlyPlanRow[];
  summary: RevenueMonthlyPlanSummary;
  bulan_labels: Record<number, string>;
};

type ApiMutationResponse<T> = T & { message: string };

async function revenuePlanFetch<T>(path: string, options?: RequestInit): Promise<T> {
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

export async function fetchRevenuePlans(budgetYearId: number): Promise<{
  ready: boolean;
  rows: RevenuePlanRow[];
  summary: RevenuePlanSummary;
}> {
  const res = await revenuePlanFetch<ApiPlanListResponse>(
    `/finance/revenue-plans?budget_year_id=${budgetYearId}`
  );
  return { ready: res.ready, rows: res.data, summary: res.summary };
}

export async function saveRevenuePlansBulk(
  budgetYearId: number,
  items: { category_id: string; rencana_amount: number }[]
): Promise<{
  ready: boolean;
  rows: RevenuePlanRow[];
  summary: RevenuePlanSummary;
  message: string;
}> {
  const res = await revenuePlanFetch<ApiMutationResponse<ApiPlanListResponse>>(
    "/finance/revenue-plans/bulk",
    {
      method: "POST",
      body: JSON.stringify({ budget_year_id: budgetYearId, items }),
    }
  );
  return {
    ready: res.ready,
    rows: res.data,
    summary: res.summary,
    message: res.message,
  };
}

export async function fetchRevenueMonthlyPlans(
  budgetYearId: number,
  categoryId?: string
): Promise<{
  ready: boolean;
  rows: RevenueMonthlyPlanRow[];
  summary: RevenueMonthlyPlanSummary;
}> {
  const params = new URLSearchParams({ budget_year_id: String(budgetYearId) });
  if (categoryId) params.set("category_id", categoryId);

  const res = await revenuePlanFetch<ApiMonthlyListResponse>(
    `/finance/revenue-monthly-plans?${params.toString()}`
  );
  return { ready: res.ready, rows: res.data, summary: res.summary };
}

export async function saveRevenueMonthlyPlansBulk(
  budgetYearId: number,
  items: { category_id: string; bulan: number; plan_amount: number }[]
): Promise<{
  ready: boolean;
  rows: RevenueMonthlyPlanRow[];
  summary: RevenueMonthlyPlanSummary;
  message: string;
}> {
  const res = await revenuePlanFetch<ApiMutationResponse<ApiMonthlyListResponse>>(
    "/finance/revenue-monthly-plans/bulk",
    {
      method: "POST",
      body: JSON.stringify({ budget_year_id: budgetYearId, items }),
    }
  );
  return {
    ready: res.ready,
    rows: res.data,
    summary: res.summary,
    message: res.message,
  };
}
