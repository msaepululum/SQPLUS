export type AccListMeta = {
  page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export type AccJournalRow = {
  no_jurnal: string;
  tanggal: string | null;
  keterangan: string;
  no_bukti?: string;
  journal_type: string;
  journal_type_label: string;
  debet: number;
  kredit: number;
  account_no?: string;
  account_name?: string;
  posted: boolean;
  valid: boolean;
};

export type AccCoaRow = {
  account_no: string;
  account_name: string;
  kelompok: string;
  kelompok_label: string;
  level: number;
  is_detail: boolean;
  normal_balance: string;
  saldo: number;
};

export type AccDashboardData = {
  filters: { tahun: number; bulan: number | null };
  source: string;
  kpis: {
    total_jurnal: number;
    belum_posting: number;
    sudah_posting: number;
    total_coa: number;
    saldo_aset: number;
    saldo_kewajiban: number;
    saldo_ekuitas: number;
    surplus_periode: number;
    periode_tertutup: number;
    periode_terbuka: number;
  };
  journal_by_type: { journal_type: string; label: string; count: number; total_debet: number }[];
  monthly_trend: { bulan: number; label: string; count: number; debet: number; kredit: number }[];
  group_composition: { kelompok: string; label: string; saldo: number }[];
  recent_journals: AccJournalRow[];
  tutup_buku_summary: {
    months: { bulan: number; label: string; closed: boolean }[];
    closed_count: number;
    open_count: number;
    current_open_month: number | null;
  };
};

export type AccFinancialSection = {
  kelompok: string;
  label: string;
  total: number;
  rows: { account_no: string; account_name: string; level: number; is_detail: boolean; saldo: number }[];
};

export type AccFinancialReport = {
  filters: { tahun: number; bulan: number | null };
  source: string;
  report_type: string;
  sections: AccFinancialSection[];
  summary: Record<string, number>;
};

export type AccBukuBesarRow = {
  no_jurnal: string;
  tanggal: string | null;
  keterangan: string;
  journal_type: string;
  debet: number;
  kredit: number;
  saldo: number;
  posted: boolean;
  valid: boolean;
};

export const ACC_PER_PAGE_OPTIONS = [10, 20, 50] as const;

export function formatAccAmount(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatAccDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value + "T00:00:00").toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatAccNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}
