import { useState } from "react";
import Icon from "@/components/ui/icon";

// Лёгкий рендерер markdown для ответов ассистента:
// заголовки ##/###, списки -/*/1., блоки кода ```, инлайн `code`, **жирный**.

function renderInline(text: string): (string | JSX.Element)[] {
  const parts: (string | JSX.Element)[] = [];
  const regex = /(\*\*(.+?)\*\*|`([^`]+?)`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2] !== undefined) {
      parts.push(<strong key={key++} className="font-bold text-white">{m[2]}</strong>);
    } else if (m[3] !== undefined) {
      parts.push(
        <code key={key++} className="bg-white/10 text-cyan-200 rounded px-1 py-0.5 text-[0.85em] font-mono">
          {m[3]}
        </code>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };
  return (
    <div className="relative my-2 rounded-xl border border-white/10 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-white/[0.03]">
        <span className="text-[11px] text-white/40 font-mono">{lang || "code"}</span>
        <button onClick={copy} className="text-[11px] text-white/50 hover:text-white flex items-center gap-1">
          <Icon name={copied ? "Check" : "Copy"} size={12} /> {copied ? "Скопировано" : "Копировать"}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-[13px] leading-relaxed text-cyan-100 font-mono whitespace-pre">{code}</pre>
    </div>
  );
}

export default function ChatMarkdown({ text }: { text: string }) {
  const blocks: JSX.Element[] = [];
  const lines = text.split("\n");
  let i = 0;
  let key = 0;
  let listBuf: string[] = [];
  let ordered = false;

  const flushList = () => {
    if (listBuf.length === 0) return;
    const items = listBuf.map((li, idx) => (
      <li key={idx} className="text-white/80 text-sm leading-relaxed">{renderInline(li)}</li>
    ));
    blocks.push(
      ordered ? (
        <ol key={key++} className="list-decimal pl-5 space-y-1 my-1.5">{items}</ol>
      ) : (
        <ul key={key++} className="list-disc pl-5 space-y-1 my-1.5">{items}</ul>
      ),
    );
    listBuf = [];
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      flushList();
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      blocks.push(<CodeBlock key={key++} code={codeLines.join("\n")} lang={lang} />);
      continue;
    }

    const h = line.match(/^(#{2,3})\s+(.*)$/);
    if (h) {
      flushList();
      const level = h[1].length;
      blocks.push(
        level === 2 ? (
          <h3 key={key++} className="font-montserrat font-black text-white text-base mt-3 mb-1">{renderInline(h[2])}</h3>
        ) : (
          <h4 key={key++} className="font-bold text-white text-sm mt-2 mb-1">{renderInline(h[2])}</h4>
        ),
      );
      i++;
      continue;
    }

    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (ul || ol) {
      const nowOrdered = !!ol;
      if (listBuf.length && nowOrdered !== ordered) flushList();
      ordered = nowOrdered;
      listBuf.push((ul ? ul[1] : ol![1]));
      i++;
      continue;
    }

    if (line.trim() === "") {
      flushList();
      i++;
      continue;
    }

    flushList();
    blocks.push(
      <p key={key++} className="text-white/80 text-sm leading-relaxed my-1">{renderInline(line)}</p>,
    );
    i++;
  }
  flushList();

  return <div className="space-y-0.5">{blocks}</div>;
}
