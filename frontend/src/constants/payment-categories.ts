export type PaymentJenisId = "pengadaan" | "payroll" | "reimbursement";

export type PaymentJenis = {
  id: PaymentJenisId;
  labelKey: `finance.payments.jenis.${PaymentJenisId}`;
};

export const PAYMENT_JENIS: PaymentJenis[] = [
  { id: "pengadaan", labelKey: "finance.payments.jenis.pengadaan" },
  { id: "payroll", labelKey: "finance.payments.jenis.payroll" },
  { id: "reimbursement", labelKey: "finance.payments.jenis.reimbursement" },
];

const JENIS_IDS = new Set<string>(PAYMENT_JENIS.map((j) => j.id));

export function resolvePaymentJenisId(value: string | null | undefined): PaymentJenisId | "" {
  if (!value || !JENIS_IDS.has(value)) return "";
  return value as PaymentJenisId;
}

export function getPaymentJenis(id: PaymentJenisId): PaymentJenis {
  const found = PAYMENT_JENIS.find((j) => j.id === id);
  if (!found) throw new Error(`Unknown payment jenis: ${id}`);
  return found;
}
