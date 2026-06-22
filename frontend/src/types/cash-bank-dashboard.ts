export type CashBankDashboardKpis = {
  total_masuk: number;
  total_keluar: number;
  saldo_netto: number;
  jumlah_transaksi: number;
  posted_ke_acc: number;
  belum_posting_acc: number;
  rekon_acc_pct: number;
  acc_jurnal_count: number;
  acc_jurnal_total: number;
};

export type CashBankDashboardTrendPoint = {
  month: string;
  bulan: number;
  masuk: number;
  keluar: number;
  saldo: number;
};

export type CashBankDashboardComposition = {
  label: string;
  amount: number;
  pct?: number;
};

export type CashBankDashboardAccount = {
  account_no: string;
  account_name: string;
  masuk: number;
  keluar: number;
  saldo: number;
};

export type CashBankDashboardTransaction = {
  no_bku: string;
  no_jurnal: string;
  tanggal: string | null;
  keterangan: string;
  flow_type: "masuk" | "keluar";
  amount: number;
  no_bayar: string;
  posted_acc: boolean;
};

export type CashBankDashboardData = {
  sources: {
    operational: string;
    accounting: string;
  };
  filters: {
    tahun: number;
    bulan: number | null;
  };
  kpis: CashBankDashboardKpis;
  trend: CashBankDashboardTrendPoint[];
  masuk_composition: CashBankDashboardComposition[];
  keluar_composition: CashBankDashboardComposition[];
  accounts: CashBankDashboardAccount[];
  recent_transactions: CashBankDashboardTransaction[];
};

export function formatDashboardAmount(value: number, compact = false): string {
  if (compact) {
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(2)} M`;
    if (abs >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)} jt`;
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export const DASHBOARD_COMPOSITION_COLORS = [
  "#2563eb",
  "#14b8a6",
  "#f97316",
  "#8b5cf6",
  "#94a3b8",
  "#ec4899",
];
