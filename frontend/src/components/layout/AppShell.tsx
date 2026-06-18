"use client";

import { AiAssistantButton } from "@/components/ai/AiAssistantButton";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { MobileNavProvider, useMobileNav } from "./MobileNavContext";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useState } from "react";

function AppShellInner({ children }: { children: React.ReactNode }) {
  const { open, close } = useMobileNav();
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-sq-bg dark:bg-slate-950">
      {open && (
        <button
          type="button"
          aria-label={t("appShell.closeOverlay")}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[1px] lg:hidden"
          onClick={close}
        />
      )}

      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar onToggleCollapse={() => setCollapsed((v) => !v)} />
        <main className="sq-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>

      <AiAssistantButton />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <MobileNavProvider>
      <AppShellInner>{children}</AppShellInner>
    </MobileNavProvider>
  );
}
