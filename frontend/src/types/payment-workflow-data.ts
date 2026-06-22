export type PaymentWorkflowStageId =
  | "belum-proses-tagihan"
  | "permintaan-bayar"
  | "rencana-bayar"
  | "verifikasi-pajak"
  | "pembayaran-selesai";

export type PaymentTagihanRow = {
  no_beli: string;
  tgl_beli: string | null;
  nama_supplier: string;
  kode_supplier: string;
  kelompok_belanja: string;
  no_aju: string | null;
  uraian: string;
  total: number;
  ppn: number;
  pph23: number;
  jatuh_tempo: string | null;
  no_dokumen: string | null;
  no_po: string | null;
};

export type PaymentTukarFakturRow = {
  no_tukar_faktur: string;
  tgl_tukar_faktur: string | null;
  nama_supplier: string;
  kode_supplier: string;
  total_bayar: number;
  total_faktur: number;
  total_dpp: number;
  total_pph23: number;
  tgl_rencana_bayar: string | null;
  flag_rencana: boolean;
  jumlah_faktur: number;
  jumlah_rencana: number;
  jumlah_belum_pajak: number;
};

export type PaymentSelesaiRow = {
  no_tukar_faktur: string;
  tgl_tukar_faktur: string | null;
  nama_supplier: string;
  no_bku: string;
  tgl_bayar: string | null;
  no_pembayaran: string | null;
  keterangan: string;
  nilai_keluar: number;
  no_jurnal: string | null;
  no_beli: string;
  kelompok_belanja: string;
  uraian: string;
};

export type PaymentWorkflowListResponse<T> = {
  rows: T[];
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

export type PaymentWorkflowDashboard = {
  tahun: number;
  bulan: number | null;
  kpi: {
    belum_proses_tagihan: number;
    permintaan_bayar: number;
    rencana_bayar: number;
    verifikasi_pajak: number;
    pembayaran_selesai: number;
    total_antrian: number;
  };
  stages: { stage: PaymentWorkflowStageId; count: number }[];
};

export type PaymentWorkflowMeta = {
  tahun: number | null;
  bulan_options: { value: number; label: string }[];
  stage_options: { value: PaymentWorkflowStageId; label: string }[];
};

export function formatPaymentAmount(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPaymentDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export const PAYMENT_PER_PAGE_OPTIONS = [10, 20, 50] as const;
