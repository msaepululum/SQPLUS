"use client";

type AiTypingIndicatorProps = {
  visible?: boolean;
};

export function AiTypingIndicator({ visible = true }: AiTypingIndicatorProps) {
  if (!visible) return null;

  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl border border-sq-border bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-bounce rounded-full bg-sq-teal"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
