import type { CashBankDashboardData } from "@/types/cash-bank-dashboard";

async function cashBankFetch<T>(path: string): Promise<T> {
  const token =
    typeof window !== "undefined" ? (await import("@/utils/token")).getToken() : null;

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

export async function fetchCashBankDashboard(
  tahun: number,
  bulan?: number
): Promise<CashBankDashboardData> {
  const params = new URLSearchParams({ tahun: String(tahun) });
  if (bulan) params.set("bulan", String(bulan));

  const res = await cashBankFetch<{ data: CashBankDashboardData }>(
    `/finance/cash-bank-dashboard?${params.toString()}`
  );
  return res.data;
}
