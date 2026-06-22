"use client";

import type { ComponentType } from "react";
import { ReportAnggaranTab } from "@/components/finance/reports/tabs/ReportAnggaranTab";
import { ReportOperasionalTab } from "@/components/finance/reports/tabs/ReportOperasionalTab";
import { ReportPosKeuanganTab } from "@/components/finance/reports/tabs/ReportPosKeuanganTab";
import { ReportTransaksiTab } from "@/components/finance/reports/tabs/ReportTransaksiTab";

type ReportTabComponent = ComponentType<Record<string, never>>;

function wrapAnggaran(variant: "pagu-anggaran" | "realisasi-anggaran" | "daya-serap"): ReportTabComponent {
  return function Tab() {
    return <ReportAnggaranTab variant={variant} />;
  };
}

function wrapOperasional(variant: "pendapatan" | "pendapatan-per-akun" | "belanja"): ReportTabComponent {
  return function Tab() {
    return <ReportOperasionalTab variant={variant} />;
  };
}

function wrapPosKeuangan(variant: "kas-bank" | "saldo-bulanan" | "hutang" | "piutang"): ReportTabComponent {
  return function Tab() {
    return <ReportPosKeuanganTab variant={variant} />;
  };
}

function wrapTransaksi(variant: "pembayaran" | "jurnal"): ReportTabComponent {
  return function Tab() {
    return <ReportTransaksiTab variant={variant} />;
  };
}

export const REPORT_TAB_REGISTRY: Record<string, ReportTabComponent> = {
  "pagu-anggaran": wrapAnggaran("pagu-anggaran"),
  "realisasi-anggaran": wrapAnggaran("realisasi-anggaran"),
  "daya-serap": wrapAnggaran("daya-serap"),
  pendapatan: wrapOperasional("pendapatan"),
  "pendapatan-per-akun": wrapOperasional("pendapatan-per-akun"),
  belanja: wrapOperasional("belanja"),
  "kas-bank": wrapPosKeuangan("kas-bank"),
  "saldo-bulanan": wrapPosKeuangan("saldo-bulanan"),
  hutang: wrapPosKeuangan("hutang"),
  piutang: wrapPosKeuangan("piutang"),
  pembayaran: wrapTransaksi("pembayaran"),
  jurnal: wrapTransaksi("jurnal"),
};

export function getReportTabComponent(tabId: string): ReportTabComponent | null {
  return REPORT_TAB_REGISTRY[tabId] ?? null;
}
