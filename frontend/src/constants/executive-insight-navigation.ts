export type ExecutiveInsightNavLabelKey =
  | "finance.executiveInsight.dashboard"
  | "finance.executiveInsight.kinerjaKeuangan"
  | "finance.executiveInsight.anggaranPagu"
  | "finance.executiveInsight.hutangLikuiditas"
  | "finance.executiveInsight.operasionalKlinis";

export type ExecutiveInsightSectionLabelKey =
  | "finance.executiveInsight.ringkasanUtama"
  | "finance.executiveInsight.trenPendapatanBelanja"
  | "finance.executiveInsight.posisiKeuanganRiil"
  | "finance.executiveInsight.dayaSerapAnggaran"
  | "finance.executiveInsight.trenHutangTahunan"
  | "finance.executiveInsight.hutangPerAkun"
  | "finance.executiveInsight.analisaPaguPengadaan"
  | "finance.executiveInsight.analisaPasienResepBekkes"
  | "finance.executiveInsight.komposisiAnggaran"
  | "finance.executiveInsight.riwayatRevisiPagu"
  | "finance.executiveInsight.monitoringSaldoBulanan"
  | "finance.executiveInsight.pendapatanPerAkun"
  | "finance.executiveInsight.simulasiKebutuhanPagu";

export type ExecutiveInsightNavItem = {
  labelKey: ExecutiveInsightNavLabelKey;
  href: string;
};

/** Sidebar Insight Pimpinan — 5 menu (13 analitik digabung per domain). */
export const EXECUTIVE_INSIGHT_SUB_NAV: ExecutiveInsightNavItem[] = [
  {
    labelKey: "finance.executiveInsight.dashboard",
    href: "/finance/executive-insight",
  },
  {
    labelKey: "finance.executiveInsight.kinerjaKeuangan",
    href: "/finance/executive-insight/kinerja-keuangan",
  },
  {
    labelKey: "finance.executiveInsight.anggaranPagu",
    href: "/finance/executive-insight/anggaran-pagu",
  },
  {
    labelKey: "finance.executiveInsight.hutangLikuiditas",
    href: "/finance/executive-insight/hutang-likuiditas",
  },
  {
    labelKey: "finance.executiveInsight.operasionalKlinis",
    href: "/finance/executive-insight/operasional-klinis",
  },
];
