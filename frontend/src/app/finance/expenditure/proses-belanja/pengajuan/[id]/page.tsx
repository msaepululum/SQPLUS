import { ExpenditurePengajuanDetailPage } from "@/components/finance/expenditure/ExpenditurePengajuanDetailPage";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function FinanceExpenditurePengajuanDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  return <ExpenditurePengajuanDetailPage id={numericId} />;
}
