export const MAIN_SUMMARY_KPIS = [
  { label: "Total Pendapatan", value: "Rp 189,60 M", trend: "▲ 13,21% vs Apr 2025", trendPositive: true, icon: "wallet" as const, iconBg: "bg-blue-500" },
  { label: "Realisasi Belanja", value: "Rp 165,40 M", trend: "▲ 9,34% vs Apr 2025", trendPositive: true, icon: "cart" as const, iconBg: "bg-emerald-500" },
  { label: "Sisa Pagu", value: "Rp 84,60 M", trend: "▲ 12,18% vs Apr 2025", trendPositive: true, icon: "briefcase" as const, iconBg: "bg-violet-500" },
  { label: "Cash Flow Bersih", value: "Rp 24,20 M", trend: "▲ 18,72% vs Apr 2025", trendPositive: true, icon: "banknote" as const, iconBg: "bg-[#0d9488]" },
  { label: "Target Pendapatan", value: "Rp 200,00 M", trend: "▲ 13,21% vs Mei 2024", trendPositive: true, icon: "target" as const, iconBg: "bg-blue-600" },
  { label: "Pencapaian Anggaran", value: "82,7%", trend: "▲ 5,1 p.p vs Apr 2025", trendPositive: true, icon: "pie" as const, iconBg: "bg-orange-500" },
  { label: "Piutang BPJS", value: "Rp 56,80 M", trend: "▼ 2,35% vs Apr 2025", trendPositive: false, icon: "file" as const, iconBg: "bg-amber-400" },
  { label: "Menunggu Pembayaran", value: "Rp 18,40 M", trend: "▲ 9,12% vs Apr 2025", trendPositive: false, icon: "hourglass" as const, iconBg: "bg-red-500" },
];

export const MONTHLY_TREND = {
  months: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
  pendapatan: [155, 162, 168, 175, 182, 189.6, 192, 188, 185, 190, 195, 200],
  belanja: [140, 145, 150, 155, 160, 165.4, 168, 165, 162, 168, 172, 175],
  target: [170, 172, 175, 178, 185, 190, 192, 195, 198, 200, 202, 205],
  highlightIndex: 5,
  highlightPendapatan: "189,60",
  highlightBelanja: "165,40",
};

export const BUDGET_GROUP_BARS = [
  { label: "Belanja Pegawai", pagu: 120, realisasi: 90.2, sisa: 29.8 },
  { label: "Barang / Jasa", pagu: 85, realisasi: 40.5, sisa: 44.5 },
  { label: "Pemeliharaan", pagu: 35, realisasi: 18.7, sisa: 16.3 },
  { label: "Modal", pagu: 50, realisasi: 32.2, sisa: 17.8 },
  { label: "Bekkes", pagu: 28, realisasi: 12.8, sisa: 15.2 },
];

export const CASH_IN_OUT = {
  months: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
  masuk: [145, 152, 158, 165, 172, 178, 175, 170, 168, 172, 178, 182],
  keluar: [130, 138, 142, 148, 155, 160, 158, 155, 152, 158, 162, 165],
  cashFlow: [15, 14, 16, 17, 17, 18, 17, 15, 16, 14, 16, 17],
  highlightIndex: 4,
  highlightValue: "24,20",
};

export const REVENUE_COMPOSITION = [
  { label: "BPJS", pct: 49.4, amount: "93,66", color: "#3b82f6" },
  { label: "Tunai", pct: 22.9, amount: "43,42", color: "#14b8a6" },
  { label: "Asuransi", pct: 13.2, amount: "25,03", color: "#f97316" },
  { label: "Kerja Sama", pct: 8.1, amount: "15,36", color: "#8b5cf6" },
  { label: "Lainnya", pct: 5.8, amount: "11,00", color: "#60a5fa" },
];

export const UNIT_EXPENSE_BARS = [
  { label: "Rawat Inap", value: 48.5 },
  { label: "Rawat Jalan", value: 32.7 },
  { label: "IGD", value: 18.2 },
  { label: "Penunjang", value: 16.1 },
  { label: "Farmasi", value: 12.4 },
  { label: "Bedah Sentral", value: 9.3 },
  { label: "Unit Lainnya", value: 8.2 },
];

