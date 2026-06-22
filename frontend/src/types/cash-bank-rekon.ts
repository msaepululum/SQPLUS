export type CashBankRekonMeta = {
  bulan_options: { value: number; label: string }[];
  bank_account_options: {
    value: string;
    label: string;
    bank_name: string;
    rekening_no: string;
    acc_coa: string | null;
    source: string;
  }[];
  tahun: number | null;
};

export type RekeningBankRow = {
  account_no: string;
  account_name: string;
  bank_name: string;
  rekening_no: string;
  acc_coa: string | null;
  source: string;
  is_active: boolean;
  saldo_awal: number;
  masuk: number;
  keluar: number;
  saldo_akhir: number;
  saldo_acc: number | null;
  selisih_saldo: number | null;
  jumlah_transaksi: number;
  posted_acc: number;
  rekon_pct: number;
};

export type RekonsiliasiAccountSummary = {
  account_no: string;
  account_name: string;
  bank_name: string;
  saldo_buku: number;
  saldo_acc: number | null;
  selisih: number | null;
  matched: number;
  pending: number;
  selisih_item: number;
};

export type RekonsiliasiRow = {
  account_no: string;
  account_name: string;
  no_bku: string;
  no_jurnal: string;
  tanggal: string | null;
  keterangan: string;
  masuk: number;
  keluar: number;
  amount_bku: number;
  amount_acc: number | null;
  selisih: number | null;
  status: "matched" | "pending" | "selisih";
};

export type CashListMeta = {
  page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export const CASH_BANK_PER_PAGE_OPTIONS = [10, 20, 50] as const;

export function formatBankAmount(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatBankDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value + "T00:00:00").toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function rekonStatusLabel(status: RekonsiliasiRow["status"]): string {
  switch (status) {
    case "matched":
      return "Cocok";
    case "pending":
      return "Belum ACC";
    case "selisih":
      return "Selisih";
  }
}

export function sourceLabel(source: string): string {
  switch (source) {
    case "simart":
      return "SIMARTDB";
    case "acc_tbbank":
      return "ACC tbbank";
    case "acc_vkasbank":
      return "ACC vkasbank";
    default:
      return source;
  }
}
