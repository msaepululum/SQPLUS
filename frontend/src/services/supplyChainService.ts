import type {
  SupplyChainDashboard,
  SupplyChainListResponse,
  SupplyChainMonitoring,
} from "@/types/supply-chain";

async function scFetch<T>(path: string, init?: RequestInit): Promise<T> {
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

export async function fetchSupplyChainDashboard(): Promise<SupplyChainDashboard> {
  const res = await scFetch<{ data: SupplyChainDashboard }>("/supply-chain/dashboard");
  return res.data;
}

export async function fetchSupplyChainMonitoring(): Promise<SupplyChainMonitoring> {
  const res = await scFetch<{ data: SupplyChainMonitoring }>("/supply-chain/monitoring");
  return res.data;
}

export async function fetchSupplyChainList(params: {
  slug: string;
  stage: string;
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<SupplyChainListResponse> {
  const qs = new URLSearchParams({
    slug: params.slug,
    stage: params.stage,
  });
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", String(params.page));
  if (params.per_page) qs.set("per_page", String(params.per_page));

  return scFetch<SupplyChainListResponse>(`/supply-chain/data?${qs.toString()}`);
}
