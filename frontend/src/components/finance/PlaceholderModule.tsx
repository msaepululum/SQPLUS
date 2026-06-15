import { FinanceTopBar } from "@/components/finance/FinanceTopBar";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";

type PlaceholderModuleProps = {
  title: string;
  subtitle?: string;
};

export function PlaceholderModule({ title, subtitle }: PlaceholderModuleProps) {
  return (
    <>
      <FinanceTopBar title={title} subtitle={subtitle} />
      <div className="p-4 sm:p-6">
        <Card variant="dashed" className="py-12 text-center sm:py-16">
          <CardTitle className="text-base sm:text-lg">Modul {title}</CardTitle>
          <CardDescription className="mt-2">Dalam pengembangan</CardDescription>
        </Card>
      </div>
    </>
  );
}
