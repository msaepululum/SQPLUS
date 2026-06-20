import { apiFetch } from "@/services/api";
import type {
  JenisBelanjaRow,
  JenisRekeningRow,
  KelompokBelanjaRow,
  PptkRow,
  PtkRow,
  SatuanRow,
  SroRow,
} from "@/types/finance-master";

type ApiListResponse<T> = { data: T[] };

async function fetchMasterList<T>(path: string): Promise<T[]> {
  const res = await apiFetch<ApiListResponse<T>>(path);
  return res.data;
}

export function fetchKelompokBelanja() {
  return fetchMasterList<KelompokBelanjaRow>("/finance/finance-masters/kelompok-belanja");
}

export function fetchJenisBelanjaMaster() {
  return fetchMasterList<JenisBelanjaRow>("/finance/finance-masters/jenis-belanja");
}

export function fetchPptkMaster() {
  return fetchMasterList<PptkRow>("/finance/finance-masters/pptk");
}

export function fetchPtkMaster() {
  return fetchMasterList<PtkRow>("/finance/finance-masters/ptk");
}

export function fetchJenisRekeningMaster() {
  return fetchMasterList<JenisRekeningRow>("/finance/finance-masters/jenis-rekening");
}

export function fetchSroMaster() {
  return fetchMasterList<SroRow>("/finance/finance-masters/sro");
}

export function fetchSatuanMaster() {
  return fetchMasterList<SatuanRow>("/finance/finance-masters/satuan");
}
