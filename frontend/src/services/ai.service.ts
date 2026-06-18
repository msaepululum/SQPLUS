import type {
  AiChatResponse,
  AiFeedbackPayload,
  AiSession,
  PaginatedAiSessions,
} from "@/types/ai.types";
import { apiFetch } from "./api";

export async function sendChatMessage(payload: {
  message: string;
  session_id?: number;
}) {
  const res = await apiFetch<{ data: AiChatResponse }>("/ai/chat", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function getSessions(page = 1) {
  return apiFetch<PaginatedAiSessions>(`/ai/sessions?page=${page}`);
}

export async function getSession(id: number) {
  const res = await apiFetch<{
    data: { session: AiSession; messages: AiChatResponse["messages"] };
  }>(`/ai/sessions/${id}`);
  return res.data;
}

export async function submitFeedback(
  messageId: number,
  payload: AiFeedbackPayload
) {
  const res = await apiFetch<{ data: { rating: number; comment?: string } }>(
    `/ai/messages/${messageId}/feedback`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  return res.data;
}
