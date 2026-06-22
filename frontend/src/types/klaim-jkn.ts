export type KlaimJknMeta = {
  tahun: number | null;
  source_table: string;
  source_db: string;
  status_options: { value: string; label: string }[];
};

export type KlaimJknRow = {
  id_klaim: number;
  no_fpk: string;
  no_sep: string;
  tgl_sep: string | null;
  tgl_pulang: string | null;
  no_kartu: string;
  nama: string;
  no_mr: string;
  kelas_rawat: string;
  poli: string;
  status_kode: string;
  status_label: string;
  by_pengajuan: number;
  by_tarif_gruper: number;
  by_tarif_rs: number;
  by_topup: number;
  by_setujui: number;
  selisih_rs_gruper: number;
  kode_inacbg: string;
  nama_inacbg: string;
};

export type KlaimJknListMeta = {
  page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export const KLAIM_JKN_PER_PAGE_OPTIONS = [10, 20, 50] as const;

export function formatKlaimAmount(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatKlaimDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value + "T00:00:00").toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function klaimStatusVariant(label: string): "success" | "warning" | "danger" | "info" | "draft" {
  const lower = label.toLowerCase();
  if (lower.includes("setuju") || lower.includes("bayar") || lower.includes("selesai")) return "success";
  if (lower.includes("pending") || lower.includes("proses")) return "warning";
  if (lower.includes("tolak") || lower.includes("batal")) return "danger";
  if (lower.includes("verif")) return "info";
  return "draft";
}
