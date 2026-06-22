import type {
  FinanceTaxDashboard,
  FinanceTaxListResponse,
  FinanceTaxMeta,
  TaxStageId,
} from "@/types/finance-tax";

async function taxFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token =
    typeof window !== "undefined" ? (await import("@/utils/token")).getToken() : null;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
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

export async function fetchFinanceTaxMeta(budgetYearId?: number): Promise<FinanceTaxMeta> {
  const qs = budgetYearId ? `?budget_year_id=${budgetYearId}` : "";
  const res = await taxFetch<{ data: FinanceTaxMeta }>(`/finance/tax/meta${qs}`);
  return res.data;
}

export async function fetchFinanceTaxDashboard(
  budgetYearId: number,
  bulan?: number
): Promise<FinanceTaxDashboard> {
  const qs = new URLSearchParams({ budget_year_id: String(budgetYearId) });
  if (bulan) qs.set("bulan", String(bulan));
  const res = await taxFetch<{ data: FinanceTaxDashboard }>(
    `/finance/tax/dashboard?${qs.toString()}`
  );
  return res.data;
}

export async function fetchFinanceTaxList(params: {
  budget_year_id: number;
  stage: TaxStageId;
  bulan?: number;
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<FinanceTaxListResponse> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  });
  return taxFetch(`/finance/tax?${qs.toString()}`);
}
