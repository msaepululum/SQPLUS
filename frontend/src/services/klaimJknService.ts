import type { KlaimJknListMeta, KlaimJknMeta, KlaimJknRow } from "@/types/klaim-jkn";

async function klaimFetch<T>(path: string): Promise<T> {
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

export async function fetchKlaimJknMeta(budgetYearId?: number): Promise<KlaimJknMeta> {
  const res = await klaimFetch<{ data: KlaimJknMeta }>(
    `/finance/klaim-jkn/meta${q({ budget_year_id: budgetYearId })}`
  );
  return res.data;
}

export async function fetchKlaimJknList(
  budgetYearId: number,
  filters: {
    status?: string;
    search?: string;
    page?: number;
    per_page?: number;
  } = {}
): Promise<{
  rows: KlaimJknRow[];
  summary: {
    tahun: number;
    jumlah_klaim: number;
    total_pengajuan: number;
    total_gruper: number;
    total_tarif_rs: number;
    total_topup: number;
    total_setujui: number;
    selisih_rs_gruper: number;
  };
  meta: KlaimJknListMeta;
}> {
  const res = await klaimFetch<{
    data: {
      rows: KlaimJknRow[];
      summary: {
        tahun: number;
        jumlah_klaim: number;
        total_pengajuan: number;
        total_gruper: number;
        total_tarif_rs: number;
        total_topup: number;
        total_setujui: number;
        selisih_rs_gruper: number;
      };
      meta: KlaimJknListMeta;
    };
  }>(`/finance/klaim-jkn${q({ budget_year_id: budgetYearId, ...filters })}`);
  return res.data;
}
