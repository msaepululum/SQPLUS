import { LoginBranding } from "@/components/auth/LoginBranding";
import { LoginFormCard } from "@/components/auth/LoginFormCard";

export default function LoginPage() {
  return (
    <div className="flex h-full overflow-hidden">
      <LoginBranding />
      <LoginFormCard />
    </div>
  );
}
