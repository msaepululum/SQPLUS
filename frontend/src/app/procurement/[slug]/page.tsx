import { ProcurementModulePage } from "@/components/procurement/ProcurementModulePage";
import { PROCUREMENT_MODULE_BY_SLUG } from "@/constants/procurement-pages";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type ProcurementSubPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export function generateStaticParams() {
  return Object.keys(PROCUREMENT_MODULE_BY_SLUG).map((slug) => ({ slug }));
}

export default async function ProcurementSubPage({
  params,
  searchParams,
}: ProcurementSubPageProps) {
  const { slug } = await params;
  const { tab } = await searchParams;

  const config = PROCUREMENT_MODULE_BY_SLUG[slug];
  if (!config) notFound();

  return (
    <Suspense>
      <ProcurementModulePage config={config} initialTab={tab} />
    </Suspense>
  );
}
