import {
  Boxes,
  LayoutDashboard,
  ShoppingCart,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { FINANCE_SUB_NAV } from "./finance-navigation";
import { HR_SUB_NAV } from "./hr-navigation";

export type NavChild = {
  labelKey: string;
  href: string;
};

export type MenuItem = {
  labelKey: string;
  href: string;
  icon: LucideIcon;
  descriptionKey: string;
  children?: readonly NavChild[];
};

/** Menu beranda — halaman default setelah login */
export const HOME_MENU: MenuItem = {
  labelKey: "menu.home",
  href: "/beranda",
  icon: LayoutDashboard,
  descriptionKey: "menu.homeDescription",
};

/**
 * Empat modul utama SQ+. Sidebar HANYA menampilkan menu ini.
 * Jangan menambahkan modul utama lain di sini.
 */
export const MAIN_MENU: MenuItem[] = [
  {
    labelKey: "menu.finance",
    href: "/finance",
    icon: Wallet,
    descriptionKey: "menu.financeDescription",
    children: FINANCE_SUB_NAV,
  },
  {
    labelKey: "menu.hr",
    href: "/hr",
    icon: Users,
    descriptionKey: "menu.hrDescription",
    children: HR_SUB_NAV,
  },
  {
    labelKey: "menu.procurement",
    href: "/procurement",
    icon: ShoppingCart,
    descriptionKey: "menu.procurementDescription",
  },
  {
    labelKey: "menu.supplyChain",
    href: "/supply-chain",
    icon: Boxes,
    descriptionKey: "menu.supplyChainDescription",
  },
];
