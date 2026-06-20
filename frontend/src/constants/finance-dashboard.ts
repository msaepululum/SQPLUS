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
    jasaLayanan: 78_456_789_123,
    apbn: 8_765_432_109,
    lainLain: 1_901_235_557,
  },
  {
    month: "Feb",
    jasaLayanan: 76_123_456_789,
    apbn: 9_012_345_678,
    lainLain: 2_809_869_874,
  },
  {
    month: "Mar",
    jasaLayanan: 83_456_789_012,
    apbn: 9_876_543_210,
    lainLain: 1_901_235_668,
  },
  {
    month: "Apr",
    jasaLayanan: 84_996_642_192,
    apbn: 9_499_851_876,
    lainLain: 2_046_716_055,
  },
  {
    month: "Mei",
    jasaLayanan: 89_126_913_570,
    apbn: 9_961_481_480,
    lainLain: 2_146_172_840,
  },
  {
    month: "Jun",
    jasaLayanan: 99_006_957_046,
    apbn: 11_065_748_039,
    lainLain: 2_384_083_927,
  },
  {
    month: "Jul",
    jasaLayanan: 85_974_865_077,
    apbn: 9_609_185_284,
    lainLain: 2_070_271_626,
  },
  {
    month: "Agu",
    jasaLayanan: 81_301_135_704,
    apbn: 9_086_814_804,
    lainLain: 1_957_728_393,
  },
  {
    month: "Sep",
    jasaLayanan: 79_344_691_357,
    apbn: 8_868_148_148,
    lainLain: 1_910_617_284,
  },
  {
    month: "Okt",
    jasaLayanan: 84_235_704_646,
    apbn: 9_414_803_881,
    lainLain: 2_028_392_707,
  },
  {
    month: "Nov",
    jasaLayanan: 86_953_086_429,
    apbn: 9_718_518_520,
    lainLain: 2_093_827_160,
  },
  {
    month: "Des",
    jasaLayanan: 100_065_321_298,
    apbn: 11_184_038_637,
    lainLain: 2_409_569_300,
  },
];

export type ExpenseBreakdownRow = {
  month: string;
  pegawai: number;
  barang: number;
  modal: number;
};

export const EXPENSE_BREAKDOWN: ExpenseBreakdownRow[] = [
  { month: "Jan", pegawai: 52_260_130_525, barang: 27_415_150_439, modal: 5_997_064_159 },
  { month: "Feb", pegawai: 52_535_308_641, barang: 27_559_506_172, modal: 6_028_641_976 },
  { month: "Mar", pegawai: 56_818_864_130, barang: 29_806_617_248, modal: 6_520_197_523 },
  { month: "Apr", pegawai: 60_246_913_586, barang: 31_604_938_275, modal: 6_913_580_248 },
  { month: "Mei", pegawai: 61_602_469_136, barang: 32_316_049_383, modal: 7_069_135_802 },
  { month: "Jun", pegawai: 66_346_913_641, barang: 34_804_938_303, modal: 7_613_580_254 },
  { month: "Jul", pegawai: 58_891_358_378, barang: 30_893_827_346, modal: 6_758_024_732 },
  { month: "Agu", pegawai: 57_415_308_641, barang: 30_119_506_172, modal: 6_588_641_976 },
  { month: "Sep", pegawai: 54_146_913_586, barang: 28_404_938_275, modal: 6_213_580_248 },
  { month: "Okt", pegawai: 56_330_863_587, barang: 29_550_616_964, modal: 6_464_197_461 },
  { month: "Nov", pegawai: 57_008_641_486, barang: 29_906_172_583, modal: 6_541_975_252 },
  { month: "Des", pegawai: 63_143_310_184, barang: 33_124_359_441, modal: 7_245_953_628 },
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
