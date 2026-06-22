import type {
  AccBukuBesarRow,
  AccCoaRow,
  AccDashboardData,
  AccFinancialReport,
  AccJournalRow,
  AccListMeta,
} from "@/types/accounting";

async function accFetch<T>(path: string): Promise<T> {
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

function q(params: Record<string, string | number | boolean | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export async function fetchAccDashboard(
  budgetYearId: number,
  bulan?: number
): Promise<AccDashboardData> {
  const res = await accFetch<{ data: AccDashboardData }>(
    `/finance/accounting/dashboard${q({ budget_year_id: budgetYearId, bulan })}`
  );
  return res.data;
}

export async function fetchAccCoa(
  budgetYearId: number,
  filters: {
    search?: string;
    kelompok?: string;
    detail_only?: boolean;
    page?: number;
    per_page?: number;
  } = {}
): Promise<{ rows: AccCoaRow[]; meta: AccListMeta; summary: Record<string, number> }> {
  const res = await accFetch<{
    data: { rows: AccCoaRow[]; meta: AccListMeta; summary: Record<string, number> };
  }>(`/finance/accounting/coa${q({ budget_year_id: budgetYearId, ...filters })}`);
  return res.data;
}

export async function fetchAccMapping(): Promise<{
  source: string;
  kas_accounts: { account_no: string; account_name: string; type: string }[];
  bank_accounts: { account_no: string; account_name: string; bank_account: string; type: string }[];
  module_mappings: { module: string; label: string; coa_prefix: string; source: string; account_count: number }[];
}> {
  const res = await accFetch<{ data: Awaited<ReturnType<typeof fetchAccMapping>> }>(
    "/finance/accounting/mapping-akun"
  );
  return res.data;
}

export async function fetchAccJurnalUmum(
  budgetYearId: number,
  filters: Record<string, string | number | undefined> = {}
): Promise<{ rows: AccJournalRow[]; meta: AccListMeta; summary: Record<string, number> }> {
  const res = await accFetch<{
    data: { rows: AccJournalRow[]; meta: AccListMeta; summary: Record<string, number> };
  }>(`/finance/accounting/jurnal-umum${q({ budget_year_id: budgetYearId, ...filters })}`);
  return res.data;
}

export async function fetchAccJurnalOtomatis(
  budgetYearId: number,
  filters: Record<string, string | number | undefined> = {}
): Promise<{ rows: AccJournalRow[]; meta: AccListMeta; summary: Record<string, number> }> {
  const res = await accFetch<{
    data: { rows: AccJournalRow[]; meta: AccListMeta; summary: Record<string, number> };
  }>(`/finance/accounting/jurnal-otomatis${q({ budget_year_id: budgetYearId, ...filters })}`);
  return res.data;
}

export async function fetchAccPostingJurnal(
  budgetYearId: number,
  filters: Record<string, string | number | undefined> = {}
): Promise<{ rows: AccJournalRow[]; meta: AccListMeta; summary: Record<string, number> }> {
  const res = await accFetch<{
    data: { rows: AccJournalRow[]; meta: AccListMeta; summary: Record<string, number> };
  }>(`/finance/accounting/posting-jurnal${q({ budget_year_id: budgetYearId, ...filters })}`);
  return res.data;
}

export async function fetchAccBukuBesar(
  budgetYearId: number,
  filters: Record<string, string | number | undefined> = {}
): Promise<{
  account: { account_no: string; account_name: string; kelompok: string; kelompok_label: string; saldo: number } | null;
  account_options: { value: string; label: string }[];
  rows: AccBukuBesarRow[];
  meta: AccListMeta;
}> {
  const res = await accFetch<{ data: Awaited<ReturnType<typeof fetchAccBukuBesar>> }>(
    `/finance/accounting/buku-besar${q({ budget_year_id: budgetYearId, ...filters })}`
  );
  return res.data;
}

export async function fetchAccNeraca(budgetYearId: number, bulan?: number): Promise<AccFinancialReport> {
  const res = await accFetch<{ data: AccFinancialReport }>(
    `/finance/accounting/neraca${q({ budget_year_id: budgetYearId, bulan })}`
  );
  return res.data;
}

export async function fetchAccLaporanOperasional(
  budgetYearId: number,
  bulan?: number
): Promise<AccFinancialReport> {
  const res = await accFetch<{ data: AccFinancialReport }>(
    `/finance/accounting/laporan-operasional${q({ budget_year_id: budgetYearId, bulan })}`
  );
  return res.data;
}

export async function fetchAccArusKas(
  budgetYearId: number,
  bulan?: number
): Promise<{
  filters: { tahun: number; bulan: number | null };
  source: string;
  monthly: { bulan: number; label: string; masuk: number; keluar: number; net: number }[];
  accounts: { account_no: string; account_name: string; masuk: number; keluar: number; net: number }[];
  summary: { total_masuk: number; total_keluar: number; net: number };
}> {
  const res = await accFetch<{ data: Awaited<ReturnType<typeof fetchAccArusKas>> }>(
    `/finance/accounting/arus-kas${q({ budget_year_id: budgetYearId, bulan })}`
  );
  return res.data;
}

export async function fetchAccPerubahanEkuitas(budgetYearId: number): Promise<{
  filters: { tahun: number };
  source: string;
  rows: {
    account_no: string;
    account_name: string;
    saldo_awal: number;
    mutasi_debet: number;
    mutasi_kredit: number;
    saldo_akhir: number;
  }[];
  summary: Record<string, number>;
}> {
  const res = await accFetch<{ data: Awaited<ReturnType<typeof fetchAccPerubahanEkuitas>> }>(
    `/finance/accounting/perubahan-ekuitas${q({ budget_year_id: budgetYearId })}`
  );
  return res.data;
}

export async function fetchAccTutupBuku(): Promise<{
  source: string;
  periode_status: { bulan: number; label: string; closed: boolean }[];
  summary: { closed_count: number; open_count: number; current_open_month: number | null };
  history: {
    no_close: string;
    tahun: string;
    bulan: string;
    unit: string;
    tanggal_close: string | null;
    valid: boolean;
    kunci: string;
  }[];
}> {
  const res = await accFetch<{ data: Awaited<ReturnType<typeof fetchAccTutupBuku>> }>(
    "/finance/accounting/tutup-buku"
  );
  return res.data;
}
