import type { HrPagePath, HrSectionLabelKey } from "./hr-navigation";

export type HrSection = {
  id: string;
  labelKey: HrSectionLabelKey;
  description: string;
};

export type HrPageConfig = {
  path: HrPagePath;
  labelKey: string;
  title: string;
  subtitle: string;
  /** Tab hanya jika >1 section — alur kerja atau tampilan data terkait */
  sections?: HrSection[];
};

const absensiSections: HrSection[] = [
  {
    id: "log-absensi",
    labelKey: "hr.kehadiran.logAbsensi",
    description: "Log mentah absensi dari mesin fingerprint dan input manual",
  },
  {
    id: "absensi-harian",
    labelKey: "hr.kehadiran.absensiHarian",
    description: "Rekap absensi harian per pegawai — masuk, pulang, dan durasi",
  },
  {
    id: "rekap-kehadiran",
    labelKey: "hr.kehadiran.rekapKehadiran",
    description: "Rekap kehadiran periode — hadir, sakit, izin, dan alpha",
  },
];

const pengajuanCutiIzinSections: HrSection[] = [
  {
    id: "pengajuan-cuti",
    labelKey: "hr.cutiIzin.pengajuanCuti",
    description: "Form pengajuan cuti tahunan, besar, melahirkan, dan lainnya",
  },
  {
    id: "pengajuan-izin",
    labelKey: "hr.cutiIzin.pengajuanIzin",
    description: "Pengajuan izin tidak masuk kerja — sakit, dinas, dan urusan pribadi",
  },
];

const lemburWorkflowSections: HrSection[] = [
  {
    id: "pengajuan-lembur",
    labelKey: "hr.lembur.pengajuanLembur",
    description: "Form pengajuan lembur pegawai dengan durasi dan alasan",
  },
  {
    id: "approval-lembur",
    labelKey: "hr.lembur.approvalLembur",
    description: "Persetujuan lembur oleh atasan sesuai kebijakan RS",
  },
  {
    id: "validasi-lembur",
    labelKey: "hr.lembur.validasiLembur",
    description: "Validasi lembur SDM sebelum masuk perhitungan gaji",
  },
  {
    id: "rekap-lembur",
    labelKey: "hr.lembur.rekapLembur",
    description: "Rekap jam lembur per pegawai per periode",
  },
  {
    id: "lembur-dibayarkan",
    labelKey: "hr.lembur.lemburDibayarkan",
    description: "Lembur yang sudah dibayarkan melalui payroll",
  },
];

const payrollReferensiSections: HrSection[] = [
  {
    id: "periode-payroll",
    labelKey: "hr.payroll.periodePayroll",
    description: "Master periode payroll bulanan dan tunjangan",
  },
  {
    id: "komponen-gaji",
    labelKey: "hr.payroll.komponenGaji",
    description: "Komponen pendapatan dan potongan gaji",
  },
  {
    id: "skema-gaji",
    labelKey: "hr.payroll.skemaGaji",
    description: "Skema gaji per golongan, jabatan, atau individu",
  },
  {
    id: "skema-ter",
    labelKey: "hr.payroll.skemaTer",
    description: "Referensi tarif efektif rata-rata (TER) PPh 21 kategori A, B, dan C",
  },
];

const payrollProsesSections: HrSection[] = [
  {
    id: "proses-payroll",
    labelKey: "hr.payroll.prosesPayroll",
    description: "Proses hitung gaji per periode — draft hingga final",
  },
  {
    id: "validasi-payroll",
    labelKey: "hr.payroll.validasiPayroll",
    description: "Validasi payroll sebelum penerbitan slip gaji",
  },
  {
    id: "slip-gaji",
    labelKey: "hr.payroll.slipGaji",
    description: "Slip gaji pegawai — unduh dan kirim digital",
  },
  {
    id: "posting-keuangan",
    labelKey: "hr.payroll.postingKeuangan",
    description: "Posting payroll ke modul keuangan — jurnal dan pembayaran",
  },
  {
    id: "riwayat-payroll",
    labelKey: "hr.payroll.riwayatPayroll",
    description: "Riwayat payroll periode sebelumnya",
  },
  {
    id: "perhitungan-pajak",
    labelKey: "hr.payroll.perhitunganPajak",
    description: "Perhitungan PPh 21 pegawai dengan skema TER — bruto, tarif, dan potongan pajak",
  },
];

