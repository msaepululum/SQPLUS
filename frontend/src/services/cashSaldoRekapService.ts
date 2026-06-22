import type {
  CashBukuKasRow,
  CashPosisiSaldoRow,
  CashPosisiSaldoSummary,
  CashProyeksiData,
  CashRekapBulananRow,
  CashSaldoMeta,
  CashListMeta,
} from "@/types/cash-saldo-rekap";

async function saldoFetch<T>(path: string): Promise<T> {
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

function q(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export async function fetchCashSaldoMeta(budgetYearId?: number): Promise<CashSaldoMeta> {
  const res = await saldoFetch<{ data: CashSaldoMeta }>(
    `/finance/cash-saldo-rekap/meta${q({ budget_year_id: budgetYearId })}`
  );
  return res.data;
}

export async function fetchPosisiSaldo(
  budgetYearId: number,
  filters: { bulan?: number; kas_account_no?: string } = {}
): Promise<{ rows: CashPosisiSaldoRow[]; summary: CashPosisiSaldoSummary }> {
  const res = await saldoFetch<{
    data: { rows: CashPosisiSaldoRow[]; summary: CashPosisiSaldoSummary };
  }>(`/finance/cash-saldo-rekap/posisi-saldo${q({ budget_year_id: budgetYearId, ...filters })}`);
  return res.data;
}

export async function fetchRekapBulanan(
  budgetYearId: number
): Promise<{
  rows: CashRekapBulananRow[];
  summary: { tahun: number; total_masuk: number; total_keluar: number; saldo_akhir_tahun: number };
}> {
  const res = await saldoFetch<{
    data: {
      rows: CashRekapBulananRow[];
      summary: { tahun: number; total_masuk: number; total_keluar: number; saldo_akhir_tahun: number };
    };
  }>(`/finance/cash-saldo-rekap/rekap-bulanan${q({ budget_year_id: budgetYearId })}`);
  return res.data;
}

export async function fetchBukuKasBesar(
  budgetYearId: number,
  filters: {
    bulan?: number;
    kas_account_no?: string;
    search?: string;
    page?: number;
    per_page?: number;
  } = {}
): Promise<{
  rows: CashBukuKasRow[];
  summary: Record<string, number | null>;
  meta: CashListMeta;
}> {
  const res = await saldoFetch<{
    data: { rows: CashBukuKasRow[]; summary: Record<string, number | null>; meta: CashListMeta };
  }>(`/finance/cash-saldo-rekap/buku-kas-besar${q({ budget_year_id: budgetYearId, ...filters })}`);
  return res.data;
}

export async function fetchProyeksiCashflow(budgetYearId: number): Promise<CashProyeksiData> {
  const res = await saldoFetch<{ data: CashProyeksiData }>(
    `/finance/cash-saldo-rekap/proyeksi-cashflow${q({ budget_year_id: budgetYearId })}`
  );
  return res.data;
}
