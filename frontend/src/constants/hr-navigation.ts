export type HrNavLabelKey =
  | "hr.nav.dashboard"
  | "hr.nav.dataPegawai"
  | "hr.nav.organisasiJabatan"
  | "hr.nav.kehadiran"
  | "hr.nav.absensi"
  | "hr.nav.cutiIzin"
  | "hr.nav.lembur"
  | "hr.nav.payroll"
  | "hr.nav.payrollReferensi"
  | "hr.nav.payrollProses"
  | "hr.nav.kinerja"
  | "hr.nav.kinerjaReferensi"
  | "hr.nav.dokumen"
  | "hr.nav.dokumenPegawai"
  | "hr.nav.approval"
  | "hr.nav.laporan"
  | "hr.nav.pengaturan"
  | "hr.nav.ringkasanPimpinan";

export type HrSectionLabelKey =
  | "hr.dataPegawai.profilPegawai"
  | "hr.dataPegawai.dataKeluarga"
  | "hr.dataPegawai.pendidikanSertifikasi"
  | "hr.dataPegawai.riwayatKontrak"
  | "hr.dataPegawai.riwayatMutasi"
  | "hr.dataPegawai.riwayatPenempatan"
  | "hr.kehadiran.logAbsensi"
  | "hr.kehadiran.absensiHarian"
  | "hr.kehadiran.rekapKehadiran"
  | "hr.cutiIzin.pengajuanCuti"
  | "hr.cutiIzin.pengajuanIzin"
  | "hr.lembur.pengajuanLembur"
  | "hr.lembur.approvalLembur"
  | "hr.lembur.validasiLembur"
  | "hr.lembur.rekapLembur"
  | "hr.lembur.lemburDibayarkan"
  | "hr.payroll.periodePayroll"
  | "hr.payroll.komponenGaji"
  | "hr.payroll.skemaGaji"
  | "hr.payroll.prosesPayroll"
  | "hr.payroll.validasiPayroll"
  | "hr.payroll.slipGaji"
  | "hr.payroll.postingKeuangan"
  | "hr.payroll.riwayatPayroll"
  | "hr.payroll.skemaTer"
  | "hr.payroll.perhitunganPajak"
  | "hr.kinerja.indikatorKinerja"
  | "hr.kinerja.targetKinerja"
  | "hr.approval.inbox"
  | "hr.approval.riwayat"
  | "hr.approval.delegasi";

export type HrNavItem = {
  labelKey: string;
  href: string;
  children?: readonly HrNavItem[];
};

/**
 * Sidebar Personalia — nama menu langsung, tanpa label peran.
 * Urutan: layanan pribadi → approval & tim → administrasi SDM → ringkasan pimpinan.
 */
