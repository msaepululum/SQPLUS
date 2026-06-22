import type { KpiItem, TrendDir } from "@/constants/beranda";
import type { FinanceReportDashboardData } from "@/types/finance-reports";
import type { HrDashboard } from "@/types/hr";
import type { ProcurementDashboard } from "@/types/procurement";
import type { RevenueDashboardData } from "@/types/revenue-dashboard";
import type { SupplyChainDashboard } from "@/types/supply-chain";
import type { CashBankDashboardData } from "@/types/cash-bank-dashboard";
import { formatReportRupiah } from "@/types/finance-reports";
import { formatAssetAmount } from "@/types/supply-chain";
import { formatDashboardAmount } from "@/types/cash-bank-dashboard";
import { formatHrNumber } from "@/types/hr";
import {
  Banknote,
  Building2,
  CircleDollarSign,
  ClipboardList,
  Users,
  Wallet,
} from "lucide-react";

export type BerandaHighlight = {
  title: string;
  desc: string;
  tone: "emerald" | "red" | "violet" | "blue" | "amber";
  href?: string;
};

export type BerandaKpi = KpiItem & { href: string };

function compactRupiah(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(2)} M`;
  if (abs >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)} jt`;
  return formatReportRupiah(value);
}

export function buildBerandaKpis(input: {
  finance: FinanceReportDashboardData | null;
  hr: HrDashboard | null;
  supplyChain: SupplyChainDashboard | null;
  procurement: ProcurementDashboard | null;
}): BerandaKpi[] {
  const { finance, hr, supplyChain, procurement } = input;
  const kpis = finance?.kpis;

  return [
    {
      label: "Total Pendapatan",
      value: kpis ? compactRupiah(kpis.total_pendapatan) : "—",
      trend: kpis ? `${kpis.capaian_pendapatan_pct.toFixed(1)}% capaian` : undefined,
      trendDir: (kpis?.capaian_pendapatan_pct ?? 0) >= 90 ? "up" : "down",
      icon: CircleDollarSign,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      href: "/finance/revenue",
    },
    {
      label: "Realisasi Belanja",
      value: kpis ? `${kpis.pct_serap.toFixed(1)}%` : "—",
      subValue: kpis
        ? `${compactRupiah(kpis.total_realisasi)} dari ${compactRupiah(kpis.total_pagu)}`
        : undefined,
      progress: kpis?.pct_serap,
      icon: Wallet,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      href: "/finance/expenditure",
    },
    {
      label: "Saldo Kas & Bank",
      value: kpis ? compactRupiah(kpis.saldo_kas_bank) : "—",
      subValue: finance
        ? `Hutang ${compactRupiah(kpis?.total_hutang ?? 0)} · Piutang ${compactRupiah(kpis?.total_piutang ?? 0)}`
        : undefined,
      icon: Banknote,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      href: "/finance/cash-bank",
    },
    {
      label: "Total Pegawai",
      value: hr ? formatHrNumber(hr.total_employees) : "—",
      trend: hr?.attendance_rate_today != null
        ? `Kehadiran hari ini ${hr.attendance_rate_today.toFixed(1)}%`
        : undefined,
      trendDir: (hr?.attendance_rate_today ?? 0) >= 90 ? "up" : "neutral",
      icon: Users,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      href: "/hr",
    },
    {
      label: "Aset BMD Aktif",
      value: supplyChain
        ? supplyChain.financial.item_bmd_aktif.toLocaleString("id-ID")
        : "—",
      trend: supplyChain
        ? `${supplyChain.inventory.stok_kritis} stok kritis`
        : undefined,
      trendDir: (supplyChain?.inventory.stok_kritis ?? 0) > 0 ? "down" : "neutral",
      icon: Building2,
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
      href: "/supply-chain",
    },
    {
      label: "AJU Pengadaan",
      value: procurement ? String(procurement.kpi.aju_antrian) : "—",
      subValue: procurement
        ? `${procurement.kpi.negosiasi_aktif} negosiasi · ${procurement.kpi.po_aktif} PO aktif`
        : undefined,
      icon: ClipboardList,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      href: "/procurement/permintaan",
    },
    {
      label: "Nilai Buku BMD",
      value: supplyChain
        ? formatAssetAmount(supplyChain.financial.nilai_buku_bmd, true)
        : "—",
      trend: supplyChain
        ? `${supplyChain.financial.penyusutan_pct}% tersusut`
        : undefined,
      trendDir: "neutral" as TrendDir,
      icon: CircleDollarSign,
      iconBg: "bg-sky-50",
      iconColor: "text-sky-600",
      href: "/supply-chain/asset-management",
    },
    {
      label: "Nilai Persediaan",
      value: supplyChain
        ? formatAssetAmount(supplyChain.inventory.nilai_persediaan_hpp, true)
        : "—",
      subValue: supplyChain
        ? `${supplyChain.inventory.item_aktif.toLocaleString("id-ID")} item aktif`
        : undefined,
      icon: Building2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-700",
      href: "/supply-chain/gudang-stok",
    },
  ];
}

