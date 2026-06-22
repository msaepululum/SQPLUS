export type SupplyChainNavLabelKey =
  | "supplyChain.nav.dashboard"
  | "supplyChain.nav.masterBarang"
  | "supplyChain.nav.gudangStok"
  | "supplyChain.nav.permintaanBarang"
  | "supplyChain.nav.distribusiBarang"
  | "supplyChain.nav.penerimaanBarang"
  | "supplyChain.nav.stockOpname"
  | "supplyChain.nav.batchExpired"
  | "supplyChain.nav.assetManagement"
  | "supplyChain.nav.maintenanceKalibrasi"
  | "supplyChain.nav.mutasiDisposal"
  | "supplyChain.nav.monitoring"
  | "supplyChain.nav.approval"
  | "supplyChain.nav.laporan"
  | "supplyChain.nav.pengaturan";

export type SupplyChainSectionLabelKey =
  | "supplyChain.masterBarang.permen"
  | "supplyChain.masterBarang.inventSimart"
  | "supplyChain.masterBarang.kategori"
  | "supplyChain.masterBarang.merk"
  | "supplyChain.masterBarang.satuan"
  | "supplyChain.masterBarang.kelompok"
  | "supplyChain.gudangStok.gudang"
  | "supplyChain.gudangStok.stokInvent"
  | "supplyChain.gudangStok.lokasiAset"
  | "supplyChain.gudangStok.posisiAset"
  | "supplyChain.permintaanBarang.daftar"
  | "supplyChain.permintaanBarang.buat"
  | "supplyChain.permintaanBarang.tracking"
  | "supplyChain.distribusiBarang.mutasiUnit"
  | "supplyChain.distribusiBarang.mutasiMassal"
  | "supplyChain.penerimaanBarang.penerimaanBlj"
  | "supplyChain.penerimaanBarang.pembelianAset"
  | "supplyChain.penerimaanBarang.transaksiMasuk"
  | "supplyChain.stockOpname.sensusBmd"
  | "supplyChain.stockOpname.verifikasi"
  | "supplyChain.batchExpired.stokMinimum"
  | "supplyChain.batchExpired.batchTracking"
  | "supplyChain.assetManagement.registerBmd"
  | "supplyChain.assetManagement.registerAset"
  | "supplyChain.assetManagement.detailLokasi"
  | "supplyChain.maintenanceKalibrasi.jadwal"
  | "supplyChain.maintenanceKalibrasi.riwayat"
  | "supplyChain.maintenanceKalibrasi.kalibrasi"
  | "supplyChain.mutasiDisposal.mutasi"
  | "supplyChain.mutasiDisposal.penghapusan"
  | "supplyChain.approval.mutasiMassal"
  | "supplyChain.approval.penghapusan"
  | "supplyChain.laporan.inventaris"
  | "supplyChain.laporan.stok"
  | "supplyChain.laporan.mutasi"
  | "supplyChain.laporan.penghapusan"
  | "supplyChain.pengaturan.gedung"
  | "supplyChain.pengaturan.lantai"
  | "supplyChain.pengaturan.ruangan"
  | "supplyChain.pengaturan.kib"
  | "supplyChain.pengaturan.status"
  | "supplyChain.pengaturan.bahan";

export type SupplyChainNavItem = {
  labelKey: SupplyChainNavLabelKey;
  href: string;
};

/** Sidebar Asset / Supply Chain — 15 menu sesuai alur logistik rumah sakit */
export const SUPPLY_CHAIN_SUB_NAV: SupplyChainNavItem[] = [
  { labelKey: "supplyChain.nav.dashboard", href: "/supply-chain" },
  { labelKey: "supplyChain.nav.masterBarang", href: "/supply-chain/master-barang" },
  { labelKey: "supplyChain.nav.gudangStok", href: "/supply-chain/gudang-stok" },
  { labelKey: "supplyChain.nav.permintaanBarang", href: "/supply-chain/permintaan-barang" },
  { labelKey: "supplyChain.nav.distribusiBarang", href: "/supply-chain/distribusi-barang" },
  { labelKey: "supplyChain.nav.penerimaanBarang", href: "/supply-chain/penerimaan-barang" },
  { labelKey: "supplyChain.nav.stockOpname", href: "/supply-chain/stock-opname" },
  { labelKey: "supplyChain.nav.batchExpired", href: "/supply-chain/batch-expired" },
  { labelKey: "supplyChain.nav.assetManagement", href: "/supply-chain/asset-management" },
  { labelKey: "supplyChain.nav.maintenanceKalibrasi", href: "/supply-chain/maintenance-kalibrasi" },
  { labelKey: "supplyChain.nav.mutasiDisposal", href: "/supply-chain/mutasi-disposal" },
  { labelKey: "supplyChain.nav.monitoring", href: "/supply-chain/monitoring" },
  { labelKey: "supplyChain.nav.approval", href: "/supply-chain/approval" },
  { labelKey: "supplyChain.nav.laporan", href: "/supply-chain/laporan" },
  { labelKey: "supplyChain.nav.pengaturan", href: "/supply-chain/pengaturan" },
];
