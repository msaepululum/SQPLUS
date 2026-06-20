import { apiFetch } from "@/services/api";
import type { BudgetYear, BudgetYearFormData } from "@/types/budget-year";

type ApiListResponse = { data: BudgetYear[] };
type ApiItemResponse = { data: BudgetYear; message?: string };
type ApiMessageResponse = { message?: string };

export class BudgetYearApiError extends Error {
  errors?: Record<string, string[]>;

  constructor(message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = "BudgetYearApiError";
    this.errors = errors;
  }
}

async function budgetYearFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
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
    throw new BudgetYearApiError(
      body.message ?? `API error: ${response.status}`,
      body.errors
    );
  }

  return body as T;
}

function toPayload(form: BudgetYearFormData) {
  return {
    tahun: Number(form.tahun),
    nama: form.nama.trim(),
    tanggal_mulai: form.tanggal_mulai,
    tanggal_selesai: form.tanggal_selesai,
    status: form.status,
    keterangan: form.keterangan.trim() || null,
  };
}

export async function fetchBudgetYears(): Promise<BudgetYear[]> {
  const res = await apiFetch<ApiListResponse>("/finance/budget-years");
  return res.data;
}

export async function createBudgetYear(
  form: BudgetYearFormData
): Promise<BudgetYear> {
  const res = await budgetYearFetch<ApiItemResponse>("/finance/budget-years", {
    method: "POST",
    body: JSON.stringify(toPayload(form)),
  });
  return res.data;
}

export async function updateBudgetYear(
  id: number,
  form: BudgetYearFormData
): Promise<BudgetYear> {
  const res = await budgetYearFetch<ApiItemResponse>(
    `/finance/budget-years/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(toPayload(form)),
    }
  );
  return res.data;
}

export async function deleteBudgetYear(id: number): Promise<void> {
  await budgetYearFetch<ApiMessageResponse>(`/finance/budget-years/${id}`, {
    method: "DELETE",
  });
}