export const HR_SUB_NAV: HrNavItem[] = [
  { labelKey: "hr.nav.dashboard", href: "/hr" },
  { labelKey: "hr.pegawai.profilSaya", href: "/hr/pegawai/profil" },
  { labelKey: "hr.pegawai.kehadiranSaya", href: "/hr/pegawai/kehadiran" },
  { labelKey: "hr.pegawai.pengajuanCutiIzin", href: "/hr/cuti-izin/pengajuan" },
  { labelKey: "hr.pegawai.pengajuanLembur", href: "/hr/pegawai/lembur" },
  { labelKey: "hr.pegawai.saldoCuti", href: "/hr/cuti-izin/saldo" },
  { labelKey: "hr.pegawai.slipGaji", href: "/hr/pegawai/slip-gaji" },
  { labelKey: "hr.pegawai.dokumenSaya", href: "/hr/dokumen" },
  { labelKey: "hr.pegawai.riwayatCutiIzin", href: "/hr/cuti-izin/riwayat" },
  { labelKey: "hr.approval.inbox", href: "/hr/approval" },
  { labelKey: "hr.cutiIzin.approvalCutiIzin", href: "/hr/cuti-izin/approval" },
  { labelKey: "hr.lembur.approvalLembur", href: "/hr/atasan/lembur" },
  { labelKey: "hr.atasan.kehadiranTim", href: "/hr/atasan/kehadiran-tim" },
  { labelKey: "hr.kinerja.penilaianPegawai", href: "/hr/kinerja/penilaian" },
  { labelKey: "hr.kinerja.rekapNilai", href: "/hr/kinerja/rekap" },
  { labelKey: "hr.approval.delegasi", href: "/hr/approval/delegasi" },
  {
    labelKey: "hr.nav.dataPegawai",
    href: "/hr/data-pegawai/tambah",
    children: [
      { labelKey: "hr.dataPegawai.daftarPegawai", href: "/hr/data-pegawai" },
      { labelKey: "hr.dataPegawai.tambahPegawai", href: "/hr/data-pegawai/tambah" },
    ],
  },
  {
    labelKey: "hr.nav.organisasiJabatan",
    href: "/hr/organisasi-jabatan/unit-kerja",
    children: [
      { labelKey: "hr.organisasi.unitKerja", href: "/hr/organisasi-jabatan/unit-kerja" },
      { labelKey: "hr.organisasi.jabatan", href: "/hr/organisasi-jabatan/jabatan" },
      { labelKey: "hr.organisasi.mappingAtasan", href: "/hr/organisasi-jabatan/mapping-atasan" },
      {
        labelKey: "hr.organisasi.strukturOrganisasi",
        href: "/hr/organisasi-jabatan/struktur-organisasi",
      },
      {
        labelKey: "hr.organisasi.penempatanPegawai",
        href: "/hr/organisasi-jabatan/penempatan-pegawai",
      },
      { labelKey: "hr.organisasi.baganOrganisasi", href: "/hr/organisasi-jabatan/bagan-organisasi" },
    ],
  },
  {
    labelKey: "hr.nav.kehadiran",
    href: "/hr/kehadiran",
    children: [
      { labelKey: "hr.nav.absensi", href: "/hr/kehadiran" },
      { labelKey: "hr.kehadiran.jadwalShift", href: "/hr/kehadiran/jadwal-shift" },
      { labelKey: "hr.kehadiran.importFingerprint", href: "/hr/kehadiran/import-fingerprint" },
      { labelKey: "hr.kehadiran.koreksiAbsensi", href: "/hr/kehadiran/koreksi" },
      { labelKey: "hr.kehadiran.validasiAbsensi", href: "/hr/kehadiran/validasi" },
    ],
  },
  {
    labelKey: "hr.nav.cutiIzin",
    href: "/hr/cuti-izin/kalender",
    children: [
      { labelKey: "hr.cutiIzin.kalenderCuti", href: "/hr/cuti-izin/kalender" },
      { labelKey: "hr.cutiIzin.riwayatCutiIzin", href: "/hr/cuti-izin/riwayat" },
    ],
  },
  { labelKey: "hr.nav.lembur", href: "/hr/lembur" },
  {
    labelKey: "hr.nav.payroll",
    href: "/hr/payroll/proses",
    children: [
      { labelKey: "hr.nav.payrollReferensi", href: "/hr/payroll" },
      { labelKey: "hr.nav.payrollProses", href: "/hr/payroll/proses" },
    ],
  },
  {
    labelKey: "hr.nav.kinerja",
    href: "/hr/kinerja/riwayat",
    children: [
      { labelKey: "hr.nav.kinerjaReferensi", href: "/hr/kinerja" },
      { labelKey: "hr.kinerja.riwayatPenilaian", href: "/hr/kinerja/riwayat" },
    ],
  },
  {
    labelKey: "hr.nav.dokumen",
    href: "/hr/dokumen/expired",
    children: [
      { labelKey: "hr.dokumen.dokumenExpired", href: "/hr/dokumen/expired" },
      { labelKey: "hr.dokumen.arsipDokumen", href: "/hr/dokumen/arsip" },
    ],
  },
  {
    labelKey: "hr.nav.laporan",
    href: "/hr/laporan/kehadiran",
    children: [
      { labelKey: "hr.laporan.laporanPegawai", href: "/hr/laporan/pegawai" },
      { labelKey: "hr.laporan.laporanKehadiran", href: "/hr/laporan/kehadiran" },
      { labelKey: "hr.laporan.laporanCutiIzin", href: "/hr/laporan/cuti-izin" },
      { labelKey: "hr.laporan.laporanLembur", href: "/hr/laporan/lembur" },
      { labelKey: "hr.laporan.laporanPayroll", href: "/hr/laporan/payroll" },
      { labelKey: "hr.laporan.laporanDokumen", href: "/hr/laporan/dokumen" },
      { labelKey: "hr.laporan.executiveSummary", href: "/hr/laporan/executive-summary" },
    ],
  },
  {
    labelKey: "hr.nav.pengaturan",
    href: "/hr/pengaturan/workflow",
    children: [
      { labelKey: "hr.pengaturan.workflowPersonalia", href: "/hr/pengaturan/workflow" },
      { labelKey: "hr.pengaturan.masterStatusPegawai", href: "/hr/pengaturan/status-pegawai" },
      { labelKey: "hr.pengaturan.masterJenisCutiIzin", href: "/hr/pengaturan/jenis-cuti-izin" },
      { labelKey: "hr.pengaturan.masterShift", href: "/hr/pengaturan/shift" },
      { labelKey: "hr.pengaturan.masterKomponenPayroll", href: "/hr/pengaturan/komponen-payroll" },
      { labelKey: "hr.pengaturan.mappingApproval", href: "/hr/pengaturan/mapping-approval" },
    ],
  },
  { labelKey: "hr.nav.ringkasanPimpinan", href: "/hr/pimpinan" },
];