const kinerjaReferensiSections: HrSection[] = [
  {
    id: "indikator-kinerja",
    labelKey: "hr.kinerja.indikatorKinerja",
    description: "Master indikator kinerja (KPI) pegawai",
  },
  {
    id: "target-kinerja",
    labelKey: "hr.kinerja.targetKinerja",
    description: "Penetapan target kinerja per periode dan pegawai",
  },
];

const approvalSections: HrSection[] = [
  {
    id: "inbox",
    labelKey: "hr.approval.inbox",
    description: "Antrian dokumen SDM yang menunggu persetujuan Anda",
  },
  {
    id: "riwayat",
    labelKey: "hr.approval.riwayat",
    description: "Riwayat approval personalia — filter periode dan jenis",
  },
  {
    id: "delegasi",
    labelKey: "hr.approval.delegasi",
    description: "Delegasi approval SDM — pejabat pengganti dan masa berlaku",
  },
];

export const HR_PAGES: HrPageConfig[] = [
  {
    path: "pegawai/profil",
    labelKey: "hr.pegawai.profilSaya",
    title: "Profil Saya",
    subtitle: "Data pribadi, kepegawaian, keluarga, dan riwayat karier Anda",
  },
  {
    path: "pegawai/kehadiran",
    labelKey: "hr.pegawai.kehadiranSaya",
    title: "Kehadiran Saya",
    subtitle: "Rekap absensi pribadi — hadir, terlambat, izin, dan alpha",
  },
  {
    path: "pegawai/lembur",
    labelKey: "hr.pegawai.pengajuanLembur",
    title: "Pengajuan Lembur",
    subtitle: "Ajukan lembur dan pantau status persetujuan atasan",
    sections: [
      {
        id: "pengajuan-lembur",
        labelKey: "hr.lembur.pengajuanLembur",
        description: "Form pengajuan lembur pegawai dengan durasi dan alasan",
      },
    ],
  },
  {
    path: "pegawai/slip-gaji",
    labelKey: "hr.pegawai.slipGaji",
    title: "Slip Gaji Saya",
    subtitle: "Slip gaji periode berjalan dan arsip slip gaji pribadi",
  },
  {
    path: "atasan/kehadiran-tim",
    labelKey: "hr.atasan.kehadiranTim",
    title: "Kehadiran Tim",
    subtitle: "Monitoring kehadiran bawahan langsung — harian dan rekap periode",
  },
  {
    path: "atasan/lembur",
    labelKey: "hr.lembur.approvalLembur",
    title: "Approval Lembur",
    subtitle: "Persetujuan pengajuan lembur bawahan langsung",
    sections: [
      {
        id: "approval-lembur",
        labelKey: "hr.lembur.approvalLembur",
        description: "Persetujuan lembur oleh atasan sesuai kebijakan RS",
      },
    ],
  },
  {
    path: "pimpinan",
    labelKey: "hr.nav.ringkasanPimpinan",
    title: "Ringkasan Pimpinan",
    subtitle: "Ringkasan strategis SDM — komposisi, kehadiran, payroll, dan alert",
  },
  {
    path: "approval/delegasi",
    labelKey: "hr.approval.delegasi",
    title: "Delegasi Approval",
    subtitle: "Penunjukan pejabat pengganti dan masa berlaku delegasi wewenang",
  },
  {
    path: "data-pegawai",
    labelKey: "hr.dataPegawai.daftarPegawai",
    title: "Daftar Pegawai",
    subtitle: "Daftar seluruh pegawai aktif dan nonaktif dengan filter unit dan status",
  },
  {
    path: "data-pegawai/tambah",
    labelKey: "hr.dataPegawai.tambahPegawai",
    title: "Tambah Pegawai",
    subtitle: "Form pendaftaran pegawai baru — data pribadi, kepegawaian, dan akun",
  },
  {
    path: "organisasi-jabatan/unit-kerja",
    labelKey: "hr.organisasi.unitKerja",
    title: "Unit Kerja",
    subtitle: "Master unit kerja / satuan kerja pegawai",
  },
  {
    path: "organisasi-jabatan/jabatan",
    labelKey: "hr.organisasi.jabatan",
    title: "Jabatan",
    subtitle: "Master jabatan struktural dan fungsional",
  },
  {
    path: "organisasi-jabatan/mapping-atasan",
    labelKey: "hr.organisasi.mappingAtasan",
    title: "Mapping Atasan",
    subtitle: "Relasi atasan langsung pegawai untuk approval dan penilaian",
  },
  {
    path: "organisasi-jabatan/struktur-organisasi",
    labelKey: "hr.organisasi.strukturOrganisasi",
    title: "Struktur Organisasi",
    subtitle: "Hierarki organisasi rumah sakit — direktorat, instalasi, dan unit",
  },
  {
    path: "organisasi-jabatan/penempatan-pegawai",
    labelKey: "hr.organisasi.penempatanPegawai",
    title: "Penempatan Pegawai",
    subtitle: "Penempatan aktif pegawai ke unit dan jabatan",
  },
  {
    path: "organisasi-jabatan/bagan-organisasi",
    labelKey: "hr.organisasi.baganOrganisasi",
    title: "Bagan Organisasi",
    subtitle: "Visualisasi bagan organisasi interaktif",
  },
  {
    path: "kehadiran",
    labelKey: "hr.nav.absensi",
    title: "Absensi",
    subtitle: "Log, rekap harian, dan rekap periode kehadiran pegawai",
    sections: absensiSections,
  },
  {
    path: "kehadiran/jadwal-shift",
    labelKey: "hr.kehadiran.jadwalShift",
    title: "Jadwal & Shift",
    subtitle: "Jadwal kerja dan shift pegawai per unit",
  },
  {
    path: "kehadiran/import-fingerprint",
    labelKey: "hr.kehadiran.importFingerprint",
    title: "Import Fingerprint",
    subtitle: "Import data absensi dari mesin fingerprint",
  },
  {
    path: "kehadiran/koreksi",
    labelKey: "hr.kehadiran.koreksiAbsensi",
    title: "Koreksi Absensi",
    subtitle: "Pengajuan dan proses koreksi absensi pegawai",
  },
  {
    path: "kehadiran/validasi",
    labelKey: "hr.kehadiran.validasiAbsensi",
    title: "Validasi Absensi",
    subtitle: "Validasi absensi unit sebelum proses payroll",
  },
  {
    path: "cuti-izin/pengajuan",
    labelKey: "hr.nav.pengajuan",
    title: "Pengajuan Cuti & Izin",
    subtitle: "Form pengajuan cuti dan izin tidak masuk kerja",
    sections: pengajuanCutiIzinSections,
  },
  {
    path: "cuti-izin/saldo",
    labelKey: "hr.cutiIzin.saldoCuti",
    title: "Saldo Cuti",
    subtitle: "Saldo cuti per pegawai per tahun",
  },
  {
    path: "cuti-izin/kalender",
    labelKey: "hr.cutiIzin.kalenderCuti",
    title: "Kalender Cuti",
    subtitle: "Kalender cuti unit — libur bersama dan cuti pegawai",
  },
  {
    path: "cuti-izin/approval",
    labelKey: "hr.cutiIzin.approvalCutiIzin",
    title: "Approval Cuti/Izin",
    subtitle: "Antrian persetujuan cuti dan izin oleh atasan langsung",
  },
  {
    path: "cuti-izin/riwayat",
    labelKey: "hr.cutiIzin.riwayatCutiIzin",
    title: "Riwayat Cuti/Izin",
    subtitle: "Riwayat cuti dan izin yang sudah diproses",
  },
  {
    path: "lembur",
    labelKey: "hr.nav.lembur",
    title: "Lembur",
    subtitle: "Alur pengajuan, approval, validasi, rekap, dan pembayaran lembur",
    sections: lemburWorkflowSections,
  },
  {
    path: "payroll",
    labelKey: "hr.nav.payrollReferensi",
    title: "Referensi Payroll",
    subtitle: "Periode, komponen gaji, dan skema gaji",
    sections: payrollReferensiSections,
  },
  {
    path: "payroll/proses",
    labelKey: "hr.nav.payrollProses",
    title: "Proses Payroll",
    subtitle: "Hitung gaji, validasi, slip, posting keuangan, dan riwayat",
    sections: payrollProsesSections,
  },
  {
    path: "kinerja",
    labelKey: "hr.nav.kinerjaReferensi",
    title: "Referensi Kinerja",
    subtitle: "Indikator dan target kinerja pegawai",
    sections: kinerjaReferensiSections,
  },
  {
    path: "kinerja/penilaian",
    labelKey: "hr.kinerja.penilaianPegawai",
    title: "Penilaian Pegawai",
    subtitle: "Form penilaian kinerja oleh atasan langsung",
  },
  {
    path: "kinerja/rekap",
    labelKey: "hr.kinerja.rekapNilai",
    title: "Rekap Nilai",
    subtitle: "Rekap nilai kinerja per unit dan periode",
  },
  {
    path: "kinerja/riwayat",
    labelKey: "hr.kinerja.riwayatPenilaian",
    title: "Riwayat Penilaian",
    subtitle: "Riwayat penilaian kinerja pegawai",
  },
  {
    path: "dokumen",
    labelKey: "hr.nav.dokumenPegawai",
    title: "Dokumen Pegawai",
    subtitle:
      "Kelola dokumen identitas, SK/kontrak, STR/SIP, dan sertifikasi — filter per jenis dokumen",
  },
  {
    path: "dokumen/expired",
    labelKey: "hr.dokumen.dokumenExpired",
    title: "Dokumen Expired",
    subtitle: "Daftar dokumen yang akan atau sudah kedaluwarsa",
  },
  {
    path: "dokumen/arsip",
    labelKey: "hr.dokumen.arsipDokumen",
    title: "Arsip Dokumen",
    subtitle: "Arsip dokumen pegawai nonaktif atau historis",
  },
  {
    path: "approval",
    labelKey: "hr.nav.approval",
    title: "Approval Personalia",
    subtitle: "Inbox, riwayat, dan delegasi approval SDM",
    sections: approvalSections,
  },
  {
    path: "laporan/pegawai",
    labelKey: "hr.laporan.laporanPegawai",
    title: "Laporan Pegawai",
    subtitle: "Laporan demografi dan komposisi SDM",
  },
  {
    path: "laporan/kehadiran",
    labelKey: "hr.laporan.laporanKehadiran",
    title: "Laporan Kehadiran",
    subtitle: "Laporan kehadiran per unit dan periode",
  },
  {
    path: "laporan/cuti-izin",
    labelKey: "hr.laporan.laporanCutiIzin",
    title: "Laporan Cuti & Izin",
    subtitle: "Laporan cuti dan izin pegawai",
  },
  {
    path: "laporan/lembur",
    labelKey: "hr.laporan.laporanLembur",
    title: "Laporan Lembur",
    subtitle: "Laporan jam lembur dan biaya lembur",
  },
  {
    path: "laporan/payroll",
    labelKey: "hr.laporan.laporanPayroll",
    title: "Laporan Payroll",
    subtitle: "Laporan payroll — bruto, potongan, dan netto",
  },
  {
    path: "laporan/dokumen",
    labelKey: "hr.laporan.laporanDokumen",
    title: "Laporan Dokumen",
    subtitle: "Laporan kelengkapan dan kedaluwarsa dokumen pegawai",
  },
  {
    path: "laporan/executive-summary",
    labelKey: "hr.laporan.executiveSummary",
    title: "Executive Summary",
    subtitle: "Ringkasan eksekutif SDM untuk pimpinan",
  },
  {
    path: "pengaturan/workflow",
    labelKey: "hr.pengaturan.workflowPersonalia",
    title: "Workflow Personalia",
    subtitle: "Konfigurasi alur cuti, lembur, mutasi, dan payroll",
  },
  {
    path: "pengaturan/status-pegawai",
    labelKey: "hr.pengaturan.masterStatusPegawai",
    title: "Master Status Pegawai",
    subtitle: "Master status kepegawaian — PNS, PPPK, kontrak, honorer",
  },
  {
    path: "pengaturan/jenis-cuti-izin",
    labelKey: "hr.pengaturan.masterJenisCutiIzin",
    title: "Master Jenis Cuti/Izin",
    subtitle: "Master jenis cuti dan izin beserta aturan saldo",
  },
  {
    path: "pengaturan/shift",
    labelKey: "hr.pengaturan.masterShift",
    title: "Master Shift",
    subtitle: "Master shift kerja dan jam operasional",
  },
  {
    path: "pengaturan/komponen-payroll",
    labelKey: "hr.pengaturan.masterKomponenPayroll",
    title: "Master Komponen Payroll",
    subtitle: "Master komponen gaji untuk skema payroll",
  },
  {
    path: "pengaturan/mapping-approval",
    labelKey: "hr.pengaturan.mappingApproval",
    title: "Mapping Approval",
    subtitle: "Pemetaan jenis dokumen SDM ke pejabat penandatangan",
  },
];

