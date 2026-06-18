import { PageFrame } from "@/components/layout/PageFrame";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";

type PlaceholderModuleProps = {
  title: string;
  subtitle?: string;
};

export function PlaceholderModule({ title, subtitle }: PlaceholderModuleProps) {
  return (
    <PageFrame title={title} description={subtitle}>
      <Card variant="dashed" className="mt-3 py-10 text-center sm:py-12">
        <CardTitle className="text-base sm:text-lg">Modul {title}</CardTitle>
        <CardDescription className="mt-2">Dalam pengembangan</CardDescription>
      </Card>
    </PageFrame>
  );
}
