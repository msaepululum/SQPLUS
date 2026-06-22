import type { ExpenditureProcessStageId, ExpenditureTrackingStep } from "@/constants/expenditure-process";

export type ExpenditureAjuKsroOption = {
  ksro_id: number;
  kode_ksro: string;
  nama_ksro: string;
  label: string;
};

export type ExpenditureAjuMeta = {
  tahun_options: string[];
  ptk: { id: number; nama_satuan_ptk: string; nama_ptk: string; no_absen: string }[];
  kelompok_belanja: { id: number; kode_kelompok_belanja: string }[];
  jenis_belanja: { id: number; kode_jenis_belanja: string; kelompok_belanja_id: number }[];
  bulan_options: { value: number; label: string }[];
  tahap_proses_options: { value: string; label: string }[];
  scope: {
    no_absen: string;
    name: string;
    departemen_id: number | null;
    departemen_nama: string | null;
    ptk_id: number | null;
  } | null;
  ksro_options: ExpenditureAjuKsroOption[];
  can_create: boolean;
  can_view_progress_all?: boolean;
};

export type ExpenditureAjuApprovalHistoryItem = {
  id: number;
  flow_name: string;
  flow_type: string;
  flow_order: number | null;
  jabatan: string | null;
  status: string;
  status_label: string;
  catatan: string | null;
  no_absen: string;
  actor_name: string;
  occurred_at: string | null;
};

export type ExpenditureAjuDetailItem = {
  id: number;
  rba_id: number;
  nama_komponen: string;
  rba_nama_komponen: string | null;
  jenis: string;
  spesifikasi: string;
  volume: number;
  volume_nego: number | null;
  satuan: string;
  harga_satuan: number;
  sub_total: number;
  pajak: number;
  total: number;
  merk: string | null;
  tipe: string | null;
};

export type ExpenditureAjuRow = {
  id: number;
  no_pengajuan: string;
  tanggal: string | null;
  unit: string;
  ptk_id: number | null;
  jenis_belanja: string;
  jenis_belanja_id: number | null;
  uraian: string;
  sub_total: number;
  pajak: number;
  total: number;
  status: ExpenditureProcessStageId;
  status_label: string;
  status_db: string;
  tahap_proses: ExpenditureProcessStageId;
  tahap_label: string;
  tracking: ExpenditureTrackingStep[];
  no_nego: string | null;
  no_sppd: string | null;
  no_sppu: string | null;
  ksro_id: number;
  created_by: string;
  created_by_name: string;
};

export type ExpenditureAjuDetail = ExpenditureAjuRow & {
  budget_year_id: number | null;
  tahun: string;
  tgl_selesai: string | null;
  catatan: string;
  catatan_batal: string | null;
  file_kap: string | null;
  ksro_kode: string | null;
  ksro_nama: string | null;
  created_at: string | null;
  updated_at: string | null;
  updated_by: string;
  updated_by_name: string;
  rincian: ExpenditureAjuDetailItem[];
  approval_history: ExpenditureAjuApprovalHistoryItem[];
};

export type ExpenditureAjuSummary = {
  total_pengajuan: number;
  menunggu_persetujuan: number;
  menunggu_pembayaran: number;
  total_nilai: number;
};

export type ExpenditureAjuListMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
};

export type ExpenditureAjuListResponse = {
  rows: ExpenditureAjuRow[];
  summary: ExpenditureAjuSummary;
  meta: ExpenditureAjuListMeta;
};

export function formatExpenditureAjuAmount(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatExpenditureAjuDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export const EXPENDITURE_AJU_PER_PAGE_OPTIONS = [10, 25, 50] as const;
