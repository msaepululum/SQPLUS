import { HrLayout } from "@/components/hr/HrLayout";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { PageContent } from "@/components/layout/PageContent";

export default function HrModuleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthenticatedLayout>
      <PageContent>
        <HrLayout>{children}</HrLayout>
      </PageContent>
    </AuthenticatedLayout>
  );
}
