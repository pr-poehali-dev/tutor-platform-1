import { Fragment, ReactNode } from "react";

/** Убирает markdown-разметку из текста, который уходит в озвучку.
 *  Без этого диктор проговаривает «звёздочка звёздочка» и «решётка» вслух. */
export function stripMarkdown(text: string): string {
  return (text || "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*[-*•]\s+/gm, "")
    .replace(/^\s*(\d{1,2})[.)]\s+/gm, "$1. ")
    .trim();
}

/** Разбирает **жирный** внутри строки. Ничего другого не трогаем — ответ ИИ
 *  не должен уметь вставлять произвольную разметку на страницу. */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <strong key={`b${i++}`} className="font-bold text-white">
        {m[1]}
      </strong>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const BULLET = /^\s*[-*•]\s+/;
// Нумерацию храним отдельно: в пошаговом совете «сначала / потом» порядок — часть смысла,
// и превращать шаги в одинаковые точки нельзя.
const NUMBERED = /^\s*(\d{1,2})[.)]\s+/;

/**
 * Читаемый вывод развёрнутого ответа ИИ.
 *
 * Зачем: ответы стали подробными — с абзацами, списками и акцентами. Если печатать
 * их одним сплошным куском, плотный полезный текст выглядит стеной и его не читают.
 * Здесь markdown раскладывается на абзацы и списки, поэтому глубокий ответ
 * воспринимается так же легко, как короткий.
 */
export default function RichText({ text, className = "" }: { text: string; className?: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let list: { text: string; num?: string }[] = [];
  let para: string[] = [];

  const flushList = () => {
    if (list.length === 0) return;
    blocks.push(
      <ul key={`l${blocks.length}`} className="flex flex-col gap-1.5 my-2 pl-1">
        {list.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            {item.num ? (
              <span className="text-purple-300/90 text-xs font-bold tabular-nums mt-[3px] flex-shrink-0">
                {item.num}.
              </span>
            ) : (
              <span className="text-purple-300/80 mt-[7px] h-1.5 w-1.5 rounded-full bg-current flex-shrink-0" />
            )}
            <span>{inline(item.text)}</span>
          </li>
        ))}
      </ul>,
    );
    list = [];
  };

  const flushPara = () => {
    if (para.length === 0) return;
    blocks.push(
      <p key={`p${blocks.length}`} className="mb-2.5 last:mb-0">
        {inline(para.join(" "))}
      </p>,
    );
    para = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    if (BULLET.test(line)) {
      flushPara();
      list.push({ text: line.replace(BULLET, "") });
      continue;
    }
    const numbered = line.match(NUMBERED);
    if (numbered) {
      flushPara();
      list.push({ text: line.replace(NUMBERED, ""), num: numbered[1] });
      continue;
    }
    flushList();
    // Заголовки из markdown показываем обычным абзацем — лишние уровни тут ни к чему.
    para.push(line.replace(/^#{1,6}\s*/, ""));
  }
  flushPara();
  flushList();

  return <div className={className}>{blocks.map((b, i) => <Fragment key={i}>{b}</Fragment>)}</div>;
}