export type HpMeta = {
  tahun: number | null;
  bulan_options: { value: number; label: string }[];
  hutang_jenis_options: { value: string; label: string }[];
  piutang_jenis_options: { value: string; label: string }[];
  sources: { hutang: string; piutang: string };
};

export type HpJournalRow = {
  no_jurnal: string;
  tanggal: string | null;
  keterangan: string;
  jenis_jurnal: string;
  account_no: string;
  account_name: string;
  jenis: string;
  debet: number;
  kredit: number;
  amount: number;
  status: string;
  no_beli?: string;
  no_bku?: string;
  no_reg?: string;
  no_mr?: string;
  rekon_status?: string;
  tipe?: string;
};

export type HpAccountRow = {
  account_no: string;
  account_name: string;
  jumlah: number;
  saldo: number;
};

export type HpListMeta = {
  page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export type HpDashboardData = {
  filters: { tahun: number; bulan: number | null };
  kpis: {
    total_hutang: number;
    total_piutang: number;
    net_posisi: number;
    hutang_vendor: number;
    piutang_bpjs: number;
    piutang_tunai: number;
  };
  hutang_composition: { jenis: string; saldo: number }[];
  piutang_composition: { jenis: string; saldo: number }[];
  trend: { bulan: number; month: string; hutang: number; piutang: number }[];
  aging: { key: string; label: string; amount: number }[];
  hutang_per_akun: HpAccountRow[];
  piutang_per_akun: HpAccountRow[];
};

export type HpAgingRow = HpJournalRow & {
  umur_hari: number;
  bucket: string;
  bucket_label: string;
  outstanding: number;
};

export const HP_PER_PAGE_OPTIONS = [10, 20, 50] as const;

export function formatHpAmount(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatHpDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value + "T00:00:00").toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function hutangJenisLabel(jenis: string): string {
  const map: Record<string, string> = {
    vendor: "Vendor",
    bekkes: "Bekkes",
    jasa: "Jasa",
    bpjs: "BPJS",
    tunai: "Tunai",
    asuransi: "Asuransi",
    lainnya: "Lainnya",
  };
  return map[jenis] ?? jenis;
}

export function hpStatusLabel(status: string): string {
  const map: Record<string, string> = {
    terutang: "Terutang",
    dibayar: "Dibayar",
    outstanding: "Outstanding",
    lunas: "Lunas",
    netral: "Netral",
    matched: "Cocok",
    pending: "Belum Cocok",
  };
  return map[status] ?? status;
}
