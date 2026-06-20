import { apiFetch } from "@/services/api";
import type {
  BudgetBlokirAnggaranListMeta,
  BudgetBlokirAnggaranMeta,
  BudgetBlokirAnggaranRow,
  BudgetBlokirAnggaranSummary,
  BudgetBlokirFormData,
  BudgetBlokirHistoriRow,
} from "@/types/budget-blokir-anggaran";

type ApiListResponse = {
  data: BudgetBlokirAnggaranRow[];
  summary: BudgetBlokirAnggaranSummary;
  meta: BudgetBlokirAnggaranListMeta;
};
type ApiMetaResponse = { data: BudgetBlokirAnggaranMeta };
type ApiHistoriResponse = { data: BudgetBlokirHistoriRow[] };
type ApiMessageResponse = { data: BudgetBlokirHistoriRow; message?: string };

export class BudgetBlokirAnggaranApiError extends Error {
  errors?: Record<string, string[]>;

  constructor(message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = "BudgetBlokirAnggaranApiError";
    this.errors = errors;
  }
}

async function blokirFetch<T>(path: string, options?: RequestInit): Promise<T> {
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
    throw new BudgetBlokirAnggaranApiError(
      body.message ?? `API error: ${response.status}`,
      body.errors
    );
  }

  return body as T;
}

export async function fetchBudgetBlokirAnggaranMeta(): Promise<BudgetBlokirAnggaranMeta> {
  const res = await apiFetch<ApiMetaResponse>("/finance/budget-blokir-anggaran/meta");
  return res.data;
}

export async function fetchBudgetBlokirAnggaran(params: {
  budget_year_id: number;
  ptk_id?: number | string;
  kelompok_belanja_id?: number | string;
  jenis_belanja_id?: number | string;
  block_status?: string;
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<{
  rows: BudgetBlokirAnggaranRow[];
  summary: BudgetBlokirAnggaranSummary;
  meta: BudgetBlokirAnggaranListMeta;
}> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  });

  const res = await blokirFetch<ApiListResponse>(
    `/finance/budget-blokir-anggaran?${qs.toString()}`
  );
  return { rows: res.data, summary: res.summary, meta: res.meta };
}

export async function fetchBudgetBlokirHistori(
  rbaId: number
): Promise<BudgetBlokirHistoriRow[]> {
  const res = await blokirFetch<ApiHistoriResponse>(
    `/finance/budget-blokir-anggaran/${rbaId}/histori`
  );
  return res.data;
}

export async function saveBudgetBlokirAnggaran(
  form: BudgetBlokirFormData
): Promise<string> {
  const res = await blokirFetch<ApiMessageResponse>("/finance/budget-blokir-anggaran", {
    method: "POST",
    body: JSON.stringify({
      rba_id: form.rba_id,
      block_type: form.block_type,
      block_volume:
        form.block_type === "P" ? Number(form.block_volume.replace(/[^\d]/g, "") || "0") : 0,
      catatan: form.catatan.trim() || null,
    }),
  });
  return res.message ?? "Status blokir diperbarui.";
}
