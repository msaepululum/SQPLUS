import type {
  PaymentSelesaiRow,
  PaymentTagihanRow,
  PaymentTukarFakturRow,
  PaymentWorkflowDashboard,
  PaymentWorkflowListResponse,
  PaymentWorkflowMeta,
  PaymentWorkflowStageId,
} from "@/types/payment-workflow-data";

async function paymentWorkflowFetch<T>(path: string, init?: RequestInit): Promise<T> {
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

export async function fetchPaymentWorkflowMeta(
  budgetYearId?: number
): Promise<PaymentWorkflowMeta> {
  const qs = budgetYearId ? `?budget_year_id=${budgetYearId}` : "";
  const res = await paymentWorkflowFetch<{ data: PaymentWorkflowMeta }>(
    `/finance/payment-workflow/meta${qs}`
  );
  return res.data;
}

export async function fetchPaymentWorkflowDashboard(
  budgetYearId: number,
  bulan?: number
): Promise<PaymentWorkflowDashboard> {
  const qs = new URLSearchParams({ budget_year_id: String(budgetYearId) });
  if (bulan) qs.set("bulan", String(bulan));
  const res = await paymentWorkflowFetch<{ data: PaymentWorkflowDashboard }>(
    `/finance/payment-workflow/dashboard?${qs.toString()}`
  );
  return res.data;
}

export async function fetchPaymentWorkflowList(
  params: {
    budget_year_id: number;
    stage: PaymentWorkflowStageId;
    bulan?: number;
    search?: string;
    page?: number;
    per_page?: number;
  }
): Promise<
  PaymentWorkflowListResponse<PaymentTagihanRow | PaymentTukarFakturRow | PaymentSelesaiRow>
> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  });
  return paymentWorkflowFetch(`/finance/payment-workflow?${qs.toString()}`);
}
