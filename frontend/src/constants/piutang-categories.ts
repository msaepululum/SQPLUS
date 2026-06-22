export type PiutangJenisId = "bpjs" | "tunai" | "asuransi";

export type PiutangJenis = {
  id: PiutangJenisId;
  labelKey: `finance.receivablesPayables.piutangJenis.${PiutangJenisId}`;
};

/** Klasifikasi piutang utama RS — dipakai filter di modul Piutang */
export const PIUTANG_JENIS: PiutangJenis[] = [
  { id: "bpjs", labelKey: "finance.receivablesPayables.piutangJenis.bpjs" },
  { id: "tunai", labelKey: "finance.receivablesPayables.piutangJenis.tunai" },
  { id: "asuransi", labelKey: "finance.receivablesPayables.piutangJenis.asuransi" },
];

const JENIS_IDS = new Set<string>(PIUTANG_JENIS.map((j) => j.id));

export function resolvePiutangJenisId(value: string | null | undefined): PiutangJenisId | "" {
  if (!value || !JENIS_IDS.has(value)) return "";
  return value as PiutangJenisId;
}

export function getPiutangJenis(id: PiutangJenisId): PiutangJenis {
  const found = PIUTANG_JENIS.find((j) => j.id === id);
  if (!found) throw new Error(`Unknown piutang jenis: ${id}`);
  return found;
}
