export type TaxStageId =
  | "antrian-verifikasi"
  | "tagihan-pembelian"
  | "tukar-faktur"
  | "detail-perhitungan"
  | "setoran-pajak"
  | "pajak-pengajuan"
  | "rekap-bulanan";

export type FinanceTaxDashboard = {
  tahun: number;
  bulan: number | null;
  kpi: {
    antrian_verifikasi: number;
    ppn_tagihan: number;
    pph22_tagihan: number;
    pph23_tagihan: number;
    ppn_faktur: number;
    pph22_faktur: number;
    pph23_faktur: number;
    setoran_pajak: number;
    ppn_pengajuan: number;
  };
};

export type FinanceTaxMeta = {
  tahun: number | null;
  bulan_options: { value: number; label: string }[];
  stage_options: { value: TaxStageId; label: string }[];
};

export type FinanceTaxListResponse = {
  rows: Record<string, unknown>[];
  summary: Record<string, number>;
  meta: {
    total: number;
    page: number;
    per_page: number;
    last_page: number;
    from: number;
    to: number;
  };
};

export function formatTaxAmount(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatTaxDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export const TAX_PER_PAGE_OPTIONS = [10, 20, 50] as const;
