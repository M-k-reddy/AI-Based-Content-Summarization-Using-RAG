import React from "react";

interface FormattedMessageProps {
  content: string;
  isUser?: boolean;
}

export function FormattedMessage({ content, isUser = false }: FormattedMessageProps) {
  if (isUser) {
    return <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>;
  }

  // Helper to parse inline styles: bold, inline code, and clean up math delimiters
  const parseInline = (text: string): React.ReactNode[] => {
    // Clean any LaTeX \( ... \) or \[ ... \]
    let clean = text.replace(/\\\(|\\\)|\\\[|\\\]/g, "");
    // Clean non-breaking hyphens and special dashes
    clean = clean.replace(/[\u2010\u2011\u2012\u2013\u2014]/g, "-").replace(/\u00a0/g, " ");

    // Tokenize bold (**...**) and inline code (`...`)
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    const tokens = clean.split(regex);

    tokens.forEach((token, idx) => {
      if (!token) return;
      if (token.startsWith("**") && token.endsWith("**") && token.length >= 4) {
        parts.push(
          <strong key={idx} className="font-semibold text-foreground">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith("`") && token.endsWith("`") && token.length >= 2) {
        parts.push(
          <code
            key={idx}
            className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs text-primary"
          >
            {token.slice(1, -1)}
          </code>
        );
      } else {
        parts.push(token);
      }
    });

    return parts;
  };

  // Split lines and group into blocks (paragraphs, lists, code blocks, tables, headings)
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const elements: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // 1. Code blocks: ```
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <div key={`code-${i}`} className="my-3 rounded-lg overflow-hidden border border-border/50 bg-black/40">
          {lang && (
            <div className="px-3 py-1 bg-muted/30 text-xs font-mono text-muted-foreground border-b border-border/30">
              {lang}
            </div>
          )}
          <pre className="p-3 text-xs font-mono overflow-x-auto text-emerald-400">
            <code>{codeLines.join("\n")}</code>
          </pre>
        </div>
      );
      continue;
    }

    // 2. Headings: ###, ##, #
    if (line.trim().startsWith("### ")) {
      elements.push(
        <h4 key={`h4-${i}`} className="text-sm font-bold text-foreground mt-4 mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          {parseInline(line.trim().slice(4))}
        </h4>
      );
      i++;
      continue;
    }
    if (line.trim().startsWith("## ")) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-base font-bold text-foreground mt-4 mb-2">
          {parseInline(line.trim().slice(3))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.trim().startsWith("# ")) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-lg font-bold text-foreground mt-4 mb-2">
          {parseInline(line.trim().slice(2))}
        </h2>
      );
      i++;
      continue;
    }

    // 3. Tables: lines starting and ending with |
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }
      const isSeparator = (l: string) => /^\|[\s\-:|]+\|$/.test(l.trim());
      const dataRows = tableLines.filter((l) => !isSeparator(l));

      if (dataRows.length > 0) {
        const headerCells = dataRows[0]
          .split("|")
          .slice(1, -1)
          .map((c) => c.trim());
        const bodyLines = dataRows.slice(1);

        elements.push(
          <div key={`table-${i}`} className="my-3 overflow-x-auto rounded-lg border border-border/40">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-muted/50 border-b border-border/40 text-foreground font-semibold">
                <tr>
                  {headerCells.map((h, idx) => (
                    <th key={idx} className="px-3 py-2">
                      {parseInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {bodyLines.map((rowLine, rowIdx) => {
                  const cells = rowLine
                    .split("|")
                    .slice(1, -1)
                    .map((c) => c.trim());
                  return (
                    <tr key={rowIdx} className="hover:bg-muted/20">
                      {cells.map((cell, cellIdx) => (
                        <td key={cellIdx} className="px-3 py-2 text-muted-foreground">
                          {parseInline(cell)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 4. Bullet lists: - or *
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const bulletText = line.trim().slice(2);
      elements.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2 my-1 text-sm text-foreground/90 pl-1">
          <span className="text-primary font-bold leading-tight mt-1 text-xs">•</span>
          <span className="leading-relaxed flex-1">{parseInline(bulletText)}</span>
        </div>
      );
      i++;
      continue;
    }

    // 5. Numbered lists: 1. , 2. 
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      elements.push(
        <div key={`num-${i}`} className="flex items-start gap-2 my-1 text-sm text-foreground/90 pl-1">
          <span className="text-primary font-semibold text-xs mt-0.5 min-w-[1.2rem]">{numMatch[1]}.</span>
          <span className="leading-relaxed flex-1">{parseInline(numMatch[2])}</span>
        </div>
      );
      i++;
      continue;
    }

    // 6. Empty line
    if (!line.trim()) {
      elements.push(<div key={`empty-${i}`} className="h-2" />);
      i++;
      continue;
    }

    // 7. Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="text-sm leading-relaxed text-foreground/90 my-1">
        {parseInline(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-1">{elements}</div>;
}
