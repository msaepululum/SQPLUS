import { apiFetch } from "@/services/api";
import type {
  BudgetPaguDistribusiFormData,
  BudgetPaguDistribusiMeta,
  BudgetPaguDistribusiRow,
  BudgetPaguDistribusiSummary,
} from "@/types/budget-pagu-distribusi";

type ApiListResponse = {
  data: BudgetPaguDistribusiRow[];
  summary: BudgetPaguDistribusiSummary | null;
};
type ApiMetaResponse = { data: BudgetPaguDistribusiMeta };
type ApiItemResponse = { data: BudgetPaguDistribusiRow; message?: string };
type ApiMessageResponse = { message?: string };

export class BudgetPaguDistribusiApiError extends Error {
  errors?: Record<string, string[]>;

  constructor(message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = "BudgetPaguDistribusiApiError";
    this.errors = errors;
  }
}

async function distribusiFetch<T>(path: string, options?: RequestInit): Promise<T> {
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
    throw new BudgetPaguDistribusiApiError(
      body.message ?? `API error: ${response.status}`,
      body.errors
    );
  }

  return body as T;
}

export type BudgetPaguDistribusiMetaFilters = {
  tahun?: string;
  ptk_id?: string;
  kelompok_belanja_id?: string;
  jenis_belanja_id?: string;
};

function toQuery(filters: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchBudgetPaguDistribusiMeta(
  filters: BudgetPaguDistribusiMetaFilters = {}
): Promise<BudgetPaguDistribusiMeta> {
  const res = await apiFetch<ApiMetaResponse>(
    `/finance/budget-pagu-distribusi/meta${toQuery(filters)}`
  );
  return res.data;
}

export async function fetchBudgetPaguDistribusi(
  paguJenisBelanjaId: number,
  tahun?: string
): Promise<{ rows: BudgetPaguDistribusiRow[]; summary: BudgetPaguDistribusiSummary | null }> {
  const res = await apiFetch<ApiListResponse>(
    `/finance/budget-pagu-distribusi${toQuery({
      pagu_jenis_belanja_id: String(paguJenisBelanjaId),
      tahun,
    })}`
  );
  return { rows: res.data, summary: res.summary };
}

export async function createBudgetPaguDistribusi(
  form: BudgetPaguDistribusiFormData
): Promise<BudgetPaguDistribusiRow> {
  const res = await distribusiFetch<ApiItemResponse>("/finance/budget-pagu-distribusi", {
    method: "POST",
    body: JSON.stringify({
      pagu_jenis_belanja_id: Number(form.pagu_jenis_belanja_id),
      ksro_id: Number(form.ksro_id),
      total_pagu: Number(form.total_pagu.replace(/\D/g, "") || 0),
    }),
  });
  return res.data;
}

export async function updateBudgetPaguDistribusi(
  id: number,
  totalPagu: string
): Promise<BudgetPaguDistribusiRow> {
  const res = await distribusiFetch<ApiItemResponse>(
    `/finance/budget-pagu-distribusi/${id}`,
    {
      method: "PUT",
      body: JSON.stringify({
        total_pagu: Number(totalPagu.replace(/\D/g, "") || 0),
      }),
    }
  );
  return res.data;
}

export async function deleteBudgetPaguDistribusi(id: number): Promise<void> {
  await distribusiFetch<ApiMessageResponse>(`/finance/budget-pagu-distribusi/${id}`, {
    method: "DELETE",
  });
}
