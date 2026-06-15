export type NavItem = {
  label: string;
  href: string;
  description: string;
};

/** Empat modul utama SQ+ — sidebar hanya menampilkan ini. */
export const MAIN_MODULES: NavItem[] = [
  {
    label: "Keuangan",
    href: "/finance",
    description: "Akuntansi, anggaran, kas, dan pelaporan keuangan",
  },
  {
    label: "Personalia",
    href: "/hr",
    description: "SDM, kehadiran, penggajian, dan manajemen karyawan",
  },
  {
    label: "Pengadaan Barang/Jasa",
    href: "/procurement",
    description: "Perencanaan, tender, PO, dan penerimaan barang/jasa",
  },
  {
    label: "Asset / Supply Chain",
    href: "/supply-chain",
    description: "Inventori, aset tetap, distribusi, dan logistik",
  },
];

export const UTILITY_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", description: "Ringkasan operasional" },
  { label: "Persetujuan", href: "/approvals", description: "Antrian approval" },
  { label: "Notifikasi", href: "/notifications", description: "Pemberitahuan sistem" },
  { label: "Profil", href: "/profile", description: "Akun pengguna" },
  { label: "Sistem", href: "/system", description: "Konfigurasi & admin" },
];
