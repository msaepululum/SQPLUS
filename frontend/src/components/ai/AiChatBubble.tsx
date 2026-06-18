"use client";

import { useTranslation } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/cn";
import type { AiMessage } from "@/types/ai.types";

type AiChatBubbleProps = {
  message: AiMessage;
  onFeedback?: (messageId: number, rating: 1 | -1) => void;
  children?: React.ReactNode;
};

export function AiChatBubble({ message, onFeedback, children }: AiChatBubbleProps) {
  const { t } = useTranslation();
  const isUser = message.role === "user";

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-sq-blue text-white"
            : "border border-sq-border bg-white text-sq-dark shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {children}
        {!isUser && onFeedback && (
          <div className="mt-2 flex gap-1 border-t border-sq-border/60 pt-2 dark:border-slate-600">
            <button
              type="button"
              aria-label={t("ai.positiveFeedback")}
              onClick={() => onFeedback(message.id, 1)}
              className={cn(
                "rounded-lg px-2 py-1 text-xs transition-colors",
                message.feedback?.rating === 1
                  ? "bg-sq-teal/15 text-sq-teal"
                  : "text-sq-slate hover:bg-sq-soft"
              )}
            >
              👍
            </button>
            <button
              type="button"
              aria-label={t("ai.negativeFeedback")}
              onClick={() => onFeedback(message.id, -1)}
              className={cn(
                "rounded-lg px-2 py-1 text-xs transition-colors",
                message.feedback?.rating === -1
                  ? "bg-red-50 text-red-600"
                  : "text-sq-slate hover:bg-sq-soft"
              )}
            >
              👎
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
