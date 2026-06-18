import type { Messages } from "./messages/id";

export type TranslationKey = {
  [K in keyof Messages]: Messages[K] extends string
    ? K
    : {
        [P in keyof Messages[K]]: Messages[K][P] extends string
          ? `${K & string}.${P & string}`
          : never;
      }[keyof Messages[K]];
}[keyof Messages];

function resolvePath(messages: Messages, key: string): string | undefined {
  const parts = key.split(".");
  let current: unknown = messages;

  for (const part of parts) {
    if (!current || typeof current !== "object" || !(part in current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === "string" ? current : undefined;
}

export function createTranslator(messages: Messages) {
  return function t(key: TranslationKey | string): string {
    return resolvePath(messages, key) ?? key;
  };
}
