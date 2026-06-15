import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tabs } from "@/components/ui/Tabs";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/Table";
import {
  COLOR_TOKENS,
  LAYOUT_TOKENS,
  TYPOGRAPHY_TOKENS,
} from "@/constants/design-token";
import {
  Bell,
  Boxes,
  Filter,
  Settings,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";

const TABS = [
  { key: "aktif", label: "Tab Aktif" },
  { key: "kedua", label: "Tab Kedua" },
  { key: "ketiga", label: "Tab Ketiga" },
  { key: "keempat", label: "Tab Keempat" },
];

const TABLE_ROWS = [
  { kode: "PR-2025-0487", nama: "Pengadaan BMHP", nilai: "Rp 128 Jt", status: "Pending" as const },
  { kode: "PR-2025-0486", nama: "Servis Genset", nilai: "Rp 45 Jt", status: "Disetujui" as const },
  { kode: "PR-2025-0485", nama: "Logistik Farmasi", nilai: "Rp 210 Jt", status: "Pending" as const },
  { kode: "PR-2025-0484", nama: "Alat Kesehatan", nilai: "Rp 89 Jt", status: "Ditolak" as const },
];

const STATUS_BADGE = {
  Pending: <Badge variant="warning">Pending</Badge>,
  Disetujui: <Badge variant="success">Disetujui</Badge>,
  Ditolak: <Badge variant="danger">Ditolak</Badge>,
};

const ICONS = [
  { icon: Wallet, label: "Keuangan" },
  { icon: Users, label: "Personalia" },
  { icon: ShoppingCart, label: "Pengadaan" },
  { icon: Boxes, label: "Supply Chain" },
  { icon: Bell, label: "Notifikasi" },
  { icon: Settings, label: "Pengaturan" },
];

export default function FoundationPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <PageHeader
        breadcrumbs={[
          { label: "Beranda", href: "/beranda" },
          { label: "Design System" },
          { label: "Foundation" },
        ]}
        title="Design Foundation / Base Layout"
        description="Pondasi UI SQ+ — komponen dasar, tipografi, warna, dan pola layout yang dipakai konsisten di seluruh modul."
        actions={
          <>
            <Button variant="primary">Primary Action</Button>
            <Button variant="secondary">Secondary Action</Button>
            <Button variant="filter" icon={Filter}>
              Filter
            </Button>
            <Button variant="ghost" icon={Settings}>
              Pengaturan
            </Button>
          </>
        }
      />

      {/* Tabs */}
      <Card>
        <Tabs items={TABS} defaultValue="aktif" />
        <div className="pt-4 text-sm text-sq-slate">
          Konten tab aktif ditampilkan di sini. Gunakan komponen{" "}
          <code className="rounded bg-sq-soft px-1.5 py-0.5 text-[11px] text-sq-dark dark:bg-slate-800 dark:text-slate-200">
            Tabs
          </code>{" "}
          untuk navigasi sekunder di dalam halaman.
        </div>
      </Card>

      {/* Empty state */}
      <EmptyState
        title="Konten Belum Tersedia"
        description="Silakan pilih menu atau gunakan filter di atas untuk menampilkan data yang relevan."
        action={<Button variant="secondary">Pelajari Lebih Lanjut</Button>}
      />

      {/* Tipografi & Status badge */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-col items-start sm:flex-col sm:items-start">
            <CardTitle className="text-base">Tipografi</CardTitle>
            <CardDescription>
              Skala font kecil & nyaman dibaca untuk tampilan enterprise.
            </CardDescription>
          </CardHeader>
          <ul className="divide-y divide-sq-border dark:divide-slate-800">
            {TYPOGRAPHY_TOKENS.map((t) => (
              <li
                key={t.name}
                className="flex items-baseline justify-between gap-4 py-2.5"
              >
                <span className={t.className}>{t.sample}</span>
                <span className="shrink-0 text-right text-[11px] text-sq-slate">
                  {t.name} · {t.meta}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader className="flex-col items-start sm:flex-col sm:items-start">
            <CardTitle className="text-base">Status Badge</CardTitle>
            <CardDescription>
              Penanda status standar untuk dokumen & transaksi.
            </CardDescription>
          </CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="draft">Draft</Badge>
          </div>

          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sq-slate">
              Variasi Tombol
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="filter">Filter</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Aturan layout & Warna */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-col items-start sm:flex-col sm:items-start">
            <CardTitle className="text-base">Aturan Layout</CardTitle>
            <CardDescription>Ukuran dasar shell aplikasi.</CardDescription>
          </CardHeader>
          <ul className="divide-y divide-sq-border text-sm dark:divide-slate-800">
            {LAYOUT_TOKENS.map((l) => (
              <li key={l.label} className="flex justify-between gap-4 py-2.5">
                <span className="text-sq-slate">{l.label}</span>
                <code className="rounded bg-sq-soft px-1.5 py-0.5 text-[11px] text-sq-dark dark:bg-slate-800 dark:text-slate-200">
                  {l.value}
                </code>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader className="flex-col items-start sm:flex-col sm:items-start">
            <CardTitle className="text-base">Warna Utama</CardTitle>
            <CardDescription>Palet token <code>sq.*</code>.</CardDescription>
          </CardHeader>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {COLOR_TOKENS.map((c) => (
              <div key={c.token} className="space-y-1.5">
                <div
                  className={`h-12 w-full rounded-lg border border-sq-border dark:border-slate-700 ${c.className}`}
                />
                <p className="text-xs font-medium text-sq-dark dark:text-slate-200">{c.name}</p>
                <p className="text-[11px] text-sq-slate">{c.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card padding={false}>
        <div className="flex items-center justify-between gap-3 p-4 sm:p-5">
          <div>
            <h3 className="text-base font-semibold text-sq-dark dark:text-slate-100">Tabel</h3>
            <p className="text-xs text-sq-slate">
              Header abu, baris hover, teks kecil — konsisten antar modul.
            </p>
          </div>
          <Button variant="filter" icon={Filter}>
            Filter
          </Button>
        </div>
        <Table className="rounded-none border-0">
          <THead>
            <TR>
              <TH>Kode</TH>
              <TH>Nama</TH>
              <TH className="text-right">Nilai</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {TABLE_ROWS.map((row) => (
              <TR key={row.kode}>
                <TD className="font-mono text-[11px]">{row.kode}</TD>
                <TD className="font-medium">{row.nama}</TD>
                <TD className="text-right">{row.nilai}</TD>
                <TD>{STATUS_BADGE[row.status]}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>

      {/* Icon */}
      <Card>
        <CardHeader className="flex-col items-start sm:flex-col sm:items-start">
          <CardTitle className="text-base">Icon</CardTitle>
          <CardDescription>
            Line icon dari Lucide React, ukuran konsisten.
          </CardDescription>
        </CardHeader>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {ICONS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-lg border border-sq-border bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-900"
            >
              <Icon className="h-6 w-6 text-sq-blue dark:text-sky-400" strokeWidth={1.8} />
              <span className="text-[11px] text-sq-slate">{label}</span>
            </div>
          ))}
        </div>
      </Card>

      <p className="pb-2 text-center text-[11px] text-sq-slate">
        SQ+ Design Foundation · Next.js + Tailwind CSS · Inter
      </p>
    </div>
  );
}
