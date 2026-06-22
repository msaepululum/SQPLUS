export type PaymentWorkflowStageId =
  | "belum-proses-tagihan"
  | "permintaan-bayar"
  | "rencana-bayar"
  | "verifikasi-pajak"
  | "pembayaran-selesai";

export type PaymentWorkflowStageLabelKey =
  | "finance.payments.tahap.belumProsesTagihan"
  | "finance.payments.tahap.permintaanBayar"
  | "finance.payments.tahap.rencanaBayar"
  | "finance.payments.tahap.verifikasiPajak"
  | "finance.payments.tahap.pembayaranSelesai";

export type PaymentWorkflowStage = {
  id: PaymentWorkflowStageId;
  labelKey: PaymentWorkflowStageLabelKey;
  badgeClass: string;
  chartColor: string;
};

/**
 * Alur pembayaran RS (SIMARTDB):
 * Belum Proses Tagihan → Permintaan Bayar → Rencana Bayar → Verifikasi Pajak → Pembayaran Selesai (BKU)
 */
export const PAYMENT_WORKFLOW_STAGES: PaymentWorkflowStage[] = [
  {
    id: "belum-proses-tagihan",
    labelKey: "finance.payments.tahap.belumProsesTagihan",
    badgeClass: "bg-slate-100 text-slate-700",
    chartColor: "bg-slate-400",
  },
  {
    id: "permintaan-bayar",
    labelKey: "finance.payments.tahap.permintaanBayar",
    badgeClass: "bg-sky-100 text-sky-800",
    chartColor: "bg-sky-500",
  },
  {
    id: "rencana-bayar",
    labelKey: "finance.payments.tahap.rencanaBayar",
    badgeClass: "bg-indigo-100 text-indigo-800",
    chartColor: "bg-indigo-500",
  },
  {
    id: "verifikasi-pajak",
    labelKey: "finance.payments.tahap.verifikasiPajak",
    badgeClass: "bg-violet-100 text-violet-800",
    chartColor: "bg-violet-500",
  },
  {
    id: "pembayaran-selesai",
    labelKey: "finance.payments.tahap.pembayaranSelesai",
    badgeClass: "bg-emerald-100 text-emerald-800",
    chartColor: "bg-emerald-500",
  },
];

const STAGE_BY_ID = Object.fromEntries(
  PAYMENT_WORKFLOW_STAGES.map((s) => [s.id, s])
) as Record<PaymentWorkflowStageId, PaymentWorkflowStage>;

const STAGE_IDS = new Set<string>(PAYMENT_WORKFLOW_STAGES.map((s) => s.id));

/** Alias slug/tab lama → tahap alur resmi */
const LEGACY_STAGE_IDS: Record<string, PaymentWorkflowStageId> = {
  tagihan: "belum-proses-tagihan",
  "tagihan-dokumen": "belum-proses-tagihan",
  permintaan: "permintaan-bayar",
  "daftar-permintaan": "permintaan-bayar",
  "buat-permintaan": "permintaan-bayar",
  verifikasi: "verifikasi-pajak",
  "verifikasi-keuangan": "verifikasi-pajak",
  voucher: "pembayaran-selesai",
  pembayaran: "pembayaran-selesai",
  "posting-jurnal": "pembayaran-selesai",
  approval: "rencana-bayar",
};

export function resolvePaymentWorkflowStageId(
  value: string | null | undefined
): PaymentWorkflowStageId | "" {
  if (!value) return "";
  if (STAGE_IDS.has(value)) return value as PaymentWorkflowStageId;
  return LEGACY_STAGE_IDS[value] ?? "";
}

export function getPaymentWorkflowStage(id: PaymentWorkflowStageId): PaymentWorkflowStage {
  const stage = STAGE_BY_ID[id];
  if (!stage) throw new Error(`Unknown payment workflow stage: ${id}`);
  return stage;
}

export const PAYMENT_WORKFLOW_SUMMARY =
  "Belum Proses Tagihan → Permintaan Bayar → Rencana Bayar → Verifikasi Pajak → Pembayaran Selesai (BKU)";
