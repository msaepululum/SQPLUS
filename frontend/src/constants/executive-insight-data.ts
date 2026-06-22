/** Mock data untuk analitik Insight Pimpinan (akan diganti API backend) */

export const EI_MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export const EI_TREN_PENDAPATAN = {
  months: EI_MONTHS.slice(0, 6),
  pendapatan: [155, 162, 168, 175, 182, 189.6],
  belanja: [140, 145, 150, 155, 160, 165.4],
  surplus: [15, 17, 18, 20, 22, 24.2],
  detail: [
    { bulan: "Jan", pendapatan: "155,00", belanja: "140,00", surplus: "15,00", ytdPendapatan: "155,00", ytdBelanja: "140,00" },
    { bulan: "Feb", pendapatan: "162,00", belanja: "145,00", surplus: "17,00", ytdPendapatan: "317,00", ytdBelanja: "285,00" },
    { bulan: "Mar", pendapatan: "168,00", belanja: "150,00", surplus: "18,00", ytdPendapatan: "485,00", ytdBelanja: "435,00" },
    { bulan: "Apr", pendapatan: "175,00", belanja: "155,00", surplus: "20,00", ytdPendapatan: "660,00", ytdBelanja: "590,00" },
    { bulan: "Mei", pendapatan: "182,00", belanja: "160,00", surplus: "22,00", ytdPendapatan: "842,00", ytdBelanja: "750,00" },
    { bulan: "Jun", pendapatan: "189,60", belanja: "165,40", surplus: "24,20", ytdPendapatan: "1.031,60", ytdBelanja: "915,40" },
  ],
  insights: [
    "Surplus operasional positif 6 bulan berturut-turut — Rp 24,20 M di Juni.",
    "Pertumbuhan pendapatan MoM 4,2% melampaui belanja (3,4%).",
    "Proyeksi YTD surplus mencapai Rp 116,20 M jika tren berlanjut.",
  ],
};

export const EI_POSISI_KEUANGAN = {
  kpis: [
    { label: "Kas & Bank", value: "Rp 56,80 M", trend: "+8,2%", positive: true },
    { label: "Piutang Usaha", value: "Rp 78,40 M", trend: "-2,1%", positive: true },
    { label: "Hutang Usaha", value: "Rp 42,30 M", trend: "+1,5%", positive: false },
    { label: "Ekuitas Operasional", value: "Rp 312,50 M", trend: "+5,8%", positive: true },
  ],
  composition: [
    { label: "Kas & Bank", pct: 18, amount: "56,80", color: "#0d9488" },
    { label: "Piutang", pct: 25, amount: "78,40", color: "#3b82f6" },
    { label: "Persediaan", pct: 8, amount: "24,10", color: "#8b5cf6" },
    { label: "Aset Tetap", pct: 42, amount: "132,00", color: "#64748b" },
    { label: "Lainnya", pct: 7, amount: "21,20", color: "#94a3b8" },
  ],
  liabilities: [
    { label: "Hutang Vendor", value: "18,40" },
    { label: "Hutang Bekkes", value: "12,80" },
    { label: "Hutang Jasa", value: "7,60" },
    { label: "Hutang Lainnya", value: "3,50" },
  ],
  insights: [
    "Rasio kas terhadap belanja bulanan: 2,1 bulan — likuiditas aman.",
    "Piutang BPJS turun 2,35% MoM, percepatan penagihan berhasil.",
    "Hutang usaha naik moderat seiring volume pengadaan Q2.",
  ],
};

