import { ReceivablesPayablesModulePage } from "@/components/finance/receivables-payables/ReceivablesPayablesModulePage";
import {
  RECEIVABLES_PAYABLES_LEGACY_SLUG_REDIRECT,
  RECEIVABLES_PAYABLES_MODULE_BY_SLUG,
} from "@/constants/receivables-payables-pages";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

type ReceivablesPayablesSubPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string; jenis?: string; tahun?: string }>;
};

export function generateStaticParams() {
  return Object.keys(RECEIVABLES_PAYABLES_MODULE_BY_SLUG).map((slug) => ({ slug }));
}

function ReceivablesPayablesModuleContent({
  slug,
  initialTab,
  initialJenis,
  initialTahun,
}: {
  slug: string;
  initialTab?: string;
  initialJenis?: string;
  initialTahun?: string;
}) {
  const config = RECEIVABLES_PAYABLES_MODULE_BY_SLUG[slug];
  if (!config) notFound();
  return (
    <ReceivablesPayablesModulePage
      config={config}
      initialTab={initialTab}
      initialJenis={initialJenis}
      initialTahun={initialTahun}
    />
  );
}

export default async function FinanceReceivablesPayablesSubPage({
  params,
  searchParams,
}: ReceivablesPayablesSubPageProps) {
  const { slug } = await params;
  const { tab, jenis, tahun } = await searchParams;

  const legacy = RECEIVABLES_PAYABLES_LEGACY_SLUG_REDIRECT[slug];
  if (legacy && legacy.slug !== slug) {
    const qs = new URLSearchParams();
    if (legacy.tab) qs.set("tab", legacy.tab);
    if (legacy.jenis) qs.set("jenis", legacy.jenis);
    else if (jenis) qs.set("jenis", jenis);
    if (legacy.tahun) qs.set("tahun", legacy.tahun);
    else if (tahun) qs.set("tahun", tahun);
    const query = qs.toString();
    redirect(`/finance/receivables-payables/${legacy.slug}${query ? `?${query}` : ""}`);
  }

  if (!RECEIVABLES_PAYABLES_MODULE_BY_SLUG[slug]) {
    notFound();
  }

  return (
    <Suspense>
      <ReceivablesPayablesModuleContent
        slug={slug}
        initialTab={tab}
        initialJenis={jenis}
        initialTahun={tahun}
      />
    </Suspense>
  );
}
