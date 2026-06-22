import type {
  ProcurementDashboard,
  ProcurementListResponse,
  ProcurementMeta,
  ProcurementNegosiasiRow,
  ProcurementPenerimaanDetail,
  ProcurementPenerimaanRow,
  ProcurementPermintaanRow,
  ProcurementPoDetail,
  ProcurementPoRow,
  ProcurementVendorRow,
} from "@/types/procurement";

async function procurementFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token =
    typeof window !== "undefined" ? (await import("@/utils/token")).getToken() : null;

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

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

export async function fetchProcurementMeta(
  budgetYearId?: number
): Promise<ProcurementMeta> {
  const qs = budgetYearId ? `?budget_year_id=${budgetYearId}` : "";
  const res = await procurementFetch<{ data: ProcurementMeta }>(`/procurement/meta${qs}`);
  return res.data;
}

export async function fetchProcurementDashboard(
  budgetYearId: number,
  bulan?: number
): Promise<ProcurementDashboard> {
  const qs = new URLSearchParams({ budget_year_id: String(budgetYearId) });
  if (bulan) qs.set("bulan", String(bulan));
  const res = await procurementFetch<{ data: ProcurementDashboard }>(
    `/procurement/dashboard?${qs.toString()}`
  );
  return res.data;
}

export async function fetchProcurementPermintaan(params: {
  budget_year_id: number;
  queue?: "antrian" | "close" | "all";
  bulan?: number;
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<ProcurementListResponse<ProcurementPermintaanRow>> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  });
  return procurementFetch(`/procurement/permintaan?${qs.toString()}`);
}

export async function fetchProcurementNegosiasi(params: {
  budget_year_id: number;
  bulan?: number;
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<ProcurementListResponse<ProcurementNegosiasiRow>> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  });
  return procurementFetch(`/procurement/negosiasi?${qs.toString()}`);
}

export async function fetchProcurementPo(params: {
  budget_year_id: number;
  jenis?: "po" | "spk" | "kontrak" | "all";
  bulan?: number;
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<ProcurementListResponse<ProcurementPoRow>> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  });
  return procurementFetch(`/procurement/po?${qs.toString()}`);
}

export async function fetchProcurementPoDetail(noPo: string): Promise<ProcurementPoDetail> {
  const res = await procurementFetch<{ data: ProcurementPoDetail }>(
    `/procurement/po/${encodeURIComponent(noPo)}`
  );
  return res.data;
}

export async function fetchProcurementPenerimaan(params: {
  budget_year_id: number;
  bulan?: number;
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<ProcurementListResponse<ProcurementPenerimaanRow>> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  });
  return procurementFetch(`/procurement/penerimaan?${qs.toString()}`);
}

export async function fetchProcurementPenerimaanDetail(
  noBeli: string
): Promise<ProcurementPenerimaanDetail> {
  const res = await procurementFetch<{ data: ProcurementPenerimaanDetail }>(
    `/procurement/penerimaan/${encodeURIComponent(noBeli)}`
  );
  return res.data;
}

export async function fetchProcurementVendor(params: {
  search?: string;
  aktif?: "aktif" | "nonaktif" | "all";
  page?: number;
  per_page?: number;
}): Promise<ProcurementListResponse<ProcurementVendorRow>> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  });
  return procurementFetch(`/procurement/vendor?${qs.toString()}`);
}

export async function fetchProcurementMonitoring(params: {
  budget_year_id: number;
  stage?: string;
  bulan?: number;
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<ProcurementListResponse<ProcurementPermintaanRow>> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  });
  return procurementFetch(`/procurement/monitoring?${qs.toString()}`);
}
