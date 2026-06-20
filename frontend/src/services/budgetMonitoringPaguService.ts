import type {
  BudgetMonitoringCharts,
  BudgetMonitoringInsights,
  BudgetMonitoringKpi,
  BudgetMonitoringMeta,
  BudgetMonitoringRow,
  MonitoringView,
} from "@/types/budget-monitoring-pagu";

type ApiDashboardResponse = {
  rows: BudgetMonitoringRow[];
  kpi: BudgetMonitoringKpi;
  charts: BudgetMonitoringCharts;
  insights: BudgetMonitoringInsights;
  filters: {
    tahun: number;
    bulan_from: number;
    bulan_to: number;
    view: string;
  };
};
type ApiMetaResponse = { data: BudgetMonitoringMeta };

async function monitoringFetch<T>(path: string): Promise<T> {
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

export async function fetchBudgetMonitoringMeta(): Promise<BudgetMonitoringMeta> {
  const res = await monitoringFetch<ApiMetaResponse>("/finance/budget-monitoring-pagu/meta");
  return res.data;
}

export async function fetchBudgetMonitoringPagu(params: {
  budget_year_id: number;
  ptk_id?: number;
  kelompok_belanja_id?: number;
  jenis_belanja_id?: number;
  bulan_from?: number;
  bulan_to?: number;
  search?: string;
  view?: MonitoringView;
}): Promise<ApiDashboardResponse> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  });
  return monitoringFetch<ApiDashboardResponse>(`/finance/budget-monitoring-pagu?${qs.toString()}`);
}
