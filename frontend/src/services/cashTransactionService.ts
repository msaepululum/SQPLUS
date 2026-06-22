import type {
  CashTransactionDetail,
  CashTransactionFlowType,
  CashTransactionListMeta,
  CashTransactionMeta,
  CashTransactionRow,
  CashTransactionSource,
  CashTransactionSummary,
} from "@/types/cash-transaction";

async function cashFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token =
    typeof window !== "undefined" ? (await import("@/utils/token")).getToken() : null;

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
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

function toQuery(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") q.set(key, String(value));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function fetchCashTransactionMeta(
  budgetYearId?: number
): Promise<CashTransactionMeta> {
  const res = await cashFetch<{ data: CashTransactionMeta }>(
    `/finance/cash-transactions/meta${toQuery({ budget_year_id: budgetYearId })}`
  );
  return res.data;
}

export async function fetchCashTransactions(
  budgetYearId: number,
  filters: {
    flow_type?: CashTransactionFlowType;
    bulan?: number;
    kas_account_no?: string;
    journal_type?: string;
    source?: "all" | CashTransactionSource;
    search?: string;
    tanggal_from?: string;
    tanggal_to?: string;
    page?: number;
    per_page?: number;
  } = {}
): Promise<{
  rows: CashTransactionRow[];
  summary: CashTransactionSummary;
  meta: CashTransactionListMeta;
}> {
  const res = await cashFetch<{
    data: CashTransactionRow[];
    summary: CashTransactionSummary;
    meta: CashTransactionListMeta;
  }>(
    `/finance/cash-transactions${toQuery({
      budget_year_id: budgetYearId,
      ...filters,
    })}`
  );
  return { rows: res.data, summary: res.summary, meta: res.meta };
}

export async function fetchCashTransactionDetail(
  budgetYearId: number,
  id: string
): Promise<CashTransactionDetail> {
  const res = await cashFetch<{ data: CashTransactionDetail }>(
    `/finance/cash-transactions/${encodeURIComponent(id)}${toQuery({
      budget_year_id: budgetYearId,
    })}`
  );
  return res.data;
}

export async function createCashTransaction(payload: {
  budget_year_id: number;
  flow_type: "masuk" | "keluar";
  journal_type: string;
  tanggal: string;
  keterangan?: string;
  no_bukti?: string;
  kas_account_no: string;
  kas_account_name?: string;
  lines: Array<{
    account_no: string;
    account_name?: string;
    keterangan?: string;
    debet: number;
    kredit: number;
  }>;
}): Promise<CashTransactionDetail> {
  const res = await cashFetch<{ data: CashTransactionDetail; message: string }>(
    "/finance/cash-transactions",
    { method: "POST", body: JSON.stringify(payload) }
  );
  return res.data;
}

export async function updateCashTransaction(
  id: number,
  payload: {
    tanggal?: string;
    keterangan?: string;
    no_bukti?: string;
    kas_account_no?: string;
    kas_account_name?: string;
    lines?: Array<{
      account_no: string;
      account_name?: string;
      keterangan?: string;
      debet: number;
      kredit: number;
    }>;
  }
): Promise<CashTransactionDetail> {
  const res = await cashFetch<{ data: CashTransactionDetail; message: string }>(
    `/finance/cash-transactions/${id}`,
    { method: "PATCH", body: JSON.stringify(payload) }
  );
  return res.data;
}

export async function deleteCashTransaction(id: number): Promise<void> {
  await cashFetch<{ message: string }>(`/finance/cash-transactions/${id}`, {
    method: "DELETE",
  });
}

export async function postCashTransaction(id: number): Promise<CashTransactionDetail> {
  const res = await cashFetch<{ data: CashTransactionDetail; message: string }>(
    `/finance/cash-transactions/${id}/post`,
    { method: "POST" }
  );
  return res.data;
}
