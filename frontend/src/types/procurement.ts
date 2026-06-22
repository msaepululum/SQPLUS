export type ProcurementMeta = {
  tahun: number;
  bulan_options: { value: number; label: string }[];
  queue_options: { value: string; label: string }[];
  nego_status_options: { value: string; label: string }[];
  po_jenis_options: { value: string; label: string }[];
};

export type ProcurementDashboard = {
  tahun: number;
  bulan: number | null;
  kpi: {
    aju_antrian: number;
    aju_close: number;
    negosiasi_aktif: number;
    po_aktif: number;
    penerimaan: number;
    belum_tukar_faktur: number;
  };
  sources: Record<string, string>;
};

export type ProcurementListMeta = {
  total: number;
  page: number;
  per_page: number;
  last_page: number;
  from: number;
  to: number;
};

export type ProcurementListResponse<T> = {
  rows: T[];
  summary: Record<string, string | number | null>;
  meta: ProcurementListMeta;
};

export type ProcurementPermintaanRow = {
  id: number;
  no_pengajuan: string;
  tanggal: string | null;
  unit: string;
  uraian: string;
  total: number;
  status: string;
  status_label: string;
  status_db: string;
  tahap_proses: string;
  tahap_label: string;
  no_nego: string | null;
  no_sppd: string | null;
  sumber: string;
  no_po_simart: string | null;
  no_beli_simart: string | null;
  jumlah_po: number;
  jumlah_penerimaan: number;
};

export type ProcurementNegosiasiRow = {
  no_nego: string;
  no_aju: string;
  nego_status: string;
  nego_status_label: string;
  tgl_nego: string | null;
  nama_aju: string;
  nilai_aju: number;
  aju_status: string;
  tgl_aju: string | null;
};

export type ProcurementPoRow = {
  no_po: string;
  tgl_po: string | null;
  no_aju: string | null;
  nama_supplier: string;
  kode_supplier: string;
  kelompok_belanja: string;
  uraian: string;
  total: number;
  jumlah_item: number;
  jenis_po: string | null;
  jenis_label: string;
  no_spk: string | null;
  no_kontrak: string | null;
  no_spp: string | null;
  no_beli: string | null;
  status_tutup: boolean;
  valid: boolean;
};

export type ProcurementPoDetail = {
  header: {
    no_po: string;
    tgl_po: string | null;
    no_aju: string | null;
    nama_supplier: string;
    kode_supplier: string;
    kelompok_belanja: string;
    uraian: string;
    total: number;
    ppn: number;
    pph22: number;
    pph23: number;
    jenis_label: string;
    no_spk: string | null;
    no_kontrak: string | null;
    no_beli: string | null;
    jatuh_tempo: string | null;
    no_dokumen: string | null;
  };
  lines: {
    urut: number;
    kode_barang: string;
    nama_barang: string;
    satuan: string;
    qty_po: number;
    qty_nego: number;
    harga: number;
    subtotal: number;
    total: number;
    merk: string | null;
    tipe: string | null;
    spesifikasi: string | null;
  }[];
};

export type ProcurementPenerimaanRow = {
  no_beli: string;
  tgl_beli: string | null;
  no_aju: string | null;
  no_po: string | null;
  nama_supplier: string;
  kode_supplier: string;
  kelompok_belanja: string;
  uraian: string;
  total: number;
  jumlah_item: number;
  no_bast: string | null;
  sudah_proses: boolean;
};

export type ProcurementPenerimaanDetail = {
  header: {
    no_beli: string;
    tgl_beli: string | null;
    no_aju: string | null;
    no_po: string | null;
    nama_supplier: string;
    kode_supplier: string;
    kelompok_belanja: string;
    uraian: string;
    total: number;
    ppn: number;
    pph22: number;
    pph23: number;
    no_bast: string | null;
    no_bapp: string | null;
    jatuh_tempo: string | null;
    no_dokumen: string | null;
  };
  lines: {
    urut: number;
    kode_barang: string;
    nama_barang: string;
    satuan: string;
    qty: number;
    qty_terima: number;
    harga: number;
    subtotal: number;
    total: number;
    no_po: string | null;
    exp_date: string | null;
    no_batch: string | null;
  }[];
};

export type ProcurementVendorRow = {
  kode_supplier: string;
  nama_supplier: string;
  aktif: boolean;
  npwp: string | null;
  pkp: string | null;
  alamat: string;
  telepon: string | null;
  contact_person: string | null;
  bank: string | null;
  rekening: string | null;
  blacklist: boolean;
  alasan_blacklist: string | null;
};

export function formatProcurementAmount(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatProcurementDate(value: string | null): string {
  if (!value) return "—";
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
}