export const MONTHLY_REVENUE_TABLE = [
  { bulan: "Jan", target: "170,00", realisasi: "155,00", selisih: "-15,00", growth: "-", status: "below" as const },
  { bulan: "Feb", target: "172,00", realisasi: "162,00", selisih: "-10,00", growth: "4,5%", status: "below" as const },
  { bulan: "Mar", target: "175,00", realisasi: "168,00", selisih: "-7,00", growth: "3,7%", status: "below" as const },
  { bulan: "Apr", target: "178,00", realisasi: "175,00", selisih: "-3,00", growth: "4,2%", status: "below" as const },
  { bulan: "Mei", target: "185,00", realisasi: "182,00", selisih: "-3,00", growth: "4,0%", status: "below" as const },
  { bulan: "Jun", target: "190,00", realisasi: "189,60", selisih: "-0,40", growth: "4,2%", status: "above" as const },
];

export const EXPENSE_REALIZATION_TABLE = [
  { kode: "51", kelompok: "Belanja Pegawai", pagu: "120,00", realisasi: "90,20", sisa: "29,80", pct: "75,2%", menunggu: "8,40" },
  { kode: "52", kelompok: "Belanja Barang/Jasa", pagu: "85,00", realisasi: "40,50", sisa: "44,50", pct: "47,6%", menunggu: "5,20" },
  { kode: "53", kelompok: "Belanja Pemeliharaan", pagu: "35,00", realisasi: "18,70", sisa: "16,30", pct: "53,4%", menunggu: "2,10" },
  { kode: "54", kelompok: "Belanja Modal", pagu: "50,00", realisasi: "32,20", sisa: "17,80", pct: "64,4%", menunggu: "1,80" },
  { kode: "55", kelompok: "Belanja Bekkes", pagu: "28,00", realisasi: "12,80", sisa: "15,20", pct: "45,7%", menunggu: "0,90" },
];

export const EXPENSE_TOTAL = {
  pagu: "318,00",
  realisasi: "194,40",
  sisa: "123,60",
  pct: "61,1%",
  menunggu: "18,40",
};

export const CASH_FLOW_SUMMARY = [
  { label: "Saldo Awal", value: "32,60", highlight: false },
  { label: "Kas Masuk", value: "172,00", highlight: false },
  { label: "Kas Keluar", value: "147,80", highlight: false },
  { label: "Cash Flow Bersih", value: "24,20", highlight: true },
  { label: "Saldo Akhir", value: "56,80", highlight: false },
];

export const REVENUE_BY_SERVICE = [
  { layanan: "Rawat Inap", value: "93,66" },
  { layanan: "Rawat Jalan", value: "43,42" },
  { layanan: "IGD", value: "18,20" },
  { layanan: "Penunjang", value: "16,10" },
  { layanan: "Farmasi", value: "12,40" },
  { layanan: "Lainnya", value: "5,82" },
];

export const REVENUE_BY_SERVICE_TOTAL = "189,60";

export const EXECUTIVE_INSIGHTS = [
  { text: "Pendapatan tumbuh 13,21% MoM, mendekati target Rp 200,00 M.", icon: "trend" as const, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
  { text: "Belanja Modal sudah mencapai 64,5% pagu — perlu monitoring ketat.", icon: "warning" as const, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100" },
  { text: "Sisa Pagu Rp 84,60 M (29,5%) dalam kondisi aman hingga akhir semester.", icon: "shield" as const, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
  { text: "Cash Flow bersih positif Rp 24,20 M, saldo akhir kas Rp 56,80 M.", icon: "cash" as const, color: "text-[#0d9488]", bg: "bg-teal-50", border: "border-teal-100" },
  { text: "Piutang BPJS Rp 56,80 M (-2,35% MoM), perlu percepatan penagihan.", icon: "alert" as const, color: "text-red-700", bg: "bg-red-50", border: "border-red-100" },
];
