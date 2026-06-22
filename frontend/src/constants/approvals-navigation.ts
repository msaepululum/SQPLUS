export type ApprovalsNavLabelKey =
  | "finance.approvals.inbox"
  | "finance.approvals.anggaran"
  | "finance.approvals.transaksi"
  | "finance.approvals.riwayatDelegasi";

export type ApprovalsSectionLabelKey =
  | "finance.approvals.approvalPagu"
  | "finance.approvals.approvalRevisiPagu"
  | "finance.approvals.approvalPergeseranPagu"
  | "finance.approvals.approvalBlokirAnggaran"
  | "finance.approvals.approvalPengajuanBelanja"
  | "finance.approvals.approvalPembayaran"
  | "finance.approvals.approvalJurnal"
  | "finance.approvals.riwayatApproval"
  | "finance.approvals.delegasiApproval";

export type ApprovalsNavItem = {
  labelKey: ApprovalsNavLabelKey;
  href: string;
};

/** Sidebar Approval — 4 menu. Inbox terpusat + antrian per domain. */
export const APPROVALS_SUB_NAV: ApprovalsNavItem[] = [
  { labelKey: "finance.approvals.inbox", href: "/finance/approvals" },
  { labelKey: "finance.approvals.anggaran", href: "/finance/approvals/anggaran" },
  { labelKey: "finance.approvals.transaksi", href: "/finance/approvals/transaksi" },
  {
    labelKey: "finance.approvals.riwayatDelegasi",
    href: "/finance/approvals/riwayat-delegasi",
  },
];
