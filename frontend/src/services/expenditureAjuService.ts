import type {
  ExpenditureAjuDetail,
  ExpenditureAjuListResponse,
  ExpenditureAjuMeta,
  ExpenditureAjuRow,
} from "@/types/expenditure-aju";
import type { ExpenditureAjuProgressDashboard } from "@/types/expenditure-aju-monitoring";

async function expenditureAjuFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? (await import("@/utils/token")).getToken()
      : null;

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

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

export async function fetchExpenditureAjuMeta(
  budgetYearId?: number
): Promise<ExpenditureAjuMeta> {
  const qs = budgetYearId ? `?budget_year_id=${budgetYearId}` : "";
  const res = await expenditureAjuFetch<{ data: ExpenditureAjuMeta }>(
    `/finance/expenditure-aju/meta${qs}`
  );
  return res.data;
}

export async function fetchExpenditureAjuList(params: {
  budget_year_id: number;
  bulan?: number;
  ptk_id?: number;
  jenis_belanja_id?: number;
  status?: string;
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<ExpenditureAjuListResponse> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  });
  return expenditureAjuFetch<ExpenditureAjuListResponse>(
    `/finance/expenditure-aju?${qs.toString()}`
  );
}

export async function createExpenditureAju(payload: {
  budget_year_id: number;
  ksro_id: number;
  nama_aju: string;
  catatan?: string;
  total?: number;
}): Promise<ExpenditureAjuRow> {
  const res = await expenditureAjuFetch<{ data: ExpenditureAjuRow; message: string }>(
    "/finance/expenditure-aju",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  return res.data;
}

export async function fetchExpenditureAjuDetail(id: number): Promise<ExpenditureAjuDetail> {
  const res = await expenditureAjuFetch<{ data: ExpenditureAjuDetail }>(
    `/finance/expenditure-aju/${id}`
  );
  return res.data;
}

export async function fetchExpenditureAjuMonitoring(
  budgetYearId: number,
  scope: "own" | "all" = "own"
): Promise<ExpenditureAjuProgressDashboard> {
  const qs = new URLSearchParams({
    budget_year_id: String(budgetYearId),
    scope,
  });
  const res = await expenditureAjuFetch<{ data: ExpenditureAjuProgressDashboard }>(
    `/finance/expenditure-aju/monitoring?${qs.toString()}`
  );
  return res.data;
}
