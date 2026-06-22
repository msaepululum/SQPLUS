export type ExpenditureProcessStageId =
  | "draft"
  | "diajukan"
  | "menunggu-persetujuan"
  | "disetujui"
  | "negosiasi"
  | "surat-pesanan"
  | "penerimaan-barang"
  | "verifikasi-berkas"
  | "rencana-bayar"
  | "pembayaran-berhasil"
  | "ditolak"
  | "dibatalkan";

export type ExpenditureTrackingStepState =
  | "done"
  | "current"
  | "pending"
  | "rejected"
  | "cancelled";

export type ExpenditureTrackingStep = {
  id: string;
  label: string;
  state: ExpenditureTrackingStepState;
};

export const EXPENDITURE_PROCESS_STAGE_LABELS: Record<ExpenditureProcessStageId, string> = {
  draft: "Draft",
  diajukan: "Diajukan",
  "menunggu-persetujuan": "Menunggu Persetujuan",
  disetujui: "Disetujui",
  negosiasi: "Negosiasi",
  "surat-pesanan": "Surat Pesanan",
  "penerimaan-barang": "Penerimaan Barang",
  "verifikasi-berkas": "Verifikasi Berkas",
  "rencana-bayar": "Rencana Bayar",
  "pembayaran-berhasil": "Pembayaran Berhasil",
  ditolak: "Ditolak",
  dibatalkan: "Dibatalkan",
};

export const EXPENDITURE_PROCESS_FILTER_OPTIONS = [
  { value: "", label: "Semua Tahap" },
  ...(
    Object.entries(EXPENDITURE_PROCESS_STAGE_LABELS) as [ExpenditureProcessStageId, string][]
  ).map(([value, label]) => ({ value, label })),
];

export function expenditureStageBadgeClass(stage: ExpenditureProcessStageId): string {
  if (stage === "pembayaran-berhasil" || stage === "disetujui") {
    return "bg-emerald-100 text-emerald-800";
  }
  if (stage === "ditolak") return "bg-red-100 text-red-800";
  if (stage === "dibatalkan") return "bg-zinc-100 text-zinc-600";
  if (stage === "rencana-bayar" || stage === "menunggu-persetujuan") {
    return "bg-amber-100 text-amber-800";
  }
  if (stage === "negosiasi" || stage === "surat-pesanan") return "bg-violet-100 text-violet-800";
  if (stage === "penerimaan-barang" || stage === "verifikasi-berkas") {
    return "bg-teal-100 text-teal-800";
  }
  if (stage === "diajukan") return "bg-sky-100 text-sky-800";
  return "bg-slate-100 text-slate-700";
}