export const HR_PAGE_BY_PATH = Object.fromEntries(
  HR_PAGES.map((page) => [page.path, page])
) as Record<HrPagePath, HrPageConfig>;

export const HR_LEGACY_PATH_REDIRECT: Record<string, string> = {
  employees: "/hr/data-pegawai",
  karyawan: "/hr/data-pegawai",
  attendance: "/hr/kehadiran",
  absensi: "/hr/kehadiran",
  leave: "/hr/cuti-izin/pengajuan",
  cuti: "/hr/cuti-izin/pengajuan",
  "organisasi-jabatan": "/hr/organisasi-jabatan/unit-kerja",
  "cuti-izin": "/hr/cuti-izin/pengajuan",
  laporan: "/hr/laporan/pegawai",
  pengaturan: "/hr/pengaturan/workflow",
  settings: "/hr/pengaturan/workflow",
  pegawai: "/hr/pegawai/profil",
  atasan: "/hr/approval",
  personalia: "/hr/data-pegawai",
  pimpinan: "/hr/pimpinan",
};

export const HR_LEGACY_TAB_REDIRECT: Record<string, Record<string, string>> = {
  kehadiran: {
    "jadwal-shift": "/hr/kehadiran/jadwal-shift",
    "import-fingerprint": "/hr/kehadiran/import-fingerprint",
    "koreksi-absensi": "/hr/kehadiran/koreksi",
    "validasi-absensi": "/hr/kehadiran/validasi",
  },
  "cuti-izin": {
    "pengajuan-cuti": "/hr/cuti-izin/pengajuan?tab=pengajuan-cuti",
    "pengajuan-izin": "/hr/cuti-izin/pengajuan?tab=pengajuan-izin",
    "saldo-cuti": "/hr/cuti-izin/saldo",
    "kalender-cuti": "/hr/cuti-izin/kalender",
    "approval-cuti-izin": "/hr/cuti-izin/approval",
    "riwayat-cuti-izin": "/hr/cuti-izin/riwayat",
  },
  payroll: {
    "proses-payroll": "/hr/payroll/proses?tab=proses-payroll",
    "validasi-payroll": "/hr/payroll/proses?tab=validasi-payroll",
    "slip-gaji": "/hr/payroll/proses?tab=slip-gaji",
    "posting-keuangan": "/hr/payroll/proses?tab=posting-keuangan",
    "riwayat-payroll": "/hr/payroll/proses?tab=riwayat-payroll",
  },
};
