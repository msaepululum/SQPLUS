import { SupplyChainModulePage } from "@/components/supply-chain/SupplyChainModulePage";
import { SUPPLY_CHAIN_MODULE_BY_SLUG } from "@/constants/supply-chain-pages";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type SupplyChainSubPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export function generateStaticParams() {
  return Object.keys(SUPPLY_CHAIN_MODULE_BY_SLUG).map((slug) => ({ slug }));
}

export default async function SupplyChainSubPage({
  params,
  searchParams,
}: SupplyChainSubPageProps) {
  const { slug } = await params;
  const { tab } = await searchParams;

  const config = SUPPLY_CHAIN_MODULE_BY_SLUG[slug];
  if (!config) notFound();

  return (
    <Suspense>
      <SupplyChainModulePage config={config} initialTab={tab} />
    </Suspense>
  );
}