export const EI_PENDAPATAN_AKUN = {
  accounts: [
    { kode: "4.1.1.01", nama: "Rawat Inap BPJS", realisasi: 93.66, rencana: 95.0, growth: 5.2, pct: 49.4 },
    { kode: "4.1.1.02", nama: "Rawat Jalan BPJS", realisasi: 43.42, rencana: 42.0, growth: 3.8, pct: 22.9 },
    { kode: "4.1.2.01", nama: "Tunai / Umum", realisasi: 25.03, rencana: 28.0, growth: -1.2, pct: 13.2 },
    { kode: "4.1.3.01", nama: "Asuransi Swasta", realisasi: 15.36, rencana: 14.0, growth: 8.5, pct: 8.1 },
    { kode: "4.1.4.01", nama: "Kerja Sama & Lainnya", realisasi: 12.13, rencana: 11.0, growth: 12.1, pct: 6.4 },
  ],
  insights: [
    "Rawat Inap BPJS kontribusi terbesar (49,4%) — deviasi rencana -1,4%.",
    "Kerja Sama tumbuh 12,1% — peluang diversifikasi pendapatan.",
    "Tunai/umum di bawah rencana 10,6% — perlu evaluasi tarif.",
  ],
};

export const EI_DAYA_SERAP = {
  units: [
    { unit: "Rawat Inap", pagu: 85, realisasi: 62.4, pct: 73.4 },
    { unit: "Rawat Jalan", pagu: 52, realisasi: 38.1, pct: 73.3 },
    { unit: "IGD", pagu: 28, realisasi: 19.6, pct: 70.0 },
    { unit: "Farmasi", pagu: 35, realisasi: 22.8, pct: 65.1 },
    { unit: "Penunjang", pagu: 42, realisasi: 24.5, pct: 58.3 },
    { unit: "Bedah Sentral", pagu: 38, realisasi: 20.2, pct: 53.2 },
  ],
  heatmap: [
    { unit: "Rawat Inap", months: [58, 62, 65, 68, 71, 73] },
    { unit: "Rawat Jalan", months: [55, 58, 62, 66, 70, 73] },
    { unit: "IGD", months: [52, 55, 58, 62, 66, 70] },
    { unit: "Farmasi", months: [48, 52, 55, 58, 62, 65] },
  ],
  insights: [
    "Rata-rata daya serap YTD: 65,6% — on track untuk target 80% akhir tahun.",
    "Penunjang & Bedah Sentral di bawah 60% — perlu percepatan belanja.",
    "Rawat Inap & Jalan konsisten di atas 70%.",
  ],
};

export const EI_KOMPOSISI_ANGGARAN = {
  byKelompok: [
    { label: "Belanja Pegawai", pct: 37.7, pagu: 120, color: "#3b82f6" },
    { label: "Barang / Jasa", pct: 26.7, pagu: 85, color: "#14b8a6" },
    { label: "Modal", pct: 15.7, pagu: 50, color: "#8b5cf6" },
    { label: "Pemeliharaan", pct: 11.0, pagu: 35, color: "#f97316" },
    { label: "Bekkes", pct: 8.8, pagu: 28, color: "#ef4444" },
  ],
  byProgram: [
    { program: "Pelayanan Medis", pagu: 145, realisasi: 98.2, pct: 67.7 },
    { program: "Penunjang & Diagnostik", pagu: 62, realisasi: 38.4, pct: 61.9 },
    { program: "Sarana & Prasarana", pagu: 55, realisasi: 32.2, pct: 58.5 },
    { program: "Manajemen & Umum", pagu: 56, realisasi: 25.6, pct: 45.7 },
  ],
  insights: [
    "Belanja pegawai dominan (37,7%) — sesuai karakteristik RS.",
    "Program Manajemen & Umum daya serap terendah (45,7%).",
    "Belanja modal 64,4% realisasi — perlu monitoring ketat.",
  ],
};

export const EI_PAGU_PENGADAAN = {
  packages: [
    { paket: "Alkes Radiologi", pagu: 12.5, realisasi: 8.2, vendor: "PT Medika", status: "Berjalan" },
    { paket: "Obat & BMHP", pagu: 18.0, realisasi: 14.6, vendor: "Multi Vendor", status: "Berjalan" },
    { paket: "Renovasi Ruang OK", pagu: 8.5, realisasi: 8.5, vendor: "PT Konstruksi A", status: "Selesai" },
    { paket: "IT & Sistem Informasi", pagu: 6.2, realisasi: 3.1, vendor: "PT Teknologi B", status: "Tender" },
    { paket: "Kendaraan Operasional", pagu: 4.8, realisasi: 0, vendor: "-", status: "Perencanaan" },
  ],
  insights: [
    "Total pagu pengadaan Rp 50,00 M — realisasi 68,8%.",
    "2 paket belum mulai tender — risiko under-absorption Q3.",
    "Renovasi Ruang OK selesai 100% — on budget.",
  ],
};

