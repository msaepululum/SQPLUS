import type {
  ReceivablesPayablesNavLabelKey,
  ReceivablesPayablesSectionLabelKey,
} from "./receivables-payables-navigation";

export type ReceivablesPayablesSection = {
  id: string;
  labelKey: ReceivablesPayablesSectionLabelKey;
  description: string;
};

export type ReceivablesPayablesModuleConfig = {
  slug: string;
  labelKey: ReceivablesPayablesNavLabelKey;
  title: string;
  subtitle: string;
  sections: ReceivablesPayablesSection[];
};

export const RECEIVABLES_PAYABLES_MODULES: ReceivablesPayablesModuleConfig[] = [
  {
    slug: "hutang",
    labelKey: "finance.receivablesPayables.hutang",
    title: "Hutang",
    subtitle:
      "Monitoring kewajiban pembayaran — vendor, bekkes/persediaan medis, jasa, dan per kode akun",
    sections: [
      {
        id: "daftar-hutang",
        labelKey: "finance.receivablesPayables.daftarHutang",
        description:
          "Daftar hutang aktif — filter tahun berjalan/sebelumnya dan jenis hutang vendor, bekkes, jasa",
      },
      {
        id: "per-kode-akun",
        labelKey: "finance.receivablesPayables.hutangPerKodeAkun",
        description: "Rekapitulasi hutang per kode rekening / akun kewajiban",
      },
    ],
  },
  {
    slug: "piutang",
    labelKey: "finance.receivablesPayables.piutang",
    title: "Piutang",
    subtitle: "Penagihan piutang BPJS, pasien/tunai, asuransi, dan analisis umur piutang",
    sections: [
      {
        id: "daftar-piutang",
        labelKey: "finance.receivablesPayables.daftarPiutang",
        description:
          "Register piutang per pasien, penjamin, atau tagihan — filter jenis BPJS, tunai, asuransi",
      },
      {
        id: "umur-piutang",
        labelKey: "finance.receivablesPayables.umurPiutang",
        description: "Analisis aging piutang — bucket 0–30, 31–60, 61–90, 91–180, >180 hari",
      },
    ],
  },
  {
    slug: "klaim-jkn",
    labelKey: "finance.receivablesPayables.klaimJkn",
    title: "Klaim JKN",
    subtitle:
      "Data klaim BPJS/JKN dari SIMRS — SEP, tarif grouper, tarif RS, pengajuan, dan status verifikasi",
    sections: [],
  },
  {
    slug: "rekonsiliasi-riwayat",
    labelKey: "finance.receivablesPayables.rekonsiliasiRiwayat",
    title: "Rekonsiliasi & Riwayat",
    subtitle: "Rekonsiliasi hutang dan piutang dengan bukti akuntansi serta jejak audit transaksi",
    sections: [
      {
        id: "rekonsiliasi-hutang",
        labelKey: "finance.receivablesPayables.rekonsiliasiHutang",
        description: "Cocokkan saldo hutang operasional dengan jurnal dan bukti pembayaran",
      },
      {
        id: "rekonsiliasi-piutang",
        labelKey: "finance.receivablesPayables.rekonsiliasiPiutang",
        description: "Cocokkan piutang billing dengan setoran, klaim BPJS, dan jurnal penerimaan",
      },
      {
        id: "riwayat",
        labelKey: "finance.receivablesPayables.riwayatHutangPiutang",
        description: "Riwayat lengkap mutasi hutang dan piutang — filter periode, jenis, dan status",
      },
    ],
  },
];

export const RECEIVABLES_PAYABLES_MODULE_BY_SLUG = Object.fromEntries(
  RECEIVABLES_PAYABLES_MODULES.map((module) => [module.slug, module])
) as Record<string, ReceivablesPayablesModuleConfig>;

/** Redirect slug lama / bookmark ke modul + tab baru */
export const RECEIVABLES_PAYABLES_LEGACY_SLUG_REDIRECT: Record<
  string,
  { slug: string; tab: string; jenis?: string; tahun?: string }
> = {
  "daftar-hutang": { slug: "hutang", tab: "daftar-hutang" },
  "hutang-tahun-sebelumnya": { slug: "hutang", tab: "daftar-hutang", tahun: "sebelumnya" },
  "hutang-tahun-berjalan": { slug: "hutang", tab: "daftar-hutang", tahun: "berjalan" },
  "hutang-per-kode-akun": { slug: "hutang", tab: "per-kode-akun" },
  "hutang-vendor": { slug: "hutang", tab: "daftar-hutang", jenis: "vendor" },
  "hutang-bekkes": { slug: "hutang", tab: "daftar-hutang", jenis: "bekkes" },
  "hutang-persediaan-medis": { slug: "hutang", tab: "daftar-hutang", jenis: "bekkes" },
  "hutang-jasa": { slug: "hutang", tab: "daftar-hutang", jenis: "jasa" },
  "daftar-piutang": { slug: "piutang", tab: "daftar-piutang" },
  "piutang-bpjs": { slug: "piutang", tab: "daftar-piutang", jenis: "bpjs" },
  "piutang-pasien": { slug: "piutang", tab: "daftar-piutang", jenis: "tunai" },
  "piutang-tunai": { slug: "piutang", tab: "daftar-piutang", jenis: "tunai" },
  "piutang-asuransi": { slug: "piutang", tab: "daftar-piutang", jenis: "asuransi" },
  "umur-piutang": { slug: "piutang", tab: "umur-piutang" },
  "rekonsiliasi-hutang": { slug: "rekonsiliasi-riwayat", tab: "rekonsiliasi-hutang" },
  "rekonsiliasi-piutang": { slug: "rekonsiliasi-riwayat", tab: "rekonsiliasi-piutang" },
  "riwayat-hutang-piutang": { slug: "rekonsiliasi-riwayat", tab: "riwayat" },
  "klaim-jkn-bpjs": { slug: "klaim-jkn", tab: "" },
};
