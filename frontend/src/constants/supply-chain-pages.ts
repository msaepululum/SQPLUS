import type {
  SupplyChainNavLabelKey,
  SupplyChainSectionLabelKey,
} from "./supply-chain-navigation";

export type SupplyChainSection = {
  id: string;
  labelKey: SupplyChainSectionLabelKey;
  description: string;
  dataStage?: string;
  source?: string;
  sqplusOnly?: boolean;
};

export type SupplyChainModuleConfig = {
  slug: string;
  labelKey: SupplyChainNavLabelKey;
  title: string;
  subtitle: string;
  sections?: SupplyChainSection[];
  customView?: "monitoring";
};

export const SUPPLY_CHAIN_MODULES: SupplyChainModuleConfig[] = [
  {
    slug: "master-barang",
    labelKey: "supplyChain.nav.masterBarang",
    title: "Master Barang",
    subtitle:
      "Referensi kode barang Permen, master SIMARTDB, kategori, merk, dan satuan — ASSET_MANAJEMEN + SIMARTDB",
    sections: [
      {
        id: "permen",
        labelKey: "supplyChain.masterBarang.permen",
        description: "Kode barang sesuai Permen — ms_barang_permen (ASSET_MANAJEMEN)",
        dataStage: "permen",
        source: "ASSET_MANAJEMEN.ms_barang_permen",
      },
      {
        id: "invent-simart",
        labelKey: "supplyChain.masterBarang.inventSimart",
        description: "Master persediaan farmasi & logistik — INVENT (SIMARTDB)",
        dataStage: "invent-simart",
        source: "SIMARTDB.INVENT",
      },
      {
        id: "kategori",
        labelKey: "supplyChain.masterBarang.kategori",
        description: "Kategori aset tetap — categories (ASSET_MANAJEMEN)",
        dataStage: "kategori",
        source: "ASSET_MANAJEMEN.categories",
      },
      {
        id: "merk",
        labelKey: "supplyChain.masterBarang.merk",
        description: "Merk / brand barang — brands (ASSET_MANAJEMEN)",
        dataStage: "merk",
        source: "ASSET_MANAJEMEN.brands",
      },
      {
        id: "satuan",
        labelKey: "supplyChain.masterBarang.satuan",
        description: "Satuan barang — units (ASSET_MANAJEMEN)",
        dataStage: "satuan",
        source: "ASSET_MANAJEMEN.units",
      },
      {
        id: "kelompok",
        labelKey: "supplyChain.masterBarang.kelompok",
        description: "Kelompok barang Permen — mskelompok_permen (ASSET_MANAJEMEN)",
        dataStage: "kelompok",
        source: "ASSET_MANAJEMEN.mskelompok_permen",
      },
    ],
  },
  {
    slug: "gudang-stok",
    labelKey: "supplyChain.nav.gudangStok",
    title: "Gudang & Stok",
    subtitle: "Master gudang SIMART, stok persediaan, dan lokasi/posisi aset BMD",
    sections: [
      {
        id: "gudang",
        labelKey: "supplyChain.gudangStok.gudang",
        description: "Master gudang — GUDANG (SIMARTDB)",
        dataStage: "gudang",
        source: "SIMARTDB.GUDANG",
      },
      {
        id: "stok-invent",
        labelKey: "supplyChain.gudangStok.stokInvent",
        description: "Posisi stok per barang — INVENT (SIMARTDB)",
        dataStage: "stok-invent",
        source: "SIMARTDB.INVENT",
      },
      {
        id: "lokasi-aset",
        labelKey: "supplyChain.gudangStok.lokasiAset",
        description: "Unit lokasi penempatan — msunitlokasi (ASSET_MANAJEMEN)",
        dataStage: "lokasi-aset",
        source: "ASSET_MANAJEMEN.msunitlokasi",
      },
      {
        id: "posisi-aset",
        labelKey: "supplyChain.gudangStok.posisiAset",
        description: "Posisi aset per lokasi — asset_locations (ASSET_MANAJEMEN)",
        dataStage: "posisi-aset",
        source: "ASSET_MANAJEMEN.asset_locations",
      },
    ],
  },
  {
    slug: "permintaan-barang",
    labelKey: "supplyChain.nav.permintaanBarang",
    title: "Permintaan Barang",
    subtitle:
      "Pengajuan kebutuhan barang unit — terintegrasi workflow SQ+ & pengadaan (belum ada di ASSET_MANAJEMEN)",
    sections: [
      {
        id: "daftar",
        labelKey: "supplyChain.permintaanBarang.daftar",
        description: "Daftar permintaan barang antar unit — modul SQ+ workflow",
        sqplusOnly: true,
        source: "SQ+.approval_instances",
      },
      {
        id: "buat",
        labelKey: "supplyChain.permintaanBarang.buat",
        description: "Form pengajuan permintaan barang unit kerja",
        sqplusOnly: true,
        source: "SQ+ (integrasi procurement)",
      },
      {
        id: "tracking",
        labelKey: "supplyChain.permintaanBarang.tracking",
        description: "Lacak status permintaan dari draft hingga distribusi",
        sqplusOnly: true,
        source: "SQ+ workflow",
      },
    ],
  },
  {
    slug: "distribusi-barang",
    labelKey: "supplyChain.nav.distribusiBarang",
    title: "Distribusi Barang",
    subtitle: "Mutasi barang antar unit dan distribusi massal — asset_mutations & asset_bulk_mutations",
    sections: [
      {
        id: "mutasi-unit",
        labelKey: "supplyChain.distribusiBarang.mutasiUnit",
        description: "Mutasi per unit/lokasi — asset_mutations (ASSET_MANAJEMEN)",
        dataStage: "mutasi-unit",
        source: "ASSET_MANAJEMEN.asset_mutations",
      },
      {
        id: "mutasi-massal",
        labelKey: "supplyChain.distribusiBarang.mutasiMassal",
        description: "Distribusi massal dengan approval — asset_bulk_mutations (ASSET_MANAJEMEN)",
        dataStage: "mutasi-massal",
        source: "ASSET_MANAJEMEN.asset_bulk_mutations",
      },
    ],
  },
  {
    slug: "penerimaan-barang",
    labelKey: "supplyChain.nav.penerimaanBarang",
    title: "Penerimaan Barang",
    subtitle: "Penerimaan BLJ, pembelian aset, dan transaksi masuk — terhubung pengadaan & keuangan",
    sections: [
      {
        id: "penerimaan-blj",
        labelKey: "supplyChain.penerimaanBarang.penerimaanBlj",
        description: "Header penerimaan barang logistik — asset_blj_h (ASSET_MANAJEMEN)",
        dataStage: "penerimaan-blj",
        source: "ASSET_MANAJEMEN.asset_blj_h",
      },
      {
        id: "pembelian-aset",
        labelKey: "supplyChain.penerimaanBarang.pembelianAset",
        description: "Pembelian aset tetap — asset_purchases (ASSET_MANAJEMEN)",
        dataStage: "pembelian-aset",
        source: "ASSET_MANAJEMEN.asset_purchases",
      },
      {
        id: "transaksi-masuk",
        labelKey: "supplyChain.penerimaanBarang.transaksiMasuk",
        description: "Transaksi masuk aset (BAST/PNB) — asset_H (ASSET_MANAJEMEN)",
        dataStage: "transaksi-masuk",
        source: "ASSET_MANAJEMEN.asset_H",
      },
    ],
  },
  {
    slug: "stock-opname",
    labelKey: "supplyChain.nav.stockOpname",
    title: "Stock Opname",
    subtitle: "Sensus BMD dan verifikasi/validasi inventaris — sensus_bmd_hist & verval_hist",
    sections: [
      {
        id: "sensus-bmd",
        labelKey: "supplyChain.stockOpname.sensusBmd",
        description: "Riwayat sensus barang milik daerah — sensus_bmd_hist (ASSET_MANAJEMEN)",
        dataStage: "sensus-bmd",
        source: "ASSET_MANAJEMEN.sensus_bmd_hist",
      },
      {
        id: "verifikasi",
        labelKey: "supplyChain.stockOpname.verifikasi",
        description: "Verifikasi dan validasi aset — verval_hist (ASSET_MANAJEMEN)",
        dataStage: "verifikasi",
        source: "ASSET_MANAJEMEN.verval_hist",
      },
    ],
  },
  {
    slug: "batch-expired",
    labelKey: "supplyChain.nav.batchExpired",
    title: "Batch & Expired",
    subtitle: "Monitoring stok minimum dan batch — SIMARTDB INVENT (batch/expired via SQ+ jika diperlukan)",
    sections: [
      {
        id: "stok-minimum",
        labelKey: "supplyChain.batchExpired.stokMinimum",
        description: "Barang dengan stok di bawah minimum — INVENT NQTY1 < NQTYMIN (SIMARTDB)",
        dataStage: "stok-minimum",
        source: "SIMARTDB.INVENT",
      },
      {
        id: "batch-tracking",
        labelKey: "supplyChain.batchExpired.batchTracking",
        description: "Pelacakan batch & tanggal expired — modul SQ+ (belum ada kolom di ASSET_MANAJEMEN)",
        sqplusOnly: true,
        source: "SQ+ (rencana integrasi SIMRS/farmasi)",
      },
    ],
  },
  {
    slug: "asset-management",
    labelKey: "supplyChain.nav.assetManagement",
    title: "Asset Management",
    subtitle: "Register BMD (Inventaris), aset operasional, dan penempatan lokasi",
    sections: [
      {
        id: "register-bmd",
        labelKey: "supplyChain.assetManagement.registerBmd",
        description: "Register barang milik daerah — Inventaris (ASSET_MANAJEMEN)",
        dataStage: "register-bmd",
        source: "ASSET_MANAJEMEN.Inventaris",
      },
      {
        id: "register-aset",
        labelKey: "supplyChain.assetManagement.registerAset",
        description: "Register aset operasional — assets (ASSET_MANAJEMEN)",
        dataStage: "register-aset",
        source: "ASSET_MANAJEMEN.assets",
      },
      {
        id: "detail-lokasi",
        labelKey: "supplyChain.assetManagement.detailLokasi",
        description: "Detail penempatan aset — asset_locations (ASSET_MANAJEMEN)",
        dataStage: "detail-lokasi",
        source: "ASSET_MANAJEMEN.asset_locations",
      },
    ],
  },
  {
    slug: "maintenance-kalibrasi",
    labelKey: "supplyChain.nav.maintenanceKalibrasi",
    title: "Maintenance & Kalibrasi",
    subtitle: "Jadwal perawatan dan kalibrasi alat medis — modul SQ+ (belum ada di ASSET_MANAJEMEN)",
    sections: [
      {
        id: "jadwal",
        labelKey: "supplyChain.maintenanceKalibrasi.jadwal",
        description: "Jadwal maintenance preventif alat medis & BMHP",
        sqplusOnly: true,
        source: "SQ+ (rencana modul)",
      },
      {
        id: "riwayat",
        labelKey: "supplyChain.maintenanceKalibrasi.riwayat",
        description: "Riwayat perbaikan dan servis alat",
        sqplusOnly: true,
        source: "SQ+ (rencana modul)",
      },
      {
        id: "kalibrasi",
        labelKey: "supplyChain.maintenanceKalibrasi.kalibrasi",
        description: "Sertifikat kalibrasi dan masa berlaku",
        sqplusOnly: true,
        source: "SQ+ (rencana modul)",
      },
    ],
  },
  {
    slug: "mutasi-disposal",
    labelKey: "supplyChain.nav.mutasiDisposal",
    title: "Mutasi & Disposal",
    subtitle: "Mutasi aset dan berita acara penghapusan BMD — disposal_H & disposal_D",
    sections: [
      {
        id: "mutasi",
        labelKey: "supplyChain.mutasiDisposal.mutasi",
        description: "Riwayat mutasi aset — asset_mutations (ASSET_MANAJEMEN)",
        dataStage: "mutasi",
        source: "ASSET_MANAJEMEN.asset_mutations",
      },
      {
        id: "penghapusan",
        labelKey: "supplyChain.mutasiDisposal.penghapusan",
        description: "Berita acara penghapusan — disposal_H (ASSET_MANAJEMEN)",
        dataStage: "penghapusan",
        source: "ASSET_MANAJEMEN.disposal_H",
      },
    ],
  },
  {
    slug: "monitoring",
    labelKey: "supplyChain.nav.monitoring",
    title: "Monitoring",
    subtitle: "Pantau alert stok, verifikasi BMD, mutasi, dan penghapusan secara real-time",
    customView: "monitoring",
  },
  {
    slug: "approval",
    labelKey: "supplyChain.nav.approval",
    title: "Approval",
    subtitle: "Antrian persetujuan mutasi massal dan penghapusan aset",
    sections: [
      {
        id: "mutasi-massal",
        labelKey: "supplyChain.approval.mutasiMassal",
        description: "Mutasi massal menunggu approval — asset_bulk_mutations (ASSET_MANAJEMEN)",
        dataStage: "mutasi-massal",
        source: "ASSET_MANAJEMEN.asset_bulk_mutations",
      },
      {
        id: "penghapusan",
        labelKey: "supplyChain.approval.penghapusan",
        description: "Penghapusan menunggu approval — disposal_H (ASSET_MANAJEMEN)",
        dataStage: "penghapusan",
        source: "ASSET_MANAJEMEN.disposal_H",
      },
    ],
  },
  {
    slug: "laporan",
    labelKey: "supplyChain.nav.laporan",
    title: "Laporan",
    subtitle: "Laporan inventaris BMD, stok persediaan, mutasi, dan penghapusan",
    sections: [
      {
        id: "inventaris",
        labelKey: "supplyChain.laporan.inventaris",
        description: "Laporan register BMD — Inventaris (ASSET_MANAJEMEN)",
        dataStage: "inventaris",
        source: "ASSET_MANAJEMEN.Inventaris",
      },
      {
        id: "stok",
        labelKey: "supplyChain.laporan.stok",
        description: "Laporan stok persediaan — INVENT (SIMARTDB)",
        dataStage: "stok",
        source: "SIMARTDB.INVENT",
      },
      {
        id: "mutasi",
        labelKey: "supplyChain.laporan.mutasi",
        description: "Laporan mutasi aset — asset_mutations (ASSET_MANAJEMEN)",
        dataStage: "mutasi",
        source: "ASSET_MANAJEMEN.asset_mutations",
      },
      {
        id: "penghapusan",
        labelKey: "supplyChain.laporan.penghapusan",
        description: "Laporan penghapusan BMD — disposal_H (ASSET_MANAJEMEN)",
        dataStage: "penghapusan",
        source: "ASSET_MANAJEMEN.disposal_H",
      },
    ],
  },
  {
    slug: "pengaturan",
    labelKey: "supplyChain.nav.pengaturan",
    title: "Pengaturan",
    subtitle: "Master gedung, lantai, ruangan, KIB, status, dan bahan — ASSET_MANAJEMEN",
    sections: [
      {
        id: "gedung",
        labelKey: "supplyChain.pengaturan.gedung",
        description: "Master gedung — msgedung (ASSET_MANAJEMEN)",
        dataStage: "gedung",
        source: "ASSET_MANAJEMEN.msgedung",
      },
      {
        id: "lantai",
        labelKey: "supplyChain.pengaturan.lantai",
        description: "Master lantai — mslantai (ASSET_MANAJEMEN)",
        dataStage: "lantai",
        source: "ASSET_MANAJEMEN.mslantai",
      },
      {
        id: "ruangan",
        labelKey: "supplyChain.pengaturan.ruangan",
        description: "Master ruangan — msruangan (ASSET_MANAJEMEN)",
        dataStage: "ruangan",
        source: "ASSET_MANAJEMEN.msruangan",
      },
      {
        id: "kib",
        labelKey: "supplyChain.pengaturan.kib",
        description: "Klasifikasi KIB — mskib (ASSET_MANAJEMEN)",
        dataStage: "kib",
        source: "ASSET_MANAJEMEN.mskib",
      },
      {
        id: "status",
        labelKey: "supplyChain.pengaturan.status",
        description: "Status aset — statuses (ASSET_MANAJEMEN)",
        dataStage: "status",
        source: "ASSET_MANAJEMEN.statuses",
      },
      {
        id: "bahan",
        labelKey: "supplyChain.pengaturan.bahan",
        description: "Master bahan — msbahan (ASSET_MANAJEMEN)",
        dataStage: "bahan",
        source: "ASSET_MANAJEMEN.msbahan",
      },
    ],
  },
];

export const SUPPLY_CHAIN_MODULE_BY_SLUG = Object.fromEntries(
  SUPPLY_CHAIN_MODULES.map((module) => [module.slug, module])
) as Record<string, SupplyChainModuleConfig>;
