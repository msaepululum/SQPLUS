import type {
  HpAccountRow,
  HpAgingRow,
  HpDashboardData,
  HpJournalRow,
  HpListMeta,
  HpMeta,
} from "@/types/hutang-piutang";

async function hpFetch<T>(path: string): Promise<T> {
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

export async function fetchHpMeta(budgetYearId?: number): Promise<HpMeta> {
  const res = await hpFetch<{ data: HpMeta }>(
    `/finance/hutang-piutang/meta${q({ budget_year_id: budgetYearId })}`
  );
  return res.data;
}

export async function fetchHpDashboard(
  budgetYearId: number,
  bulan?: number
): Promise<HpDashboardData> {
  const res = await hpFetch<{ data: HpDashboardData }>(
    `/finance/hutang-piutang/dashboard${q({ budget_year_id: budgetYearId, bulan })}`
  );
  return res.data;
}

export async function fetchHutangDaftar(
  budgetYearId: number,
  filters: {
    jenis?: string;
    periode?: string;
    bulan?: number;
    search?: string;
    page?: number;
    per_page?: number;
  } = {}
): Promise<{ rows: HpJournalRow[]; meta: HpListMeta }> {
  const res = await hpFetch<{ data: { rows: HpJournalRow[]; meta: HpListMeta } }>(
    `/finance/hutang-piutang/hutang/daftar${q({ budget_year_id: budgetYearId, ...filters })}`
  );
  return res.data;
}

export async function fetchHutangPerAkun(
  budgetYearId: number,
  filters: { jenis?: string; periode?: string; bulan?: number } = {}
): Promise<{ rows: HpAccountRow[]; summary: Record<string, number | string> }> {
  const res = await hpFetch<{
    data: { rows: HpAccountRow[]; summary: Record<string, number | string> };
  }>(`/finance/hutang-piutang/hutang/per-akun${q({ budget_year_id: budgetYearId, ...filters })}`);
  return res.data;
}

export async function fetchPiutangDaftar(
  budgetYearId: number,
  filters: {
    jenis?: string;
    bulan?: number;
    search?: string;
    page?: number;
    per_page?: number;
  } = {}
): Promise<{ rows: HpJournalRow[]; meta: HpListMeta }> {
  const res = await hpFetch<{ data: { rows: HpJournalRow[]; meta: HpListMeta } }>(
    `/finance/hutang-piutang/piutang/daftar${q({ budget_year_id: budgetYearId, ...filters })}`
  );
  return res.data;
}

export async function fetchPiutangUmur(
  budgetYearId: number,
  jenis?: string
): Promise<{
  buckets: { key: string; label: string; amount: number }[];
  rows: HpAgingRow[];
  summary: Record<string, number | string>;
}> {
  const res = await hpFetch<{
    data: {
      buckets: { key: string; label: string; amount: number }[];
      rows: HpAgingRow[];
      summary: Record<string, number | string>;
    };
  }>(`/finance/hutang-piutang/piutang/umur${q({ budget_year_id: budgetYearId, jenis })}`);
  return res.data;
}

export async function fetchRekonHutang(
  budgetYearId: number,
  filters: Record<string, string | number | undefined> = {}
): Promise<{ rows: HpJournalRow[]; summary: Record<string, number>; meta: HpListMeta }> {
  const res = await hpFetch<{
    data: { rows: HpJournalRow[]; summary: Record<string, number>; meta: HpListMeta };
  }>(`/finance/hutang-piutang/rekonsiliasi/hutang${q({ budget_year_id: budgetYearId, ...filters })}`);
  return res.data;
}

export async function fetchRekonPiutang(
  budgetYearId: number,
  filters: Record<string, string | number | undefined> = {}
): Promise<{ rows: HpJournalRow[]; summary: Record<string, number>; meta: HpListMeta }> {
  const res = await hpFetch<{
    data: { rows: HpJournalRow[]; summary: Record<string, number>; meta: HpListMeta };
  }>(`/finance/hutang-piutang/rekonsiliasi/piutang${q({ budget_year_id: budgetYearId, ...filters })}`);
  return res.data;
}

export async function fetchHpRiwayat(
  budgetYearId: number,
  filters: Record<string, string | number | undefined> = {}
): Promise<{ rows: HpJournalRow[]; meta: HpListMeta }> {
  const res = await hpFetch<{ data: { rows: HpJournalRow[]; meta: HpListMeta } }>(
    `/finance/hutang-piutang/riwayat${q({ budget_year_id: budgetYearId, ...filters })}`
  );
  return res.data;
}
