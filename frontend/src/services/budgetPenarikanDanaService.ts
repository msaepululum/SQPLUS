import { apiFetch } from "@/services/api";
import type {
  BudgetPenarikanBulkItem,
  BudgetPenarikanDanaMeta,
  BudgetPenarikanDanaRow,
  BudgetPenarikanDanaSummary,
} from "@/types/budget-penarikan-dana";

type ApiListResponse = {
  data: BudgetPenarikanDanaRow[];
  summary: BudgetPenarikanDanaSummary;
  bulan_labels: Record<number, string>;
};
type ApiMetaResponse = { data: BudgetPenarikanDanaMeta };

export class BudgetPenarikanDanaApiError extends Error {
  errors?: Record<string, string[]>;

  constructor(message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = "BudgetPenarikanDanaApiError";
    this.errors = errors;
  }
}

async function penarikanFetch<T>(path: string, options?: RequestInit): Promise<T> {
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
    throw new BudgetPenarikanDanaApiError(
      body.message ?? `API error: ${response.status}`,
      body.errors
    );
  }

  return body as T;
}

export type BudgetPenarikanDanaFilters = {
  budget_year_id: number;
  ptk_id?: string;
  kelompok_belanja_id?: string;
  jenis_belanja_id?: string;
};

function toQuery(filters: BudgetPenarikanDanaFilters): string {
  const params = new URLSearchParams();
  params.set("budget_year_id", String(filters.budget_year_id));
  if (filters.ptk_id) params.set("ptk_id", filters.ptk_id);
  if (filters.kelompok_belanja_id) params.set("kelompok_belanja_id", filters.kelompok_belanja_id);
  if (filters.jenis_belanja_id) params.set("jenis_belanja_id", filters.jenis_belanja_id);
  return `?${params.toString()}`;
}

export async function fetchBudgetPenarikanDanaMeta(): Promise<BudgetPenarikanDanaMeta> {
  const res = await apiFetch<ApiMetaResponse>("/finance/budget-penarikan-dana/meta");
  return res.data;
}

export async function fetchBudgetPenarikanDana(filters: BudgetPenarikanDanaFilters): Promise<{
  rows: BudgetPenarikanDanaRow[];
  summary: BudgetPenarikanDanaSummary;
}> {
  const res = await apiFetch<ApiListResponse>(
    `/finance/budget-penarikan-dana${toQuery(filters)}`
  );
  return { rows: res.data, summary: res.summary };
}

export async function saveBudgetPenarikanDanaBulk(
  budgetYearId: number,
  items: BudgetPenarikanBulkItem[]
): Promise<void> {
  await penarikanFetch<{ message?: string }>("/finance/budget-penarikan-dana/bulk", {
    method: "POST",
    body: JSON.stringify({ budget_year_id: budgetYearId, items }),
  });
}
