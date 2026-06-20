export type RiwayatJenis = "revisi" | "pergeseran" | "blokir";

export type BudgetRiwayatRow = {
  key: string;
  jenis: RiwayatJenis;
  jenis_label: string;
  ref_id: number;
  nomor: string | null;
  ringkasan: string;
  detail: string | null;
  nilai: number;
  nilai_label: string;
  status: string;
  status_label: string;
  occurred_at: string | null;
  actor: string | null;
  extra?: Record<string, unknown>;
};

export type BudgetRiwayatEvent = {
  occurred_at: string | null;
  action: string;
  action_label: string;
  actor: string | null;
  note: string | null;
  metadata: Record<string, unknown> | null;
};

export type BudgetRiwayatSummary = {
  total: number;
  revisi: number;
  pergeseran: number;
  blokir: number;
  applied: number;
};

export type BudgetRiwayatListMeta = {
  page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export const RIWAYAT_JENIS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Semua jenis" },
  { value: "revisi", label: "Revisi Pagu" },
  { value: "pergeseran", label: "Pergeseran" },
  { value: "blokir", label: "Blokir" },
];

export const RIWAYAT_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Semua status" },
  { value: "applied", label: "Diterapkan" },
  { value: "in_review", label: "Dalam review" },
  { value: "draft", label: "Draft" },
  { value: "rejected", label: "Ditolak" },
];

export function formatRiwayatAmount(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const prefix = value > 0 ? "+" : "";
  return prefix + new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Math.trunc(value));
}

export function formatRiwayatDate(iso: string | null): string {
  if (!iso) return "—";
  return iso.slice(0, 16).replace("T", " ");
}
