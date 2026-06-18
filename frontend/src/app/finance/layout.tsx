import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { PageContent } from "@/components/layout/PageContent";

export default function FinanceModuleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthenticatedLayout>
      <PageContent>{children}</PageContent>
    </AuthenticatedLayout>
  );
}
