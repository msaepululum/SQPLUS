import { cn } from "@/lib/cn";

/** Pembungkus scroll horizontal di sekitar `<table>`. */
export const tableShellClassName =
  "w-full overflow-x-auto rounded-xl border border-sky-100 bg-white shadow-sm ring-1 ring-sky-50 sq-scroll dark:border-slate-800 dark:bg-slate-900 dark:ring-slate-800";

export const tableBaseClassName = "w-full border-collapse text-xs";

/** Kelas untuk elemen `<thead>`. */
export const tableHeadClassName =
  "bg-gradient-to-r from-sky-500 to-sky-400 text-left text-[11px] uppercase tracking-wider text-white shadow-sm dark:from-sky-600 dark:to-sky-500";

/** Kelas untuk `<tr>` header bila styling di baris, bukan di `<thead>`. */
export const tableHeadRowClassName =
  "bg-gradient-to-r from-sky-500 to-sky-400 text-left text-white dark:from-sky-600 dark:to-sky-500";

export const tableHeadCellClassName =
  "whitespace-nowrap px-4 py-3 font-semibold";

export const tableHeadCellCompactClassName = "px-2 py-1.5 font-semibold";

export const tableHeadCellCompactLgClassName = "px-2.5 py-2 font-semibold";

export const tableHeadCellMdClassName = "px-3 py-2 font-semibold";

export const tableBodyClassName =
  "divide-y divide-sky-50/80 dark:divide-slate-800";

/** Zebra striping otomatis untuk baris langsung di dalam `<tbody>`. */
export const tableBodyStripedClassName =
  "[&>tr:nth-child(odd)]:bg-white [&>tr:nth-child(even)]:bg-sky-50/70 [&>tr:hover]:bg-sky-100/60 dark:[&>tr:nth-child(odd)]:bg-slate-900 dark:[&>tr:nth-child(even)]:bg-slate-800/50 dark:[&>tr:hover]:bg-slate-800/70";

export const tableRowClassName =
  "transition-colors hover:bg-sky-100/60 dark:hover:bg-slate-800/70";

export const tableCellClassName =
  "px-4 py-2.5 text-sq-dark dark:text-slate-200";

/** Striping manual saat baris di-render dengan index (map). */
export function tableStripeRowClassName(index: number, className?: string) {
  return cn(
    tableRowClassName,
    index % 2 === 0
      ? "bg-white dark:bg-slate-900"
      : "bg-sky-50/70 dark:bg-slate-800/50",
    className
  );
}

/** Header tabel layout grid (Setup Pagu, Program Kegiatan). */
export const tableGridHeaderClassName =
  "items-center border-b border-sky-400/30 bg-gradient-to-r from-sky-500 to-sky-400 py-3 text-[11px] font-semibold uppercase tracking-wider text-white shadow-sm";

export const tableGridShellClassName =
  "overflow-hidden rounded-xl border border-sky-100 shadow-sm ring-1 ring-sky-50";

export function tableGridRowClassName(stripeIndex: number, className?: string) {
  return cn(
    "border-b border-slate-100/90 transition-colors hover:bg-sky-100/60",
    stripeIndex % 2 === 0 ? "bg-white" : "bg-sky-50/70",
    className
  );
}
