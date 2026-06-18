"use client";

import { AiChatBubble } from "@/components/ai/AiChatBubble";
import { AiQuickPrompts } from "@/components/ai/AiQuickPrompts";
import { AiResultCard } from "@/components/ai/AiResultCard";
import { AiTypingIndicator } from "@/components/ai/AiTypingIndicator";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/cn";
import { useAiAssistantStore } from "@/stores/ai-assistant.store";
import { Bot, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function AiAssistantPanel() {
  const {
    isOpen,
    close,
    messages,
    toolResults,
    isTyping,
    error,
    sendMessage,
    submitMessageFeedback,
    reset,
  } = useAiAssistantStore();
  const { t } = useTranslation();

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping, toolResults]);

  async function handleSend(text?: string) {
    const value = (text ?? input).trim();
    if (!value || isTyping) return;
    setInput("");
    await sendMessage(value);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label={t("ai.closePanel")}
          className="fixed inset-0 z-[58] bg-slate-900/20 backdrop-blur-[1px] lg:bg-transparent lg:backdrop-blur-none"
          onClick={close}
        />
      )}

      <aside
        aria-hidden={!isOpen}
        className={cn(
          "fixed bottom-0 right-0 top-0 z-[60] flex w-full max-w-md flex-col border-l border-sq-border bg-sq-bg shadow-2xl transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <header className="flex shrink-0 items-center gap-3 bg-gradient-to-r from-sq-navy to-sq-blue px-4 py-4 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <Bot className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold">{t("ai.title")}</h2>
            <p className="text-xs text-white/75">{t("ai.subtitle")}</p>
          </div>
          <button
            type="button"
            aria-label={t("ai.close")}
            onClick={close}
            className="rounded-lg p-2 hover:bg-white/10"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </header>

        <div ref={scrollRef} className="sq-scroll min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-sq-slate">{t("ai.greeting")}</p>
              <AiQuickPrompts onSelect={(p) => void handleSend(p)} disabled={isTyping} />
            </div>
          )}

          {messages.map((msg, idx) => {
            const isLastAssistant =
              msg.role === "assistant" && idx === messages.length - 1;
            const toolCards =
              msg.tool_calls && msg.tool_calls.length > 0
                ? msg.tool_calls.map((tc) => ({
                    tool_name: tc.tool_name,
                    output: tc.output,
                  }))
                : isLastAssistant
                  ? toolResults
                  : [];

            return (
              <div key={msg.id} className="space-y-2">
                <AiChatBubble
                  message={msg}
                  onFeedback={
                    msg.role === "assistant"
                      ? (id, rating) => void submitMessageFeedback(id, rating)
                      : undefined
                  }
                />
                {toolCards.map((tc) => (
                  <AiResultCard
                    key={`${msg.id}-${tc.tool_name}`}
                    toolName={tc.tool_name}
                    output={tc.output}
                  />
                ))}
              </div>
            );
          })}

          <AiTypingIndicator visible={isTyping} />

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        <footer className="shrink-0 border-t border-sq-border bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          {messages.length > 0 && (
            <div className="mb-3">
              <AiQuickPrompts onSelect={(p) => void handleSend(p)} disabled={isTyping} />
            </div>
          )}
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              placeholder={t("ai.placeholder")}
              disabled={isTyping}
              className="min-h-[44px] flex-1 resize-none rounded-xl border border-sq-border bg-sq-bg px-3 py-2 text-sm text-sq-dark placeholder:text-sq-slate focus:border-sq-blue focus:outline-none focus:ring-2 focus:ring-sq-blue/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <button
              type="button"
              aria-label={t("ai.send")}
              disabled={!input.trim() || isTyping}
              onClick={() => void handleSend()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sq-blue text-white transition-colors hover:bg-sq-navy disabled:opacity-50"
            >
              <Send className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
          <button
            type="button"
            onClick={reset}
            className="mt-2 text-xs text-sq-slate hover:text-sq-navy"
          >
            {t("ai.newConversation")}
          </button>
        </footer>
      </aside>
    </>
  );
}
