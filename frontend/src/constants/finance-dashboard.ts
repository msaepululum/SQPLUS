export type FinanceDashboardTab = {
  id: number;
  label: string;
};

export const FINANCE_DASHBOARD_TABS: FinanceDashboardTab[] = [
  { id: 1, label: "Ringkasan Utama" },
  { id: 2, label: "Penerimaan" },
  { id: 3, label: "Belanja" },
  { id: 4, label: "Piutang" },
  { id: 5, label: "Alur Kas & Bank" },
  { id: 6, label: "Laporan Keuangan" },
  { id: 7, label: "Pagu, Beban & Pengadaan" },
  { id: 8, label: "Pasien & Resep" },
  { id: 9, label: "Revisi Pagu" },
  { id: 10, label: "Saldo Bulanan" },
];

export type MonthlyIncomeExpense = {
  month: string;
  penerimaan: number;
  belanja: number;
};

export const MONTHLY_INCOME_EXPENSE: MonthlyIncomeExpense[] = [
  { month: "Jan", penerimaan: 89_123_456_789, belanja: 85_672_345_123 },
  { month: "Feb", penerimaan: 87_945_672_341, belanja: 86_123_456_789 },
  { month: "Mar", penerimaan: 95_234_567_890, belanja: 93_145_678_901 },
  { month: "Apr", penerimaan: 96_543_210_123, belanja: 98_765_432_109 },
  { month: "Mei", penerimaan: 101_234_567_890, belanja: 100_987_654_321 },
  { month: "Jun", penerimaan: 112_456_789_012, belanja: 108_765_432_198 },
  { month: "Jul", penerimaan: 97_654_321_987, belanja: 96_543_210_456 },
  { month: "Agu", penerimaan: 92_345_678_901, belanja: 94_123_456_789 },
  { month: "Sep", penerimaan: 90_123_456_789, belanja: 88_765_432_109 },
  { month: "Okt", penerimaan: 95_678_901_234, belanja: 92_345_678_012 },
  { month: "Nov", penerimaan: 98_765_432_109, belanja: 93_456_789_321 },
  { month: "Des", penerimaan: 113_658_929_235, belanja: 103_513_623_253 },
];

export const DASHBOARD_SUMMARY = {
  totalPenerimaan: 1_171_559_985_201,
  totalBelanja: 1_142_211_661_381,
  surplus: 29_348_323_820,
  surplusPct: 2.51,
  avgPenerimaan: 97.62,
  avgBelanja: 95.18,
};

export type IncomeBreakdownRow = {
  month: string;
  jasaLayanan: number;
  apbn: number;
  lainLain: number;
};

export const INCOME_BREAKDOWN: IncomeBreakdownRow[] = [
  {
    month: "Jan",
    jasaLayanan: 72_456_789_012,
    apbn: 12_890_123_456,
    lainLain: 3_776_544_321,
  },
  {
    month: "Feb",
    jasaLayanan: 70_234_567_890,
    apbn: 13_456_789_012,
    lainLain: 4_254_315_439,
  },
  {
    month: "Mar",
    jasaLayanan: 76_890_123_456,
    apbn: 14_123_456_789,
    lainLain: 4_220_987_645,
  },
];

export type ExpenseBreakdownRow = {
  month: string;
  pegawai: number;
  barang: number;
  modal: number;
};

export const EXPENSE_BREAKDOWN: ExpenseBreakdownRow[] = [
  {
    month: "Jan",
    pegawai: 52_345_678_901,
    barang: 27_890_123_456,
    modal: 5_436_542_766,
  },
  {
    month: "Feb",
    pegawai: 51_890_123_456,
    barang: 28_456_789_012,
    modal: 5_776_544_321,
  },
  {
    month: "Mar",
    pegawai: 55_678_901_234,
    barang: 30_123_456_789,
    modal: 7_343_320_878,
  },
];

export function formatRupiahFull(value: number): string {
  return value.toLocaleString("id-ID");
}

export function formatRupiahMiliar(value: number): string {
  const miliar = value / 1_000_000_000;
  return `Rp ${miliar.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M`;
}

export function formatPercent(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}${Math.abs(value).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

export function calcSurplus(penerimaan: number, belanja: number): number {
  return penerimaan - belanja;
}

export function calcSurplusPct(penerimaan: number, belanja: number): number {
  if (penerimaan === 0) return 0;
  return ((penerimaan - belanja) / penerimaan) * 100;
}
