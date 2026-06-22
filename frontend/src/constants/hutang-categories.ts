export type HutangJenisId = "vendor" | "bekkes" | "jasa";

export type HutangJenis = {
  id: HutangJenisId;
  labelKey: `finance.receivablesPayables.hutangJenis.${HutangJenisId}`;
};

export const HUTANG_JENIS: HutangJenis[] = [
  { id: "vendor", labelKey: "finance.receivablesPayables.hutangJenis.vendor" },
  { id: "bekkes", labelKey: "finance.receivablesPayables.hutangJenis.bekkes" },
  { id: "jasa", labelKey: "finance.receivablesPayables.hutangJenis.jasa" },
];

const JENIS_IDS = new Set<string>(HUTANG_JENIS.map((j) => j.id));

export function resolveHutangJenisId(value: string | null | undefined): HutangJenisId | "" {
  if (!value || !JENIS_IDS.has(value)) return "";
  return value as HutangJenisId;
}

export function getHutangJenis(id: HutangJenisId): HutangJenis {
  const found = HUTANG_JENIS.find((j) => j.id === id);
  if (!found) throw new Error(`Unknown hutang jenis: ${id}`);
  return found;
}

export type HutangTahunPeriodeId = "berjalan" | "sebelumnya";

export type HutangTahunPeriode = {
  id: HutangTahunPeriodeId;
  labelKey: `finance.receivablesPayables.hutangTahun.${HutangTahunPeriodeId}`;
};

export const HUTANG_TAHUN_PERIODE: HutangTahunPeriode[] = [
  {
    id: "berjalan",
    labelKey: "finance.receivablesPayables.hutangTahun.berjalan",
  },
  {
    id: "sebelumnya",
    labelKey: "finance.receivablesPayables.hutangTahun.sebelumnya",
  },
];

const TAHUN_IDS = new Set<string>(HUTANG_TAHUN_PERIODE.map((t) => t.id));

export function resolveHutangTahunPeriodeId(
  value: string | null | undefined
): HutangTahunPeriodeId | "" {
  if (!value || !TAHUN_IDS.has(value)) return "";
  return value as HutangTahunPeriodeId;
}

export function getHutangTahunPeriode(id: HutangTahunPeriodeId): HutangTahunPeriode {
  const found = HUTANG_TAHUN_PERIODE.find((t) => t.id === id);
  if (!found) throw new Error(`Unknown hutang tahun periode: ${id}`);
  return found;
}
