export type ProcurementNavLabelKey =
  | "procurement.nav.dashboard"
  | "procurement.nav.permintaan"
  | "procurement.nav.perencanaan"
  | "procurement.nav.vendor"
  | "procurement.nav.hpsPenawaran"
  | "procurement.nav.negosiasi"
  | "procurement.nav.poSpkKontrak"
  | "procurement.nav.penerimaan"
  | "procurement.nav.dokumen"
  | "procurement.nav.monitoring"
  | "procurement.nav.approval"
  | "procurement.nav.laporan"
  | "procurement.nav.pengaturan";

export type ProcurementSectionLabelKey =
  | "procurement.permintaan.daftar"
  | "procurement.permintaan.buat"
  | "procurement.permintaan.tracking"
  | "procurement.vendor.daftar"
  | "procurement.vendor.evaluasi"
  | "procurement.vendor.registrasi"
  | "procurement.hpsPenawaran.hps"
  | "procurement.hpsPenawaran.penawaran"
  | "procurement.hpsPenawaran.evaluasi"
  | "procurement.poSpkKontrak.po"
  | "procurement.poSpkKontrak.spk"
  | "procurement.poSpkKontrak.kontrak"
  | "procurement.penerimaan.barang"
  | "procurement.penerimaan.beritaAcara"
  | "procurement.penerimaan.retur"
  | "procurement.approval.inbox"
  | "procurement.approval.riwayat"
  | "procurement.laporan.permintaan"
  | "procurement.laporan.po"
  | "procurement.laporan.vendor"
  | "procurement.laporan.monitoring"
  | "procurement.pengaturan.workflow"
  | "procurement.pengaturan.master"
  | "procurement.pengaturan.threshold";

export type ProcurementNavItem = {
  labelKey: ProcurementNavLabelKey;
  href: string;
};

/** Sidebar Pengadaan Barang/Jasa — 13 menu sesuai alur pengadaan rumah sakit */
export const PROCUREMENT_SUB_NAV: ProcurementNavItem[] = [
  { labelKey: "procurement.nav.dashboard", href: "/procurement" },
  { labelKey: "procurement.nav.permintaan", href: "/procurement/permintaan" },
  { labelKey: "procurement.nav.perencanaan", href: "/procurement/perencanaan" },
  { labelKey: "procurement.nav.vendor", href: "/procurement/vendor" },
  { labelKey: "procurement.nav.hpsPenawaran", href: "/procurement/hps-penawaran" },
  { labelKey: "procurement.nav.negosiasi", href: "/procurement/negosiasi" },
  { labelKey: "procurement.nav.poSpkKontrak", href: "/procurement/po-spk-kontrak" },
  { labelKey: "procurement.nav.penerimaan", href: "/procurement/penerimaan" },
  { labelKey: "procurement.nav.dokumen", href: "/procurement/dokumen" },
  { labelKey: "procurement.nav.monitoring", href: "/procurement/monitoring" },
  { labelKey: "procurement.nav.approval", href: "/procurement/approval" },
  { labelKey: "procurement.nav.laporan", href: "/procurement/laporan" },
  { labelKey: "procurement.nav.pengaturan", href: "/procurement/pengaturan" },
];
