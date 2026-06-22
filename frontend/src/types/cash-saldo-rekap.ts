export type CashSaldoMeta = {
  bulan_options: { value: number; label: string }[];
  kas_account_options: { value: string; label: string; account_type: string }[];
  tahun: number | null;
};

export type CashPosisiSaldoRow = {
  account_no: string;
  account_name: string;
  account_type: string;
  saldo_awal: number;
  masuk: number;
  keluar: number;
  saldo_akhir: number;
};

export type CashPosisiSaldoSummary = {
  tahun: number;
  bulan: number | null;
  bulan_label: string;
  saldo_awal: number;
  total_masuk: number;
  total_keluar: number;
  saldo_akhir: number;
  jumlah_rekening: number;
};

export type CashRekapBulananRow = {
  bulan: number;
  bulan_label: string;
  bulan_short: string;
  saldo_awal: number;
  masuk: number;
  keluar: number;
  neto: number;
  saldo_akhir: number;
  jumlah_transaksi: number;
};

export type CashBukuKasRow = {
  no_bku: string;
  no_jurnal: string;
  tanggal: string | null;
  keterangan: string;
  no_bayar: string;
  masuk: number;
  keluar: number;
  flow_type: string;
  posted_acc: boolean;
  saldo?: number;
};

export type CashListMeta = {
  page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export type CashProyeksiData = {
  assumptions: {
    bulan_berjalan: number;
    bulan_sisa: number;
    rata_masuk_bulan: number;
    rata_keluar_bulan: number;
    pending_bku_belum_acc: number;
  };
  summary: {
    saldo_saat_ini: number;
    estimasi_masuk_sisa: number;
    estimasi_keluar_sisa: number;
    pending_keluar: number;
    pending_masuk: number;
    saldo_proyeksi_akhir: number;
  };
  scenarios: Array<{
    bulan: number;
    bulan_label: string;
    estimasi_masuk: number;
    estimasi_keluar: number;
    saldo_proyeksi: number;
  }>;
  actual_ytd: { masuk: number; keluar: number };
};

export const CASH_SALDO_PER_PAGE_OPTIONS = [10, 20, 50] as const;

export function formatSaldoAmount(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatSaldoDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value + "T00:00:00").toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