/** Semua path HR (tanpa prefix /hr) untuk routing & static params */
export const HR_PAGE_PATHS = [
  "pegawai/profil",
  "pegawai/kehadiran",
  "pegawai/lembur",
  "pegawai/slip-gaji",
  "atasan/kehadiran-tim",
  "atasan/lembur",
  "pimpinan",
  "approval/delegasi",
  "data-pegawai",
  "data-pegawai/tambah",
  "organisasi-jabatan/unit-kerja",
  "organisasi-jabatan/jabatan",
  "organisasi-jabatan/mapping-atasan",
  "organisasi-jabatan/struktur-organisasi",
  "organisasi-jabatan/penempatan-pegawai",
  "organisasi-jabatan/bagan-organisasi",
  "kehadiran",
  "kehadiran/jadwal-shift",
  "kehadiran/import-fingerprint",
  "kehadiran/koreksi",
  "kehadiran/validasi",
  "cuti-izin/pengajuan",
  "cuti-izin/saldo",
  "cuti-izin/kalender",
  "cuti-izin/approval",
  "cuti-izin/riwayat",
  "lembur",
  "payroll",
  "payroll/proses",
  "kinerja",
  "kinerja/penilaian",
  "kinerja/rekap",
  "kinerja/riwayat",
  "dokumen",
  "dokumen/expired",
  "dokumen/arsip",
  "approval",
  "laporan/pegawai",
  "laporan/kehadiran",
  "laporan/cuti-izin",
  "laporan/lembur",
  "laporan/payroll",
  "laporan/dokumen",
  "laporan/executive-summary",
  "pengaturan/workflow",
  "pengaturan/status-pegawai",
  "pengaturan/jenis-cuti-izin",
  "pengaturan/shift",
  "pengaturan/komponen-payroll",
  "pengaturan/mapping-approval",
] as const;

export type HrPagePath = (typeof HR_PAGE_PATHS)[number];

/** Shortcut dashboard — menu utama tanpa label peran */
export const HR_DASHBOARD_SHORTCUTS = [
  { labelKey: "hr.pegawai.profilSaya", href: "/hr/pegawai/profil" },
  { labelKey: "hr.approval.inbox", href: "/hr/approval" },
  { labelKey: "hr.dataPegawai.daftarPegawai", href: "/hr/data-pegawai" },
  { labelKey: "hr.nav.ringkasanPimpinan", href: "/hr/pimpinan" },
] as const;
