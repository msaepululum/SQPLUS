import { cn } from "@/lib/cn";
import {
  tableBaseClassName,
  tableBodyClassName,
  tableBodyStripedClassName,
  tableCellClassName,
  tableHeadCellClassName,
  tableHeadClassName,
  tableRowClassName,
  tableShellClassName,
} from "@/components/ui/tableStyles";

export {
  tableBodyStripedClassName,
  tableGridHeaderClassName,
  tableGridRowClassName,
  tableGridShellClassName,
  tableHeadCellCompactClassName,
  tableHeadCellCompactLgClassName,
  tableHeadCellMdClassName,
  tableHeadRowClassName,
  tableShellClassName,
  tableStripeRowClassName,
} from "@/components/ui/tableStyles";

export function Table({
  className,
  children,
  embedded = false,
}: {
  className?: string;
  children: React.ReactNode;
  embedded?: boolean;
}) {
  const table = (
    <table className={cn(tableBaseClassName, "min-w-[36rem]", className)}>{children}</table>
  );

  if (embedded) {
    return <div className="w-full overflow-x-auto sq-scroll">{table}</div>;
  }

  return <div className={tableShellClassName}>{table}</div>;
}

export function THead({ children }: { children: React.ReactNode }) {
  return <thead className={tableHeadClassName}>{children}</thead>;
}

export function TBody({
  children,
  striped = true,
}: {
  children: React.ReactNode;
  striped?: boolean;
}) {
  return (
    <tbody className={cn(tableBodyClassName, striped && tableBodyStripedClassName)}>
      {children}
    </tbody>
  );
}

export function TR({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <tr className={cn(tableRowClassName, className)}>{children}</tr>;
}

export function TH({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <th className={cn(tableHeadCellClassName, className)}>{children}</th>;
}

export function TD({
  className,
  children,
  colSpan,
}: {
  className?: string;
  children: React.ReactNode;
  colSpan?: number;
}) {
  return (
    <td className={cn(tableCellClassName, className)} colSpan={colSpan}>
      {children}
    </td>
  );
}
