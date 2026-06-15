import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthenticatedLayout>
      <div className="min-h-full bg-sq-bg">{children}</div>
    </AuthenticatedLayout>
  );
}
