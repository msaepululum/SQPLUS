import { apiFetch } from "@/services/api";
import type {
  BudgetPaguRevisiFormData,
  BudgetPaguRevisiListMeta,
  BudgetPaguRevisiMeta,
  BudgetPaguRevisiRow,
  BudgetPaguRevisiSummary,
  BudgetPaguRevisiTarget,
} from "@/types/budget-pagu-revisi";

type ApiTargetsResponse = { data: BudgetPaguRevisiTarget[] };
type ApiListResponse = {
  data: BudgetPaguRevisiRow[];
  summary: BudgetPaguRevisiSummary;
  meta: BudgetPaguRevisiListMeta;
};
type ApiMetaResponse = { data: BudgetPaguRevisiMeta };
type ApiItemResponse = { data: BudgetPaguRevisiRow; message?: string };

export class BudgetPaguRevisiApiError extends Error {
  errors?: Record<string, string[]>;

  constructor(message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = "BudgetPaguRevisiApiError";
    this.errors = errors;
  }
}

async function revisiFetch<T>(path: string, options?: RequestInit): Promise<T> {
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
    throw new BudgetPaguRevisiApiError(
      body.message ?? `API error: ${response.status}`,
      body.errors
    );
  }

  return body as T;
}

export async function fetchBudgetPaguRevisiMeta(): Promise<BudgetPaguRevisiMeta> {
  const res = await apiFetch<ApiMetaResponse>("/finance/budget-pagu-revisi/meta");
  return res.data;
}

export async function fetchBudgetPaguRevisiTargets(params: {
  budget_year_id: number;
  level?: string;
  ptk_id?: number | string;
  kelompok_belanja_id?: number | string;
  jenis_belanja_id?: number | string;
  search?: string;
}): Promise<BudgetPaguRevisiTarget[]> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  });
  const res = await revisiFetch<ApiTargetsResponse>(
    `/finance/budget-pagu-revisi/targets?${qs.toString()}`
  );
  return res.data;
}

export async function fetchBudgetPaguRevisions(params: {
  budget_year_id: number;
  status?: string;
  level?: string;
  ptk_id?: number | string;
  kelompok_belanja_id?: number | string;
  jenis_belanja_id?: number | string;
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<{
  rows: BudgetPaguRevisiRow[];
  summary: BudgetPaguRevisiSummary;
  meta: BudgetPaguRevisiListMeta;
}> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  });
  const res = await revisiFetch<ApiListResponse>(`/finance/budget-pagu-revisi?${qs.toString()}`);
  return { rows: res.data, summary: res.summary, meta: res.meta };
}

export async function createBudgetPaguRevision(
  form: BudgetPaguRevisiFormData
): Promise<BudgetPaguRevisiRow> {
  const res = await revisiFetch<ApiItemResponse>("/finance/budget-pagu-revisi", {
    method: "POST",
    body: JSON.stringify({
      ...form,
      pagu_sesudah: Number(form.pagu_sesudah.replace(/[^\d]/g, "") || "0"),
    }),
  });
  return res.data;
}

export async function updateBudgetPaguRevision(
  id: number,
  data: { pagu_sesudah?: string; alasan?: string }
): Promise<BudgetPaguRevisiRow> {
  const res = await revisiFetch<ApiItemResponse>(`/finance/budget-pagu-revisi/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...data,
      pagu_sesudah: data.pagu_sesudah
        ? Number(data.pagu_sesudah.replace(/[^\d]/g, "") || "0")
        : undefined,
    }),
  });
  return res.data;
}

export async function submitBudgetPaguRevision(id: number): Promise<string> {
  const res = await revisiFetch<ApiItemResponse>(`/finance/budget-pagu-revisi/${id}/submit`, {
    method: "POST",
  });
  return res.message ?? "Revisi pagu berhasil diajukan.";
}
