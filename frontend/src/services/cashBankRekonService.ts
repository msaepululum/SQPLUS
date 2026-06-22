import type {
  CashBankRekonMeta,
  CashListMeta,
  RekeningBankRow,
  RekonsiliasiAccountSummary,
  RekonsiliasiRow,
} from "@/types/cash-bank-rekon";

async function rekonFetch<T>(path: string): Promise<T> {
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

export async function fetchCashBankRekonMeta(budgetYearId?: number): Promise<CashBankRekonMeta> {
  const res = await rekonFetch<{ data: CashBankRekonMeta }>(
    `/finance/cash-bank-rekon/meta${q({ budget_year_id: budgetYearId })}`
  );
  return res.data;
}

export async function fetchRekeningBank(
  budgetYearId: number,
  filters: { bulan?: number } = {}
): Promise<{
  rows: RekeningBankRow[];
  summary: {
    tahun: number;
    bulan: number | null;
    bulan_label: string;
    jumlah_rekening: number;
    rekening_aktif: number;
    total_masuk: number;
    total_keluar: number;
    total_saldo_akhir: number;
  };
}> {
  const res = await rekonFetch<{
    data: {
      rows: RekeningBankRow[];
      summary: {
        tahun: number;
        bulan: number | null;
        bulan_label: string;
        jumlah_rekening: number;
        rekening_aktif: number;
        total_masuk: number;
        total_keluar: number;
        total_saldo_akhir: number;
      };
    };
  }>(`/finance/cash-bank-rekon/rekening-bank${q({ budget_year_id: budgetYearId, ...filters })}`);
  return res.data;
}

export async function fetchRekonsiliasiBank(
  budgetYearId: number,
  filters: {
    bulan?: number;
    bank_account_no?: string;
    status?: string;
    search?: string;
    page?: number;
    per_page?: number;
  } = {}
): Promise<{
  account_summaries: RekonsiliasiAccountSummary[];
  rows: RekonsiliasiRow[];
  summary: {
    tahun: number;
    bulan: number | null;
    bulan_label: string;
    total_matched: number;
    total_pending: number;
    total_selisih: number;
    total_items: number;
  };
  meta: CashListMeta;
}> {
  const res = await rekonFetch<{
    data: {
      account_summaries: RekonsiliasiAccountSummary[];
      rows: RekonsiliasiRow[];
      summary: {
        tahun: number;
        bulan: number | null;
        bulan_label: string;
        total_matched: number;
        total_pending: number;
        total_selisih: number;
        total_items: number;
      };
      meta: CashListMeta;
    };
  }>(`/finance/cash-bank-rekon/rekonsiliasi${q({ budget_year_id: budgetYearId, ...filters })}`);
  return res.data;
}
