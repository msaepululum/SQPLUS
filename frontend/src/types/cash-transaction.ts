export type CashTransactionFlowType = "masuk" | "keluar" | "riwayat";

export type CashTransactionSource = "acc2026" | "manual";

export type CashTransactionLine = {
  account_no: string;
  account_name: string;
  keterangan: string;
  debet: number;
  kredit: number;
};

export type CashTransactionRow = {
  id: string;
  no_jurnal: string;
  tanggal: string | null;
  flow_type: string;
  journal_type: string;
  journal_type_label: string;
  keterangan: string;
  no_bukti: string;
  referensi: string;
  kas_account_no: string;
  kas_account_name: string;
  amount: number;
  source: CashTransactionSource;
  status: string;
  posted: boolean;
  editable: boolean;
};

export type CashTransactionDetail = CashTransactionRow & {
  lines: CashTransactionLine[];
  totals: { debet: number; kredit: number };
};

export type CashTransactionSummary = {
  budget_year_id: number;
  tahun: number;
  jumlah_baris: number;
  total_masuk: number;
  total_keluar: number;
  saldo_netto: number;
};

export type CashTransactionListMeta = {
  page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export type CashAccountOption = {
  value: string;
  label: string;
  account_type: "kas" | "bank";
  bank_no?: string;
};

export type CashTransactionMeta = {
  journal_type_options: { value: string; label: string }[];
  flow_type_options: { value: string; label: string }[];
  bulan_options: { value: number; label: string }[];
  kas_account_options: CashAccountOption[];
  bank_account_options: CashAccountOption[];
  source_options: { value: string; label: string }[];
  tahun: number | null;
  acc_connection: string;
};

export const CASH_TRANSACTION_PER_PAGE_OPTIONS = [10, 15, 25, 50] as const;

export function formatCashAmount(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCashDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value + "T00:00:00");
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function flowTypeLabel(flowType: string): string {
  if (flowType === "masuk") return "Masuk";
  if (flowType === "keluar") return "Keluar";
  return "Lainnya";
}

export function sourceLabel(source: CashTransactionSource): string {
  return source === "acc2026" ? "ACC2026" : "Manual SQ+";
}

export function parseCashAmountInput(value: string): number {
  const cleaned = value.replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : 0;
}

export function formatCashAmountInput(value: number): string {
  if (!value) return "";
  return new Intl.NumberFormat("id-ID").format(value);
}
