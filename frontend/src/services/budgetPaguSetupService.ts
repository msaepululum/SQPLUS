import { apiFetch } from "@/services/api";
import type {
  BudgetPaguSetupFormData,
  BudgetPaguSetupMeta,
  BudgetPaguSetupRow,
} from "@/types/budget-pagu-setup";

type ApiListResponse = { data: BudgetPaguSetupRow[] };
type ApiMetaResponse = { data: BudgetPaguSetupMeta };
type ApiItemResponse = { data: BudgetPaguSetupRow; message?: string };
type ApiMessageResponse = { message?: string };

export class BudgetPaguSetupApiError extends Error {
  errors?: Record<string, string[]>;

  constructor(message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = "BudgetPaguSetupApiError";
    this.errors = errors;
  }
}

async function paguSetupFetch<T>(path: string, options?: RequestInit): Promise<T> {
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
    throw new BudgetPaguSetupApiError(
      body.message ?? `API error: ${response.status}`,
      body.errors
    );
  }

  return body as T;
}

export type BudgetPaguSetupFilters = {
  tahun?: string;
  ptk_id?: string;
  kelompok_belanja_id?: string;
  jenis_belanja_id?: string;
};

function toQuery(filters: BudgetPaguSetupFilters): string {
  const params = new URLSearchParams();
  if (filters.tahun) params.set("tahun", filters.tahun);
  if (filters.ptk_id) params.set("ptk_id", filters.ptk_id);
  if (filters.kelompok_belanja_id) params.set("kelompok_belanja_id", filters.kelompok_belanja_id);
  if (filters.jenis_belanja_id) params.set("jenis_belanja_id", filters.jenis_belanja_id);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function toPayload(form: BudgetPaguSetupFormData) {
  return {
    tahun: form.tahun.trim(),
    ptk_id: Number(form.ptk_id),
    kelompok_belanja_id: Number(form.kelompok_belanja_id),
    jenis_belanja_id: Number(form.jenis_belanja_id),
    total_pagu: Number(form.total_pagu.replace(/\D/g, "") || 0),
  };
}

export async function fetchBudgetPaguSetupMeta(): Promise<BudgetPaguSetupMeta> {
  const res = await apiFetch<ApiMetaResponse>("/finance/budget-pagu-setup/meta");
  return res.data;
}

export async function fetchBudgetPaguSetup(
  filters: BudgetPaguSetupFilters = {}
): Promise<BudgetPaguSetupRow[]> {
  const res = await apiFetch<ApiListResponse>(
    `/finance/budget-pagu-setup${toQuery(filters)}`
  );
  return res.data;
}

export async function createBudgetPaguSetup(
  form: BudgetPaguSetupFormData
): Promise<BudgetPaguSetupRow> {
  const res = await paguSetupFetch<ApiItemResponse>("/finance/budget-pagu-setup", {
    method: "POST",
    body: JSON.stringify(toPayload(form)),
  });
  return res.data;
}

export async function updateBudgetPaguSetup(
  id: number,
  totalPagu: string
): Promise<BudgetPaguSetupRow> {
  const res = await paguSetupFetch<ApiItemResponse>(`/finance/budget-pagu-setup/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      total_pagu: Number(totalPagu.replace(/\D/g, "") || 0),
    }),
  });
  return res.data;
}

export async function deleteBudgetPaguSetup(id: number): Promise<void> {
  await paguSetupFetch<ApiMessageResponse>(`/finance/budget-pagu-setup/${id}`, {
    method: "DELETE",
  });
}