export function buildBerandaHighlights(input: {
  finance: FinanceReportDashboardData | null;
  revenue: RevenueDashboardData | null;
  hr: HrDashboard | null;
  procurement: ProcurementDashboard | null;
  supplyChain: SupplyChainDashboard | null;
  cashBank: CashBankDashboardData | null;
}): BerandaHighlight[] {
  const highlights: BerandaHighlight[] = [];
  const { finance, revenue, hr, procurement, supplyChain, cashBank } = input;

  if (finance?.kpis) {
    const capaian = finance.kpis.capaian_pendapatan_pct;
    if (capaian >= 100) {
      highlights.push({
        title: "Pendapatan capai target",
        desc: `Realisasi pendapatan ${compactRupiah(finance.kpis.total_pendapatan)} (${capaian.toFixed(1)}% dari rencana).`,
        tone: "emerald",
        href: "/finance/revenue",
      });
    } else if (capaian < 80 && capaian > 0) {
      highlights.push({
        title: "Capaian pendapatan perlu perhatian",
        desc: `Realisasi baru ${capaian.toFixed(1)}% dari rencana. Perlu akselerasi penagihan dan layanan.`,
        tone: "amber",
        href: "/finance/revenue",
      });
    }

    if (finance.kpis.pct_serap >= 90) {
      highlights.push({
        title: "Serapan anggaran tinggi",
        desc: `Realisasi belanja ${finance.kpis.pct_serap.toFixed(1)}% dari pagu ${compactRupiah(finance.kpis.total_pagu)}.`,
        tone: "blue",
        href: "/finance/expenditure",
      });
    }
  }

  if (supplyChain && supplyChain.inventory.stok_kritis > 0) {
    highlights.push({
      title: "Stok kritis di gudang",
      desc: `${supplyChain.inventory.stok_kritis} item di bawah stok minimum (SIMARTDB). Perlu tindakan pengadaan.`,
      tone: "red",
      href: "/supply-chain/batch-expired?tab=stok-minimum",
    });
  }

  if (hr) {
    if (hr.attendance_rate_today != null && hr.attendance_rate_today >= 90) {
      highlights.push({
        title: "Kehadiran pegawai stabil",
        desc: `Tingkat kehadiran hari ini ${hr.attendance_rate_today.toFixed(1)}% dari ${formatHrNumber(hr.total_employees)} pegawai.`,
        tone: "violet",
        href: "/hr/absensi",
      });
    }
    if (hr.pending_leave_requests > 0) {
      highlights.push({
        title: "Cuti menunggu persetujuan",
        desc: `${hr.pending_leave_requests} pengajuan cuti belum diproses.`,
        tone: "amber",
        href: "/hr/cuti",
      });
    }
  }

  if (procurement && procurement.kpi.aju_antrian > 0) {
    highlights.push({
      title: "Antrian pengadaan aktif",
      desc: `${procurement.kpi.aju_antrian} AJU disetujui menunggu proses pengadaan. ${procurement.kpi.belum_tukar_faktur} penerimaan belum tukar faktur.`,
      tone: "blue",
      href: "/procurement/permintaan",
    });
  }

  if (cashBank?.kpis && cashBank.kpis.saldo_netto < 0) {
    highlights.push({
      title: "Arus kas negatif",
      desc: `Saldo netto ${formatDashboardAmount(cashBank.kpis.saldo_netto)} — keluar melebihi masuk pada periode ini.`,
      tone: "red",
      href: "/finance/cash-bank",
    });
  }

  if (revenue?.categories?.length) {
    const under = revenue.categories
      .filter(
        (c) =>
          c.capaian_rencana_pct != null &&
          c.capaian_rencana_pct < 70 &&
          c.realisasi_amount > 0
      )
      .slice(0, 1);
    for (const cat of under) {
      highlights.push({
        title: `Pendapatan ${cat.label} rendah`,
        desc: `Capaian ${cat.capaian_rencana_pct?.toFixed(1)}% — realisasi ${compactRupiah(cat.realisasi_amount)}.`,
        tone: "amber",
        href: "/finance/revenue",
      });
    }
  }

  if (supplyChain?.alerts?.length) {
    const top = supplyChain.alerts[0];
    highlights.push({
      title: top.jenis,
      desc: `${top.deskripsi} (${top.jumlah} item) — prioritas ${top.prioritas}.`,
      tone: top.prioritas === "Tinggi" ? "red" : "blue",
      href: top.href || "/supply-chain/monitoring",
    });
  }

  return highlights.slice(0, 6);
}

export function scaleTrendForChart(values: number[], divisor = 1_000_000_000): number[] {
  if (!values.length) return [];
  const scaled = values.map((v) => v / divisor);
  const max = Math.max(...scaled, 1);
  return scaled.map((v) => Number(((v / max) * 50).toFixed(1)) || 0);
}
