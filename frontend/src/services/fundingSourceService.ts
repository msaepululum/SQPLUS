import { apiFetch } from "@/services/api";
import type { FundingSource, FundingSourceFormData } from "@/types/funding-source";

type ApiListResponse = { data: FundingSource[] };
type ApiItemResponse = { data: FundingSource; message?: string };
type ApiMessageResponse = { message?: string };

export class FundingSourceApiError extends Error {
  errors?: Record<string, string[]>;

  constructor(message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = "FundingSourceApiError";
    this.errors = errors;
  }
}

async function fundingSourceFetch<T>(
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
    throw new FundingSourceApiError(
      body.message ?? `API error: ${response.status}`,
      body.errors
    );
  }

  return body as T;
}

function toPayload(form: FundingSourceFormData) {
  return {
    kode: form.kode.trim().toUpperCase(),
    nama: form.nama.trim(),
    jenis: form.jenis,
    is_active: form.is_active === "1",
    keterangan: form.keterangan.trim() || null,
  };
}

export async function fetchFundingSources(): Promise<FundingSource[]> {
  const res = await apiFetch<ApiListResponse>("/finance/funding-sources");
  return res.data;
}

export async function createFundingSource(
  form: FundingSourceFormData
): Promise<FundingSource> {
  const res = await fundingSourceFetch<ApiItemResponse>(
    "/finance/funding-sources",
    {
      method: "POST",
      body: JSON.stringify(toPayload(form)),
    }
  );
  return res.data;
}

export async function updateFundingSource(
  id: number,
  form: FundingSourceFormData
): Promise<FundingSource> {
  const res = await fundingSourceFetch<ApiItemResponse>(
    `/finance/funding-sources/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(toPayload(form)),
    }
  );
  return res.data;
}

export async function deleteFundingSource(id: number): Promise<void> {
  await fundingSourceFetch<ApiMessageResponse>(
    `/finance/funding-sources/${id}`,
    { method: "DELETE" }
  );
}
