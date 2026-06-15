/**
 * Design tokens SQ+ — sumber acuan untuk preview design system.
 * Warna sebenarnya didefinisikan sebagai utilitas Tailwind via `@theme`
 * di `globals.css` (Tailwind v4), sehingga bisa dipakai sebagai
 * `bg-sq-navy`, `text-sq-blue`, `border-sq-border`, dll.
 */

export type ColorToken = {
  name: string;
  token: string;
  value: string;
  className: string;
};

export const COLOR_TOKENS: ColorToken[] = [
  { name: "Navy", token: "sq.navy", value: "#0B1D5D", className: "bg-sq-navy" },
  { name: "Dark", token: "sq.dark", value: "#071A3D", className: "bg-sq-dark" },
  { name: "Blue", token: "sq.blue", value: "#2563EB", className: "bg-sq-blue" },
  { name: "Teal", token: "sq.teal", value: "#10B9A6", className: "bg-sq-teal" },
  { name: "Slate", token: "sq.slate", value: "#64748B", className: "bg-sq-slate" },
  { name: "Background", token: "sq.bg", value: "#F8FAFC", className: "bg-sq-bg" },
  { name: "Border", token: "sq.border", value: "#E5E7EB", className: "bg-sq-border" },
  { name: "Soft", token: "sq.soft", value: "#EEF2F7", className: "bg-sq-soft" },
];

export type TypographyToken = {
  name: string;
  sample: string;
  meta: string;
  className: string;
};

export const TYPOGRAPHY_TOKENS: TypographyToken[] = [
  { name: "H1", sample: "Heading Satu", meta: "24px / Bold", className: "text-2xl font-bold" },
  { name: "H2", sample: "Heading Dua", meta: "20px / Semibold", className: "text-xl font-semibold" },
  { name: "H3", sample: "Heading Tiga", meta: "16px / Semibold", className: "text-base font-semibold" },
  { name: "Body", sample: "Teks isi standar untuk paragraf.", meta: "14px / Normal", className: "text-sm" },
  { name: "Body Small", sample: "Teks kecil pendukung.", meta: "12px / Normal", className: "text-xs" },
  { name: "Caption", sample: "Keterangan / label kecil.", meta: "11px / Normal", className: "text-[11px]" },
  { name: "Button", sample: "LABEL TOMBOL", meta: "12px / Semibold", className: "text-xs font-semibold" },
];

export const LAYOUT_TOKENS = [
  { label: "Sidebar (expanded)", value: "w-[240px]" },
  { label: "Sidebar (collapsed)", value: "ikon saja (72px)" },
  { label: "Topbar", value: "h-[60px]" },
  { label: "Padding konten", value: "p-6" },
  { label: "Background halaman", value: "bg-sq-bg" },
  { label: "Card", value: "rounded-xl border border-sq-border shadow-sm" },
];
