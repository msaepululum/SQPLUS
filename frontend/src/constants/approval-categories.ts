export type ApprovalJenisId =
  | "pagu"
  | "revisi-pagu"
  | "pergeseran-pagu"
  | "blokir-anggaran"
  | "pengajuan-belanja"
  | "pembayaran"
  | "jurnal";

export type ApprovalJenisLabelKey =
  | "finance.approvals.jenis.pagu"
  | "finance.approvals.jenis.revisiPagu"
  | "finance.approvals.jenis.pergeseranPagu"
  | "finance.approvals.jenis.blokirAnggaran"
  | "finance.approvals.jenis.pengajuanBelanja"
  | "finance.approvals.jenis.pembayaran"
  | "finance.approvals.jenis.jurnal";

export type ApprovalJenis = {
  id: ApprovalJenisId;
  labelKey: ApprovalJenisLabelKey;
};

export const APPROVAL_JENIS: ApprovalJenis[] = [
  { id: "pagu", labelKey: "finance.approvals.jenis.pagu" },
  { id: "revisi-pagu", labelKey: "finance.approvals.jenis.revisiPagu" },
  { id: "pergeseran-pagu", labelKey: "finance.approvals.jenis.pergeseranPagu" },
  { id: "blokir-anggaran", labelKey: "finance.approvals.jenis.blokirAnggaran" },
  { id: "pengajuan-belanja", labelKey: "finance.approvals.jenis.pengajuanBelanja" },
  { id: "pembayaran", labelKey: "finance.approvals.jenis.pembayaran" },
  { id: "jurnal", labelKey: "finance.approvals.jenis.jurnal" },
];

const JENIS_IDS = new Set<string>(APPROVAL_JENIS.map((j) => j.id));

export function resolveApprovalJenisId(value: string | null | undefined): ApprovalJenisId | "" {
  if (!value || !JENIS_IDS.has(value)) return "";
  return value as ApprovalJenisId;
}

export function getApprovalJenis(id: ApprovalJenisId): ApprovalJenis {
  const found = APPROVAL_JENIS.find((j) => j.id === id);
  if (!found) throw new Error(`Unknown approval jenis: ${id}`);
  return found;
}
