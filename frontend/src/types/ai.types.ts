export type AiMessageRole = "user" | "assistant" | "system";

export type AiToolResult = {
  id?: number;
  tool_name: string;
  output: AiToolOutput;
};

export type AiToolMetric = {
  label: string;
  value: string;
  change?: string | null;
};

export type AiToolOutput = {
  summary?: string;
  metrics?: AiToolMetric[];
  items?: Record<string, string | number>[];
  error?: string;
  message?: string;
};

export type AiToolCall = {
  id: number;
  tool_name: string;
  output: AiToolOutput;
  status: string;
};

export type AiMessage = {
  id: number;
  role: AiMessageRole;
  content: string;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
  tool_calls?: AiToolCall[];
  feedback?: { rating: number; comment?: string | null } | null;
};

export type AiSession = {
  id: number;
  title: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
};

export type AiChatResponse = {
  session: AiSession;
  messages: AiMessage[];
  tool_results: AiToolResult[];
  blocked: boolean;
};

export type AiFeedbackPayload = {
  rating: 1 | -1;
  comment?: string;
};

export type AiSessionListItem = AiSession;

export type PaginatedAiSessions = {
  data: AiSessionListItem[];
  current_page: number;
  last_page: number;
  total: number;
};
