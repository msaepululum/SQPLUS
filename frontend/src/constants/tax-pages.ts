import type { TaxNavLabelKey, TaxSectionLabelKey } from "./tax-navigation";

export type TaxSection = {
  id: string;
  labelKey: TaxSectionLabelKey;
  description: string;
};

export type TaxModuleConfig = {
  slug: string;
  labelKey: TaxNavLabelKey;
  title: string;
  subtitle: string;
  sections: TaxSection[];
};

export const TAX_MODULES: TaxModuleConfig[] = [
  {
    slug: "manajemen-pajak",
    labelKey: "finance.tax.manajemenPajak",
    title: "Manajemen Pajak",
    subtitle:
      "Verifikasi, perhitungan PPN/PPh, setoran BKU, dan pajak pengajuan belanja — sumber SIMARTDB & FINANCE",
    sections: [
      {
        id: "antrian-verifikasi",
        labelKey: "finance.tax.antrianVerifikasi",
        description: "Detail tukar faktur menunggu verifikasi pajak (LTAX belum selesai)",
      },
      {
        id: "tagihan-pembelian",
        labelKey: "finance.tax.tagihanPembelian",
        description: "Pajak pada tagihan penerimaan barang (INBELIH) — DPP, PPN, PPh 22/23",
      },
      {
        id: "tukar-faktur",
        labelKey: "finance.tax.tukarFaktur",
        description: "Rekap pajak per nomor tukar faktur (TKRFKTR)",
      },
      {
        id: "detail-perhitungan",
        labelKey: "finance.tax.detailPerhitungan",
        description: "Perhitungan pajak per faktur detail — DPP, PPN, PPh 22, PPh 23, tarif efektif",
      },
      {
        id: "setoran-pajak",
        labelKey: "finance.tax.setoranPajak",
        description: "Setoran pajak tercatat di BKU (PPN/PPh)",
      },
      {
        id: "pajak-pengajuan",
        labelKey: "finance.tax.pajakPengajuan",
        description: "PPN pada pengajuan belanja (FINANCE aju_detail) — perencanaan",
      },
      {
        id: "rekap-bulanan",
        labelKey: "finance.tax.rekapBulanan",
        description: "Rekap bulanan PPN, PPh, dan setoran pajak sepanjang tahun anggaran",
      },
    ],
  },
];

export const TAX_MODULE_BY_SLUG = Object.fromEntries(
  TAX_MODULES.map((module) => [module.slug, module])
) as Record<string, TaxModuleConfig>;

export const TAX_LEGACY_SLUG_REDIRECT: Record<string, { slug: string; tab: string }> = {
  pajak: { slug: "manajemen-pajak", tab: "antrian-verifikasi" },
  verifikasi: { slug: "manajemen-pajak", tab: "antrian-verifikasi" },
  pembelian: { slug: "manajemen-pajak", tab: "tagihan-pembelian" },
  setoran: { slug: "manajemen-pajak", tab: "setoran-pajak" },
  rekap: { slug: "manajemen-pajak", tab: "rekap-bulanan" },
};
