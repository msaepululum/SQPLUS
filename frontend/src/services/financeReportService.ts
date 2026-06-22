import type { FinanceReportDashboardData } from "@/types/finance-reports";

async function reportFetch<T>(path: string): Promise<T> {
  const token =
    typeof window !== "undefined" ? (await import("@/utils/token")).getToken() : null;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

function q(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export async function fetchFinanceReportDashboard(
  budgetYearId: number,
  bulan?: number
): Promise<FinanceReportDashboardData> {
  const res = await reportFetch<{ data: FinanceReportDashboardData }>(
    `/finance/reports/dashboard${q({ budget_year_id: budgetYearId, bulan })}`
  );
  return res.data;
}
