import { apiFetch } from "@/services/api";
import type {
  BudgetPaguPergeseranFormData,
  BudgetPaguPergeseranListMeta,
  BudgetPaguPergeseranMeta,
  BudgetPaguPergeseranRow,
  BudgetPaguPergeseranSummary,
  BudgetPaguPergeseranTarget,
} from "@/types/budget-pagu-pergeseran";

type ApiTargetsResponse = { data: BudgetPaguPergeseranTarget[] };
type ApiListResponse = {
  data: BudgetPaguPergeseranRow[];
  summary: BudgetPaguPergeseranSummary;
  meta: BudgetPaguPergeseranListMeta;
};
type ApiMetaResponse = { data: BudgetPaguPergeseranMeta };
type ApiItemResponse = { data: { id: number }; message?: string };

export class BudgetPaguPergeseranApiError extends Error {
  errors?: Record<string, string[]>;

  constructor(message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = "BudgetPaguPergeseranApiError";
    this.errors = errors;
  }
}

async function pergeseranFetch<T>(path: string, options?: RequestInit): Promise<T> {
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
    throw new BudgetPaguPergeseranApiError(
      body.message ?? `API error: ${response.status}`,
      body.errors
    );
  }

  return body as T;
}

export async function fetchBudgetPaguPergeseranMeta(): Promise<BudgetPaguPergeseranMeta> {
  const res = await apiFetch<ApiMetaResponse>("/finance/budget-pagu-pergeseran/meta");
  return res.data;
}

export async function fetchBudgetPaguPergeseranTargets(params: {
  budget_year_id: number;
  level?: string;
  ptk_id?: number | string;
  kelompok_belanja_id?: number | string;
  jenis_belanja_id?: number | string;
  pagu_jenis_belanja_id?: number | string;
  search?: string;
}): Promise<BudgetPaguPergeseranTarget[]> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  });
  const res = await pergeseranFetch<ApiTargetsResponse>(
    `/finance/budget-pagu-pergeseran/targets?${qs.toString()}`
  );
  return res.data;
}

export async function fetchBudgetPaguPergeseran(params: {
  budget_year_id: number;
  status?: string;
  level?: string;
  ptk_id?: number | string;
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<{
  rows: BudgetPaguPergeseranRow[];
  summary: BudgetPaguPergeseranSummary;
  meta: BudgetPaguPergeseranListMeta;
}> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  });
  const res = await pergeseranFetch<ApiListResponse>(
    `/finance/budget-pagu-pergeseran?${qs.toString()}`
  );
  return { rows: res.data, summary: res.summary, meta: res.meta };
}

export async function createBudgetPaguPergeseran(
  form: BudgetPaguPergeseranFormData
): Promise<number> {
  const res = await pergeseranFetch<ApiItemResponse>("/finance/budget-pagu-pergeseran", {
    method: "POST",
    body: JSON.stringify({
      ...form,
      nominal: Number(form.nominal.replace(/[^\d]/g, "") || "0"),
    }),
  });
  return res.data.id;
}

export async function submitBudgetPaguPergeseran(id: number): Promise<string> {
  const res = await pergeseranFetch<ApiItemResponse>(
    `/finance/budget-pagu-pergeseran/${id}/submit`,
    { method: "POST" }
  );
  return res.message ?? "Pergeseran pagu berhasil diajukan.";
}
