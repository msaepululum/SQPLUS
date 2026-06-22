import type { ApprovalsNavLabelKey, ApprovalsSectionLabelKey } from "./approvals-navigation";

export type ApprovalsSection = {
  id: string;
  labelKey: ApprovalsSectionLabelKey;
  description: string;
};

export type ApprovalsModuleConfig = {
  slug: string;
  labelKey: ApprovalsNavLabelKey;
  title: string;
  subtitle: string;
  sections: ApprovalsSection[];
};

export const APPROVALS_MODULES: ApprovalsModuleConfig[] = [
  {
    slug: "anggaran",
    labelKey: "finance.approvals.anggaran",
    title: "Approval Anggaran",
    subtitle: "Antrian persetujuan pagu, revisi, pergeseran, dan blokir anggaran",
    sections: [
      {
        id: "pagu",
        labelKey: "finance.approvals.approvalPagu",
        description: "Persetujuan penetapan dan perubahan pagu induk tahun anggaran",
      },
      {
        id: "revisi-pagu",
        labelKey: "finance.approvals.approvalRevisiPagu",
        description: "Persetujuan revisi pagu — penambahan atau pengurangan pagu efektif",
      },
      {
        id: "pergeseran-pagu",
        labelKey: "finance.approvals.approvalPergeseranPagu",
        description: "Persetujuan pergeseran pagu antar unit, jenis belanja, atau kode rekening",
      },
      {
        id: "blokir-anggaran",
        labelKey: "finance.approvals.approvalBlokirAnggaran",
        description: "Persetujuan blokir dan pembukaan blokir pagu anggaran",
      },
    ],
  },
  {
    slug: "transaksi",
    labelKey: "finance.approvals.transaksi",
    title: "Approval Transaksi",
    subtitle: "Persetujuan pengajuan belanja, pembayaran, dan jurnal akuntansi",
    sections: [
      {
        id: "pengajuan-belanja",
        labelKey: "finance.approvals.approvalPengajuanBelanja",
        description: "Persetujuan pengajuan belanja unit kerja sesuai kewenangan pejabat",
      },
      {
        id: "pembayaran",
        labelKey: "finance.approvals.approvalPembayaran",
        description: "Persetujuan permintaan pembayaran — tahap approval alur pembayaran",
      },
      {
        id: "jurnal",
        labelKey: "finance.approvals.approvalJurnal",
        description: "Persetujuan jurnal umum dan jurnal otomatis sebelum posting",
      },
    ],
  },
  {
    slug: "riwayat-delegasi",
    labelKey: "finance.approvals.riwayatDelegasi",
    title: "Riwayat & Delegasi",
    subtitle: "Jejak audit persetujuan dan pengaturan delegasi wewenang approval",
    sections: [
      {
        id: "riwayat",
        labelKey: "finance.approvals.riwayatApproval",
        description: "Riwayat approval — filter periode, jenis dokumen, status, dan pejabat",
      },
      {
        id: "delegasi",
        labelKey: "finance.approvals.delegasiApproval",
        description: "Delegasi approval — penunjukan pejabat pengganti dan masa berlaku delegasi",
      },
    ],
  },
];

export const APPROVALS_MODULE_BY_SLUG = Object.fromEntries(
  APPROVALS_MODULES.map((module) => [module.slug, module])
) as Record<string, ApprovalsModuleConfig>;

/** Redirect slug lama / bookmark ke modul + tab baru */
export const APPROVALS_LEGACY_SLUG_REDIRECT: Record<string, { slug: string; tab: string }> = {
  "inbox-approval": { slug: "anggaran", tab: "pagu" },
  "approval-pagu": { slug: "anggaran", tab: "pagu" },
  pagu: { slug: "anggaran", tab: "pagu" },
  "approval-revisi-pagu": { slug: "anggaran", tab: "revisi-pagu" },
  "revisi-pagu": { slug: "anggaran", tab: "revisi-pagu" },
  "approval-pergeseran-pagu": { slug: "anggaran", tab: "pergeseran-pagu" },
  "pergeseran-pagu": { slug: "anggaran", tab: "pergeseran-pagu" },
  "approval-blokir-anggaran": { slug: "anggaran", tab: "blokir-anggaran" },
  "blokir-anggaran": { slug: "anggaran", tab: "blokir-anggaran" },
  "approval-pengajuan-belanja": { slug: "transaksi", tab: "pengajuan-belanja" },
  "pengajuan-belanja": { slug: "transaksi", tab: "pengajuan-belanja" },
  "approval-pembayaran": { slug: "transaksi", tab: "pembayaran" },
  pembayaran: { slug: "transaksi", tab: "pembayaran" },
  "approval-jurnal": { slug: "transaksi", tab: "jurnal" },
  jurnal: { slug: "transaksi", tab: "jurnal" },
  "riwayat-approval": { slug: "riwayat-delegasi", tab: "riwayat" },
  riwayat: { slug: "riwayat-delegasi", tab: "riwayat" },
  "delegasi-approval": { slug: "riwayat-delegasi", tab: "delegasi" },
  delegasi: { slug: "riwayat-delegasi", tab: "delegasi" },
};
