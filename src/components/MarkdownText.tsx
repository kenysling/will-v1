import React from "react";

interface MarkdownTextProps {
  content: string;
  className?: string;
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-semibold text-[#111827]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export const MarkdownText: React.FC<MarkdownTextProps> = ({ content, className = "" }) => {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (keyPrefix: string) => {
    if (listItems.length > 0) {
      blocks.push(
        <ul key={`${keyPrefix}-list`} className="list-disc pl-5 space-y-1.5 my-2.5 text-[#334155]">
          {listItems.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) {
      flushList(`empty-${index}`);
      return;
    }

    if (line.startsWith("### ")) {
      flushList(`h3-${index}`);
      blocks.push(
        <h4 key={`h3-${index}`} className="font-display text-base font-semibold text-[#111827] mt-4 mb-1.5">
          {renderInline(line.slice(4))}
        </h4>
      );
      return;
    }

    if (line.startsWith("## ")) {
      flushList(`h2-${index}`);
      blocks.push(
        <h3 key={`h2-${index}`} className="font-display text-lg font-semibold text-[#111827] mt-4 mb-2">
          {renderInline(line.slice(3))}
        </h3>
      );
      return;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      listItems.push(line.slice(2));
      return;
    }

    if (/^\d+\.\s+/.test(line)) {
      listItems.push(line.replace(/^\d+\.\s+/, ""));
      return;
    }

    flushList(`p-${index}`);
    blocks.push(
      <p key={`p-${index}`} className="text-[#334155] leading-relaxed my-2">
        {renderInline(line)}
      </p>
    );
  });

  flushList("end");

  return <div className={`text-sm ${className}`}>{blocks}</div>;
};
