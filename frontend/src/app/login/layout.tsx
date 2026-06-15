import { LoginBranding } from "@/components/auth/LoginBranding";
import { LoginFormCard } from "@/components/auth/LoginFormCard";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-[100dvh] overflow-hidden">{children}</div>
  );
}