export const EI_REVISI_PAGU = {
  revisions: [
    { tanggal: "15 Jan 2025", jenis: "DIPA Awal", unit: "Seluruh RS", sebelum: "318,00", sesudah: "318,00", selisih: "0,00" },
    { tanggal: "28 Feb 2025", jenis: "Pergeseran Internal", unit: "Farmasi → Rawat Inap", sebelum: "35,00", sesudah: "38,00", selisih: "+3,00" },
    { tanggal: "15 Apr 2025", jenis: "Revisi DIPA", unit: "Seluruh RS", sebelum: "318,00", sesudah: "335,00", selisih: "+17,00" },
    { tanggal: "02 Jun 2025", jenis: "Pergeseran Internal", unit: "Umum → Bedah Sentral", sebelum: "38,00", sesudah: "42,00", selisih: "+4,00" },
  ],
  insights: [
    "Total penambahan pagu tahun ini: Rp 17,00 M (+5,3%).",
    "2 kali pergeseran internal — tidak mengubah pagu total.",
    "Pagu efektif saat ini: Rp 335,00 M.",
  ],
};

export const EI_SIMULASI_PAGU = {
  scenarios: [
    { skenario: "Konservatif", growth: 3, pagu2026: 345, basis: "Tren realisasi 3 tahun" },
    { skenario: "Moderat", growth: 7, pagu2026: 358, basis: "Proyeksi layanan + inflasi" },
    { skenario: "Agresif", growth: 12, pagu2026: 375, basis: "Ekspansi layanan baru" },
  ],
  drivers: [
    { faktor: "Volume Rawat Inap", dampak: "+4,2%", arah: "naik" },
    { faktor: "Inflasi Obat & BMHP", dampak: "+3,8%", arah: "naik" },
    { faktor: "Efisiensi Belanja Pegawai", dampak: "-1,5%", arah: "turun" },
    { faktor: "Digitalisasi Layanan", dampak: "+2,1%", arah: "naik" },
  ],
  insights: [
    "Skenario moderat direkomendasikan: Rp 358,00 M (+6,9%).",
    "Faktor utama: volume layanan & inflasi obat.",
    "Efisiensi pegawai dapat menghemat Rp 5,0 M.",
  ],
};

export const EI_TREN_HUTANG = {
  years: ["2021", "2022", "2023", "2024", "2025"],
  hutang: [28.5, 32.1, 35.8, 39.2, 42.3],
  ratio: [18.2, 19.5, 20.1, 21.8, 22.4],
  aging: [
    { bucket: "0–30 hari", amount: 18.6, pct: 44.0 },
    { bucket: "31–60 hari", amount: 12.4, pct: 29.3 },
    { bucket: "61–90 hari", amount: 7.2, pct: 17.0 },
    { bucket: "> 90 hari", amount: 4.1, pct: 9.7 },
  ],
  insights: [
    "Hutang tumbuh 7,9% YoY — di bawah pertumbuhan belanja (9,3%).",
    "Rasio hutang/belanja: 22,4% — masih dalam batas wajar.",
    "9,7% hutang aging > 90 hari — perlu perhatian vendor bekkes.",
  ],
};

