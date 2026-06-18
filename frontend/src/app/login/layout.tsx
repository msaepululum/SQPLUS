export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] lg:h-[100dvh] lg:overflow-hidden">
      {children}
    </div>
  );
}
