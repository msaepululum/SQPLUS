import type {
  BudgetRiwayatEvent,
  BudgetRiwayatListMeta,
  BudgetRiwayatRow,
  BudgetRiwayatSummary,
  RiwayatJenis,
} from "@/types/budget-riwayat-perubahan";

type ApiListResponse = {
  data: BudgetRiwayatRow[];
  summary: BudgetRiwayatSummary;
  meta: BudgetRiwayatListMeta;
};
type ApiEventsResponse = { data: BudgetRiwayatEvent[] };

async function riwayatFetch<T>(path: string): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? (await import("@/utils/token")).getToken()
      : null;

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

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

export async function fetchBudgetRiwayatPerubahan(params: {
  budget_year_id: number;
  jenis?: string;
  status?: string;
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<{
  rows: BudgetRiwayatRow[];
  summary: BudgetRiwayatSummary;
  meta: BudgetRiwayatListMeta;
}> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  });
  const res = await riwayatFetch<ApiListResponse>(
    `/finance/budget-riwayat-perubahan?${qs.toString()}`
  );
  return { rows: res.data, summary: res.summary, meta: res.meta };
}

export async function fetchBudgetRiwayatEvents(
  jenis: RiwayatJenis,
  refId: number
): Promise<BudgetRiwayatEvent[]> {
  const qs = new URLSearchParams({ jenis, ref_id: String(refId) });
  const res = await riwayatFetch<ApiEventsResponse>(
    `/finance/budget-riwayat-perubahan/events?${qs.toString()}`
  );
  return res.data;
}