export const EI_HUTANG_AKUN = {
  accounts: [
    { kode: "2.1.1.01", nama: "Hutang Vendor Obat", saldo: 12.4, aging: "31–60 hari", vendor: "PT Farmasi A" },
    { kode: "2.1.1.02", nama: "Hutang Vendor Alkes", saldo: 5.8, aging: "0–30 hari", vendor: "PT Medika B" },
    { kode: "2.1.2.01", nama: "Hutang Bekkes", saldo: 12.8, aging: "61–90 hari", vendor: "Multi" },
    { kode: "2.1.3.01", nama: "Hutang Jasa Medis", saldo: 7.6, aging: "0–30 hari", vendor: "Dokter Spesialis" },
    { kode: "2.1.4.01", nama: "Hutang Lainnya", saldo: 3.7, aging: "> 90 hari", vendor: "Beragam" },
  ],
  insights: [
    "Hutang bekkes terbesar (30,3%) — aging 61–90 hari.",
    "Vendor obat Rp 12,4 M — jatuh tempo minggu depan.",
    "Total hutang usaha: Rp 42,30 M.",
  ],
};

export const EI_SALDO_BULANAN = {
  months: EI_MONTHS.slice(0, 6),
  saldo: [32.6, 35.2, 38.8, 42.1, 48.5, 56.8],
  minimum: 25,
  masuk: [145, 152, 158, 165, 172, 178],
  keluar: [142, 149, 154, 161, 166, 170],
  detail: [
    { bulan: "Jan", saldoAwal: "32,60", masuk: "145,00", keluar: "142,40", saldoAkhir: "35,20", runway: "2,1 bln" },
    { bulan: "Feb", saldoAwal: "35,20", masuk: "152,00", keluar: "149,40", saldoAkhir: "37,80", runway: "2,2 bln" },
    { bulan: "Mar", saldoAwal: "37,80", masuk: "158,00", keluar: "154,00", saldoAkhir: "41,80", runway: "2,4 bln" },
    { bulan: "Apr", saldoAwal: "41,80", masuk: "165,00", keluar: "161,70", saldoAkhir: "45,10", runway: "2,5 bln" },
    { bulan: "Mei", saldoAwal: "45,10", masuk: "172,00", keluar: "168,60", saldoAkhir: "48,50", runway: "2,7 bln" },
    { bulan: "Jun", saldoAwal: "48,50", masuk: "178,00", keluar: "169,70", saldoAkhir: "56,80", runway: "3,1 bln" },
  ],
  insights: [
    "Saldo kas naik 74% dalam 6 bulan — tren positif.",
    "Runway likuiditas: 3,1 bulan belanja — di atas minimum 2 bulan.",
    "Tidak ada alert saldo minimum sejak Maret 2025.",
  ],
};

export const EI_PASIEN_RESEP = {
  kpis: [
    { label: "Volume Pasien", value: "12.840", trend: "+6,2%", positive: true },
    { label: "Resep Terlayani", value: "28.560", trend: "+4,8%", positive: true },
    { label: "Belanja Bekkes", value: "Rp 12,80 M", trend: "+8,1%", positive: false },
    { label: "Pendapatan Farmasi", value: "Rp 18,40 M", trend: "+5,5%", positive: true },
  ],
  correlation: [
    { bulan: "Jan", pasien: 1980, resep: 4200, bekkes: 1.8, farmasi: 2.6 },
    { bulan: "Feb", pasien: 2050, resep: 4380, bekkes: 1.9, farmasi: 2.7 },
    { bulan: "Mar", pasien: 2120, resep: 4520, bekkes: 2.0, farmasi: 2.9 },
    { bulan: "Apr", pasien: 2180, resep: 4680, bekkes: 2.1, farmasi: 3.0 },
    { bulan: "Mei", pasien: 2240, resep: 4820, bekkes: 2.2, farmasi: 3.1 },
    { bulan: "Jun", pasien: 2270, resep: 4960, bekkes: 2.3, farmasi: 3.2 },
  ],
  insights: [
    "Korelasi pasien-resep: 0,97 — konsistensi layanan farmasi tinggi.",
    "Belanja bekkes naik 8,1% vs pendapatan farmasi 5,5% — margin tertekan.",
    "Rata-rata resep per pasien: 2,22 — stabil.",
  ],
};
