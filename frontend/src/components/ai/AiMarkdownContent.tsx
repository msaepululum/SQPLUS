"use client";

import { cn } from "@/lib/cn";

type AiMarkdownContentProps = {
  content: string;
  className?: string;
};

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-semibold text-sq-navy dark:text-slate-50">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <span key={idx}>{part}</span>;
  });
}

export function AiMarkdownContent({ content, className }: AiMarkdownContentProps) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];

  function flushList() {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={`list-${blocks.length}`} className="ml-1 list-disc space-y-1 pl-4">
        {listItems.map((item, idx) => (
          <li key={idx}>{renderInline(item)}</li>
        ))}
      </ul>
    );
    listItems = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "") {
      flushList();
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushList();
      blocks.push(
        <h4
          key={`h-${blocks.length}`}
          className="mt-2 text-sm font-semibold text-sq-navy first:mt-0 dark:text-slate-50"
        >
          {trimmed.slice(4)}
        </h4>
      );
      continue;
    }

    if (trimmed.startsWith("- ")) {
      listItems.push(trimmed.slice(2));
      continue;
    }

    flushList();
    blocks.push(
      <p key={`p-${blocks.length}`} className="leading-relaxed">
        {renderInline(trimmed)}
      </p>
    );
  }

  flushList();

  return <div className={cn("space-y-2", className)}>{blocks}</div>;
}
