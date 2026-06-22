"use client";

import { Loader2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";

type ReportDataShellProps = {
  loading: boolean;
  error: string | null;
  empty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
  className?: string;
};

export function ReportDataShell({
  loading,
  error,
  empty,
  emptyMessage = "Tidak ada data untuk periode ini.",
  children,
  className,
}: ReportDataShellProps) {
  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-16", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700", className)}>
        {error}
      </div>
    );
  }

  if (empty) {
    return <EmptyState title={emptyMessage} className={className} />;
  }

  return <>{children}</>;
}
