export type ExpenditureRequestStatusId =
  | "draft"
  | "diajukan"
  | "disetujui"
  | "menunggu-pembayaran"
  | "sudah-dibayar"
  | "ditolak"
  | "dibatalkan";

export type ExpenditureRequestStatusLabelKey =
  | "finance.expenditure.status.draft"
  | "finance.expenditure.status.diajukan"
  | "finance.expenditure.status.disetujui"
  | "finance.expenditure.status.menungguPembayaran"
  | "finance.expenditure.status.sudahDibayar"
  | "finance.expenditure.status.ditolak"
  | "finance.expenditure.status.dibatalkan";

export type ExpenditureRequestStatus = {
  id: ExpenditureRequestStatusId;
  labelKey: ExpenditureRequestStatusLabelKey;
  /** Badge pill di tabel transaksi */
  badgeClass: string;
  /** Bar warna di ringkasan proses */
  chartColor: string;
};

/**
 * Alur status pengajuan belanja:
 * Draft → Diajukan → Disetujui → Menunggu Pembayaran → Sudah Dibayar
 * Cabang: Ditolak / Dibatalkan
 */
export const EXPENDITURE_REQUEST_STATUSES: ExpenditureRequestStatus[] = [
  {
    id: "draft",
    labelKey: "finance.expenditure.status.draft",
    badgeClass: "bg-slate-100 text-slate-700",
    chartColor: "bg-slate-400",
  },
  {
    id: "diajukan",
    labelKey: "finance.expenditure.status.diajukan",
    badgeClass: "bg-sky-100 text-sky-800",
    chartColor: "bg-sky-500",
  },
  {
    id: "disetujui",
    labelKey: "finance.expenditure.status.disetujui",
    badgeClass: "bg-blue-100 text-blue-800",
    chartColor: "bg-blue-500",
  },
  {
    id: "menunggu-pembayaran",
    labelKey: "finance.expenditure.status.menungguPembayaran",
    badgeClass: "bg-amber-100 text-amber-800",
    chartColor: "bg-amber-500",
  },
  {
    id: "sudah-dibayar",
    labelKey: "finance.expenditure.status.sudahDibayar",
    badgeClass: "bg-emerald-100 text-emerald-800",
    chartColor: "bg-emerald-500",
  },
  {
    id: "ditolak",
    labelKey: "finance.expenditure.status.ditolak",
    badgeClass: "bg-red-100 text-red-800",
    chartColor: "bg-red-500",
  },
  {
    id: "dibatalkan",
    labelKey: "finance.expenditure.status.dibatalkan",
    badgeClass: "bg-zinc-100 text-zinc-600",
    chartColor: "bg-zinc-400",
  },
];

const STATUS_BY_ID = Object.fromEntries(
  EXPENDITURE_REQUEST_STATUSES.map((s) => [s.id, s])
) as Record<ExpenditureRequestStatusId, ExpenditureRequestStatus>;

const STATUS_IDS = new Set<string>(EXPENDITURE_REQUEST_STATUSES.map((s) => s.id));

/** Alias slug/status lama → status resmi */
const LEGACY_STATUS_IDS: Record<string, ExpenditureRequestStatusId> = {
  diverifikasi: "diajukan",
  selesai: "sudah-dibayar",
};

export function resolveExpenditureRequestStatusId(
  value: string | null | undefined
): ExpenditureRequestStatusId | "" {
  if (!value) return "";
  if (STATUS_IDS.has(value)) return value as ExpenditureRequestStatusId;
  return LEGACY_STATUS_IDS[value] ?? "";
}

export function getExpenditureRequestStatus(
  id: ExpenditureRequestStatusId
): ExpenditureRequestStatus {
  const status = STATUS_BY_ID[id];
  if (!status) throw new Error(`Unknown expenditure request status: ${id}`);
  return status;
}

export function expenditureStatusLabel(
  id: ExpenditureRequestStatusId,
  t: (key: string) => string
): string {
  return t(getExpenditureRequestStatus(id).labelKey);
}

/** Label tampilan default (ID) — untuk filter & mock data */
export const EXPENDITURE_REQUEST_STATUS_LABELS_ID: Record<ExpenditureRequestStatusId, string> = {
  draft: "Draft",
  diajukan: "Diajukan",
  disetujui: "Disetujui",
  "menunggu-pembayaran": "Menunggu Pembayaran",
  "sudah-dibayar": "Sudah Dibayar",
  ditolak: "Ditolak",
  dibatalkan: "Dibatalkan",
};

export const EXPENDITURE_REQUEST_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Semua Status" },
  ...EXPENDITURE_REQUEST_STATUSES.map((s) => ({
    value: s.id,
    labelKey: s.labelKey,
  })),
] as const;
