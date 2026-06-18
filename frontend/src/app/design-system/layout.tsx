import { AppShell } from "@/components/layout/AppShell";
import { PageContent } from "@/components/layout/PageContent";

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <PageContent>{children}</PageContent>
    </AppShell>
  );
}
