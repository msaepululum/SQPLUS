export type SupplyChainAlert = {
  jenis: string;
  deskripsi: string;
  prioritas: "Tinggi" | "Sedang" | "Rendah";
  jumlah: number;
  href: string;
};

export type SupplyChainFinancial = {
  nilai_perolehan_bmd: number;
  akumulasi_penyusutan: number;
  nilai_buku_bmd: number;
  estimasi_penyusutan_tahun_ini: number;
  penyusutan_pct: number;
  nilai_buku_pct: number;
  item_bmd_aktif: number;
  item_dengan_masa_manfaat: number;
  source: string;
  error?: string;
};

export type SupplyChainInventory = {
  master_barang: number;
  item_aktif: number;
  nilai_persediaan_hpp: number;
  nilai_persediaan_netto: number;
  stok_kritis: number;
  source: string;
  error?: string;
};

export type SupplyChainOperational = {
  register_bmd: number;
  belum_verifikasi: number;
  sudah_verifikasi: number;
  mutasi_pending: number;
  disposal_pending: number;
  ruangan: number;
  kode_permen: number;
};

export type SupplyChainComposition = {
  label: string;
  count: number;
  value: number;
  pct: number;
  color: string;
};

export type SupplyChainPerolehanTrend = {
  year: number;
  count: number;
  value: number;
};

export type SupplyChainDashboard = {
  as_of: string;
  sources: { id: string; label: string; connection: string }[];
  financial: SupplyChainFinancial;
  inventory: SupplyChainInventory;
  operational: SupplyChainOperational;
  composition: SupplyChainComposition[];
  perolehan_trend: SupplyChainPerolehanTrend[];
  kondisi: { label: string; count: number }[];
  depreciation_note: string;
  alerts: SupplyChainAlert[];
};

export type SupplyChainListMeta = {
  slug: string;
  stage: string;
  label: string;
  source: string;
  connection: string;
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
  error?: string;
};

export type SupplyChainListResponse = {
  data: Record<string, unknown>[];
  columns: string[];
  meta: SupplyChainListMeta;
};

export type SupplyChainMonitoring = {
  alerts: SupplyChainAlert[];
  summary: {
    inventaris_by_kondisi: { label: string; count: number }[];
    invent_by_klasifikasi: { label: string; count: number }[];
  };
};

export const SUPPLY_CHAIN_PER_PAGE_OPTIONS = [10, 20, 50] as const;

export function formatAssetAmount(value: number, compact = true): string {
  if (compact) {
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000_000) return `Rp ${(value / 1_000_000_000_000).toFixed(2)} T`;
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

export const ASSET_COMPOSITION_COLORS = [
  "#14B8A6",
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#EC4899",
  "#64748B",
];
