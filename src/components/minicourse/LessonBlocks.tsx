import { useState } from "react";
import Icon from "@/components/ui/icon";
import { LessonBlock } from "./types";

function CopyablePrompt({ title, body }: { title?: string; body: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* буфер недоступен — текст всё равно виден и его можно выделить */
    }
  };

  return (
    <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-purple-500/10 border-b border-purple-500/20">
        <span className="flex items-center gap-2 text-purple-200 text-sm font-bold">
          <Icon name="Sparkles" size={15} />
          {title || "Готовый промпт"}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-bold text-white transition-colors"
        >
          <Icon name={copied ? "Check" : "Copy"} size={13} />
          {copied ? "Скопировано" : "Копировать"}
        </button>
      </div>
      <pre className="p-4 text-sm text-white/85 whitespace-pre-wrap font-mono leading-relaxed">
        {body}
      </pre>
    </div>
  );
}

export default function LessonBlocks({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((b, i) => {
        if (b.kind === "text") {
          return (
            <div key={i} className="space-y-3">
              {b.title && (
                <h3 className="font-montserrat font-bold text-white text-lg">{b.title}</h3>
              )}
              {(b.body || "").split("\n\n").map((p, j) => (
                <p key={j} className="text-white/75 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          );
        }

        if (b.kind === "prompt") {
          return <CopyablePrompt key={i} title={b.title} body={b.body || ""} />;
        }

        if (b.kind === "note") {
          return (
            <div key={i} className="rounded-2xl border border-amber-500/25 bg-amber-500/8 p-4">
              {b.title && (
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="Lightbulb" size={16} className="text-amber-400" />
                  <span className="font-bold text-amber-200 text-sm">{b.title}</span>
                </div>
              )}
              {(b.body || "").split("\n").map((line, j) =>
                line.trim() ? (
                  <p key={j} className="text-white/75 text-sm leading-relaxed">
                    {line}
                  </p>
                ) : (
                  <div key={j} className="h-2" />
                ),
              )}
            </div>
          );
        }

        if (b.kind === "money") {
          return (
            <div key={i} className="rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-4">
              {b.title && (
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="Wallet" size={16} className="text-emerald-400" />
                  <span className="font-bold text-emerald-200 text-sm">{b.title}</span>
                </div>
              )}
              <ul className="space-y-2">
                {(b.items || []).map((it, j) => (
                  <li key={j} className="flex gap-2.5 text-sm text-white/80">
                    <Icon name="TrendingUp" size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        if (b.kind === "steps") {
          return (
            <div key={i}>
              {b.title && (
                <h3 className="font-montserrat font-bold text-white text-lg mb-3">{b.title}</h3>
              )}
              <ol className="space-y-2.5">
                {(b.items || []).map((it, j) => (
                  <li key={j} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 text-xs font-black text-white">
                      {j + 1}
                    </span>
                    <span className="text-white/75 text-sm leading-relaxed pt-0.5">{it}</span>
                  </li>
                ))}
              </ol>
            </div>
          );
        }

        if (b.kind === "checklist") {
          return (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              {b.title && (
                <h3 className="font-montserrat font-bold text-white text-base mb-3">{b.title}</h3>
              )}
              <ul className="space-y-2">
                {(b.items || []).map((it, j) => (
                  <li key={j} className="flex gap-2.5 text-sm text-white/75">
                    <Icon name="Check" size={14} className="text-cyan-400 mt-0.5 shrink-0" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}