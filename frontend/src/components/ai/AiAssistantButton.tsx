"use client";

import { AiAssistantPanel } from "@/components/ai/AiAssistantPanel";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { useAiAssistantStore } from "@/stores/ai-assistant.store";
import { Bot } from "lucide-react";

export function AiAssistantButton() {
  const { isOpen, toggle } = useAiAssistantStore();
  const { t } = useTranslation();

  return (
    <>
      <button
        type="button"
        aria-label={t("ai.openAssistant")}
        aria-expanded={isOpen}
        onClick={toggle}
        className="fixed bottom-6 right-6 z-[55] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sq-navy to-sq-blue text-white shadow-[0_4px_16px_rgba(11,29,93,0.35)] transition-transform hover:scale-105 active:scale-95"
      >
        <Bot className="h-6 w-6" strokeWidth={2} />
      </button>
      <AiAssistantPanel />
    </>
  );
}
