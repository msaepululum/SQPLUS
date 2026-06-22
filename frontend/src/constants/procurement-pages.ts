import type {
  ProcurementNavLabelKey,
  ProcurementSectionLabelKey,
} from "./procurement-navigation";

export type ProcurementSection = {
  id: string;
  labelKey: ProcurementSectionLabelKey;
  description: string;
};

export type ProcurementModuleConfig = {
  slug: string;
  labelKey: ProcurementNavLabelKey;
  title: string;
  subtitle: string;
  sections?: ProcurementSection[];
};

export const PROCUREMENT_MODULES: ProcurementModuleConfig[] = [
  {
    slug: "permintaan",
    labelKey: "procurement.nav.permintaan",
    title: "Permintaan Barang/Jasa",
    subtitle: "Pengajuan kebutuhan barang dan jasa dari unit kerja — PR ke pengadaan",
    sections: [
      {
        id: "daftar",
        labelKey: "procurement.permintaan.daftar",
        description: "Daftar permintaan barang/jasa — status, unit pemohon, dan nilai estimasi",
      },
      {
        id: "buat",
        labelKey: "procurement.permintaan.buat",
        description: "Form pengajuan permintaan barang/jasa baru",
      },
      {
        id: "tracking",
        labelKey: "procurement.permintaan.tracking",
        description: "Lacak status permintaan dari draft hingga disetujui atau ditolak",
      },
    ],
  },
  {
    slug: "perencanaan",
    labelKey: "procurement.nav.perencanaan",
    title: "Perencanaan Pengadaan",
    subtitle: "Perencanaan paket pengadaan, jadwal, dan alokasi anggaran komitmen",
  },
  {
    slug: "vendor",
    labelKey: "procurement.nav.vendor",
    title: "Vendor",
    subtitle: "Manajemen rekanan — registrasi, evaluasi kinerja, dan daftar hitam",
    sections: [
      {
        id: "daftar",
        labelKey: "procurement.vendor.daftar",
        description: "Daftar vendor terdaftar beserta klasifikasi dan status aktif",
      },
      {
        id: "evaluasi",
        labelKey: "procurement.vendor.evaluasi",
        description: "Evaluasi kinerja vendor berdasarkan kualitas, ketepatan, dan harga",
      },
      {
        id: "registrasi",
        labelKey: "procurement.vendor.registrasi",
        description: "Pendaftaran vendor baru — dokumen legal, NPWP, dan rekening bank",
      },
    ],
  },
  {
    slug: "hps-penawaran",
    labelKey: "procurement.nav.hpsPenawaran",
    title: "HPS & Penawaran",
    subtitle: "Harga Perkiraan Sendiri, penawaran vendor, dan evaluasi penawaran",
    sections: [
      {
        id: "hps",
        labelKey: "procurement.hpsPenawaran.hps",
        description: "Penyusunan dan persetujuan HPS sebagai acuan evaluasi penawaran",
      },
      {
        id: "penawaran",
        labelKey: "procurement.hpsPenawaran.penawaran",
        description: "Penerimaan dan pencatatan penawaran dari vendor",
      },
      {
        id: "evaluasi",
        labelKey: "procurement.hpsPenawaran.evaluasi",
        description: "Evaluasi administrasi, teknis, dan harga penawaran vendor",
      },
    ],
  },
  {
    slug: "negosiasi",
    labelKey: "procurement.nav.negosiasi",
    title: "Negosiasi",
    subtitle: "Proses negosiasi harga dan syarat dengan vendor terpilih",
  },
  {
    slug: "po-spk-kontrak",
    labelKey: "procurement.nav.poSpkKontrak",
    title: "PO / SPK / Kontrak",
    subtitle: "Penerbitan purchase order, surat perintah kerja, dan kontrak pengadaan",
    sections: [
      {
        id: "po",
        labelKey: "procurement.poSpkKontrak.po",
        description: "Purchase Order untuk pengadaan barang",
      },
      {
        id: "spk",
        labelKey: "procurement.poSpkKontrak.spk",
        description: "Surat Perintah Kerja untuk pengadaan jasa",
      },
      {
        id: "kontrak",
        labelKey: "procurement.poSpkKontrak.kontrak",
        description: "Kontrak pengadaan jangka menengah/panjang",
      },
    ],
  },
  {
    slug: "penerimaan",
    labelKey: "procurement.nav.penerimaan",
    title: "Penerimaan Barang/Jasa",
    subtitle: "Goods receipt, berita acara serah terima, dan retur — terintegrasi ke stok & keuangan",
    sections: [
      {
        id: "barang",
        labelKey: "procurement.penerimaan.barang",
        description: "Pencatatan penerimaan barang sesuai PO/SPK",
      },
      {
        id: "berita-acara",
        labelKey: "procurement.penerimaan.beritaAcara",
        description: "Berita acara serah terima barang/jasa",
      },
      {
        id: "retur",
        labelKey: "procurement.penerimaan.retur",
        description: "Retur barang tidak sesuai spesifikasi atau pembatalan penerimaan",
      },
    ],
  },
  {
    slug: "dokumen",
    labelKey: "procurement.nav.dokumen",
    title: "Dokumen Pengadaan",
    subtitle: "Arsip dokumen tender, kontrak, BAST, dan lampiran pengadaan",
  },
  {
    slug: "monitoring",
    labelKey: "procurement.nav.monitoring",
    title: "Monitoring Pengadaan",
    subtitle: "Pantau status paket pengadaan, SLA, dan tenggat waktu per tahap",
  },
  {
    slug: "approval",
    labelKey: "procurement.nav.approval",
    title: "Approval Pengadaan",
    subtitle: "Antrian persetujuan PR, HPS, PO/SPK, dan penerimaan barang/jasa",
    sections: [
      {
        id: "inbox",
        labelKey: "procurement.approval.inbox",
        description: "Inbox approval menunggu tindakan Anda",
      },
      {
        id: "riwayat",
        labelKey: "procurement.approval.riwayat",
        description: "Riwayat keputusan approval pengadaan",
      },
    ],
  },
  {
    slug: "laporan",
    labelKey: "procurement.nav.laporan",
    title: "Laporan Pengadaan",
    subtitle: "Laporan permintaan, PO/SPK, vendor, dan monitoring pengadaan",
    sections: [
      {
        id: "permintaan",
        labelKey: "procurement.laporan.permintaan",
        description: "Rekapitulasi permintaan barang/jasa per unit dan periode",
      },
      {
        id: "po",
        labelKey: "procurement.laporan.po",
        description: "Laporan PO, SPK, dan kontrak — nilai komitmen dan realisasi",
      },
      {
        id: "vendor",
        labelKey: "procurement.laporan.vendor",
        description: "Laporan kinerja dan transaksi per vendor",
      },
      {
        id: "monitoring",
        labelKey: "procurement.laporan.monitoring",
        description: "Laporan status paket pengadaan dan SLA",
      },
    ],
  },
  {
    slug: "pengaturan",
    labelKey: "procurement.nav.pengaturan",
    title: "Pengaturan Pengadaan",
    subtitle: "Workflow, master data, dan threshold approval pengadaan",
    sections: [
      {
        id: "workflow",
        labelKey: "procurement.pengaturan.workflow",
        description: "Konfigurasi alur approval PR, PO, dan penerimaan",
      },
      {
        id: "master",
        labelKey: "procurement.pengaturan.master",
        description: "Master kategori barang/jasa, metode pengadaan, dan syarat umum",
      },
      {
        id: "threshold",
        labelKey: "procurement.pengaturan.threshold",
        description: "Batas nilai approval per peran — unit, procurement, direktur",
      },
    ],
  },
];

export const PROCUREMENT_MODULE_BY_SLUG = Object.fromEntries(
  PROCUREMENT_MODULES.map((module) => [module.slug, module])
) as Record<string, ProcurementModuleConfig>;
