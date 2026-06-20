export type BudgetProgramJenis = "program" | "kegiatan" | "sub_kegiatan";

export type BudgetProgram = {
  id: number;
  budget_year_id: number;
  parent_id: number | null;
  kode: string;
  uraian: string;
  jenis: BudgetProgramJenis;
  jumlah_anggaran: string | null;
  is_active: boolean;
  keterangan: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  budget_year?: {
    id: number;
    tahun: number;
    nama: string;
    status: string;
  };
};

export type BudgetProgramFormData = {
  budget_year_id: string;
  parent_id: string;
  kode: string;
  uraian: string;
  jenis: BudgetProgramJenis;
  jumlah_anggaran: string;
  is_active: string;
  keterangan: string;
};

export type BudgetProgramTreeNode = BudgetProgram & {
  children: BudgetProgramTreeNode[];
};

export const JENIS_LABEL: Record<BudgetProgramJenis, string> = {
  program: "Program",
  kegiatan: "Kegiatan",
  sub_kegiatan: "Sub Kegiatan",
};

export const JENIS_OPTIONS: { value: BudgetProgramJenis; label: string }[] = [
  { value: "program", label: "Program" },
  { value: "kegiatan", label: "Kegiatan" },
  { value: "sub_kegiatan", label: "Sub Kegiatan" },
];

export function childJenisFor(parentJenis: BudgetProgramJenis | null): BudgetProgramJenis {
  if (parentJenis === "program") return "kegiatan";
  if (parentJenis === "kegiatan") return "sub_kegiatan";
  return "program";
}

export function buildProgramTree(items: BudgetProgram[]): BudgetProgramTreeNode[] {
  const map = new Map<number, BudgetProgramTreeNode>();
  const roots: BudgetProgramTreeNode[] = [];

  for (const item of items) {
    map.set(item.id, { ...item, children: [] });
  }

  for (const item of items) {
    const node = map.get(item.id)!;
    if (item.parent_id && map.has(item.parent_id)) {
      map.get(item.parent_id)!.children.push(node);
    } else if (!item.parent_id) {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: BudgetProgramTreeNode[]) => {
    nodes.sort((a, b) => a.kode.localeCompare(b.kode, undefined, { numeric: true }));
    nodes.forEach((n) => sortNodes(n.children));
  };

  sortNodes(roots);
  return roots;
}

export function formatAnggaran(value: string | number | null): string {
  if (value == null || value === "") return "";
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return "";
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(num);
}

/** Format nilai pagu tanpa prefix Rp — sesuai tampilan APBD. */
export function formatPaguNilai(value: string | number | null): string {
  const formatted = formatAnggaran(value);
  return formatted || "";
}

export function programToForm(row: BudgetProgram): BudgetProgramFormData {
  return {
    budget_year_id: String(row.budget_year_id),
    parent_id: row.parent_id ? String(row.parent_id) : "",
    kode: row.kode,
    uraian: row.uraian,
    jenis: row.jenis,
    jumlah_anggaran: row.jumlah_anggaran ?? "",
    is_active: row.is_active ? "1" : "0",
    keterangan: row.keterangan ?? "",
  };
}

export function emptyFormForParent(
  parent: BudgetProgram | null,
  budgetYearId: number
): BudgetProgramFormData {
  return {
    budget_year_id: String(budgetYearId),
    parent_id: parent ? String(parent.id) : "",
    kode: parent ? `${parent.kode}.` : "",
    uraian: "",
    jenis: childJenisFor(parent?.jenis ?? null),
    jumlah_anggaran: "",
    is_active: "1",
    keterangan: "",
  };
}

export function sumSubKegiatanAnggaran(items: BudgetProgram[]): number {
  return items
    .filter((i) => i.jenis === "sub_kegiatan" && i.jumlah_anggaran)
    .reduce((sum, i) => sum + Number(i.jumlah_anggaran), 0);
}

/** Jumlah pagu node — sub kegiatan dari nilai sendiri, induk dari akumulasi anak. */
export function computePaguTotal(node: BudgetProgramTreeNode): number {
  if (node.jenis === "sub_kegiatan") {
    return Number(node.jumlah_anggaran || 0);
  }
  return node.children.reduce((sum, child) => sum + computePaguTotal(child), 0);
}

export function indentClass(depth: number): string {
  if (depth === 0) return "pl-3";
  if (depth === 1) return "pl-8";
  return "pl-14";
}

export function rowStyles(jenis: BudgetProgramJenis): string {
  if (jenis === "program") {
    return "font-bold uppercase text-[#0d6e63] tracking-wide";
  }
  if (jenis === "kegiatan") {
    return "font-medium text-[#0d6e63]";
  }
  return "font-normal text-slate-800";
}

export function paguAmountStyles(jenis: BudgetProgramJenis): string {
  if (jenis === "sub_kegiatan") {
    return "text-slate-800";
  }
  return "text-[#0d6e63]";
}
