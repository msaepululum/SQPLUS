import { sendChatMessage, submitFeedback } from "@/services/ai.service";
import type { AiMessage, AiToolResult } from "@/types/ai.types";
import { create } from "zustand";

type AiAssistantState = {
  isOpen: boolean;
  sessionId: number | null;
  messages: AiMessage[];
  toolResults: AiToolResult[];
  isTyping: boolean;
  error: string | null;
  open: () => void;
  close: () => void;
  toggle: () => void;
  sendMessage: (message: string) => Promise<void>;
  submitMessageFeedback: (
    messageId: number,
    rating: 1 | -1
  ) => Promise<void>;
  reset: () => void;
};

export const useAiAssistantStore = create<AiAssistantState>((set, get) => ({
  isOpen: false,
  sessionId: null,
  messages: [],
  toolResults: [],
  isTyping: false,
  error: null,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),

  sendMessage: async (message: string) => {
    const trimmed = message.trim();
    if (!trimmed) return;

    set({ isTyping: true, error: null });

    const optimisticUser: AiMessage = {
      id: Date.now(),
      role: "user",
      content: trimmed,
      created_at: new Date().toISOString(),
    };

    set((s) => ({ messages: [...s.messages, optimisticUser] }));

    try {
      const { sessionId } = get();
      const result = await sendChatMessage({
        message: trimmed,
        session_id: sessionId ?? undefined,
      });

      set((s) => {
        const withoutOptimistic = s.messages.filter(
          (m) => m.id !== optimisticUser.id
        );
        return {
          sessionId: result.session.id,
          messages: [...withoutOptimistic, ...result.messages],
          toolResults: result.tool_results,
          isTyping: false,
        };
      });
    } catch (err) {
      set((s) => ({
        messages: s.messages.filter((m) => m.id !== optimisticUser.id),
        isTyping: false,
        error: err instanceof Error ? err.message : "Gagal mengirim pesan",
      }));
    }
  },

  submitMessageFeedback: async (messageId, rating) => {
    await submitFeedback(messageId, { rating });
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId ? { ...m, feedback: { rating } } : m
      ),
    }));
  },

  reset: () =>
    set({
      sessionId: null,
      messages: [],
      toolResults: [],
      isTyping: false,
      error: null,
    }),
}));
