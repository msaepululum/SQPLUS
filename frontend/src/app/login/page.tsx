import { LoginBranding } from "@/components/auth/LoginBranding";
import { LoginFormCard } from "@/components/auth/LoginFormCard";

export default function LoginPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col lg:h-full lg:flex-row lg:overflow-hidden">
      <LoginBranding />
      <LoginFormCard />
    </div>
  );
}
