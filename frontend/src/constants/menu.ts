import {
  Boxes,
  LayoutDashboard,
  ShoppingCart,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type MenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
};

/** Menu beranda — halaman default setelah login */
export const HOME_MENU: MenuItem = {
  label: "Beranda",
  href: "/beranda",
  icon: LayoutDashboard,
  description: "Ringkasan kinerja rumah sakit",
};

/**
 * Empat modul utama SQ+. Sidebar HANYA menampilkan menu ini.
 * Jangan menambahkan modul utama lain di sini.
 */
export const MAIN_MENU: MenuItem[] = [
  {
    label: "Keuangan",
    href: "/finance",
    icon: Wallet,
    description: "Akuntansi, anggaran, kas, dan pelaporan keuangan",
  },
  {
    label: "Personalia",
    href: "/hr",
    icon: Users,
    description: "SDM, kehadiran, penggajian, dan manajemen karyawan",
  },
  {
    label: "Pengadaan Barang/Jasa",
    href: "/procurement",
    icon: ShoppingCart,
    description: "Perencanaan, tender, PO, dan penerimaan barang/jasa",
  },
  {
    label: "Asset / Supply Chain",
    href: "/supply-chain",
    icon: Boxes,
    description: "Inventori, aset tetap, distribusi, dan logistik",
  },
];
