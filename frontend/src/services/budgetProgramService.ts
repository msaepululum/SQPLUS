import { apiFetch } from "@/services/api";
import type { BudgetProgram, BudgetProgramFormData } from "@/types/budget-program";

type ApiListResponse = { data: BudgetProgram[] };
type ApiItemResponse = { data: BudgetProgram; message?: string };
type ApiMessageResponse = { message?: string };

export class BudgetProgramApiError extends Error {
  errors?: Record<string, string[]>;

  constructor(message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = "BudgetProgramApiError";
    this.errors = errors;
  }
}

async function programFetch<T>(path: string, options?: RequestInit): Promise<T> {
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
    throw new BudgetProgramApiError(
      body.message ?? `API error: ${response.status}`,
      body.errors
    );
  }

  return body as T;
}

function toMasterPayload(form: BudgetProgramFormData) {
  return {
    budget_year_id: Number(form.budget_year_id),
    parent_id: form.parent_id ? Number(form.parent_id) : null,
    kode: form.kode.trim(),
    uraian: form.uraian.trim(),
    jenis: form.jenis,
    is_active: form.is_active === "1",
    keterangan: form.keterangan.trim() || null,
  };
}

export async function fetchBudgetPrograms(budgetYearId: number): Promise<BudgetProgram[]> {
  const res = await apiFetch<ApiListResponse>(
    `/finance/budget-programs?budget_year_id=${budgetYearId}`
  );
  return res.data;
}

export async function createBudgetProgram(
  form: BudgetProgramFormData
): Promise<BudgetProgram> {
  const res = await programFetch<ApiItemResponse>("/finance/budget-programs", {
    method: "POST",
    body: JSON.stringify(toMasterPayload(form)),
  });
  return res.data;
}

export async function updateBudgetProgram(
  id: number,
  form: BudgetProgramFormData
): Promise<BudgetProgram> {
  const res = await programFetch<ApiItemResponse>(
    `/finance/budget-programs/${id}`,
    { method: "PUT", body: JSON.stringify(toMasterPayload(form)) }
  );
  return res.data;
}

export async function updateBudgetProgramPagu(
  id: number,
  jumlahAnggaran: string | number
): Promise<BudgetProgram> {
  const amount =
    typeof jumlahAnggaran === "string"
      ? Number(jumlahAnggaran.replace(/\./g, ""))
      : jumlahAnggaran;

  const res = await programFetch<ApiItemResponse>(
    `/finance/budget-programs/${id}/pagu`,
    { method: "PATCH", body: JSON.stringify({ jumlah_anggaran: amount }) }
  );
  return res.data;
}

export async function deleteBudgetProgram(id: number): Promise<void> {
  await programFetch<ApiMessageResponse>(`/finance/budget-programs/${id}`, {
    method: "DELETE",
  });
}
