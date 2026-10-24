import { Fragment, ReactNode } from "react";

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/** Ответ научрука: заголовки, нумерованные и маркированные списки, жирный текст. */
export default function MentorAnswer({ text }: { text: string }) {
  const lines = text.replace(/\r/g, "").split("\n");
  const out: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flush = () => {
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    out.push(
      <Tag
        key={`l${out.length}`}
        className={`${list.ordered ? "list-decimal" : "list-disc"} pl-5 space-y-1.5 my-2 marker:text-violet-300`}
      >
        {list.items.map((it, i) => (
          <li key={i} className="text-white/80 leading-relaxed">{inline(it)}</li>
        ))}
      </Tag>,
    );
    list = null;
  };

  lines.forEach((raw) => {
    const line = raw.trim();
    if (!line) {
      flush();
      return;
    }
    const heading = /^#{1,4}\s+(.*)$/.exec(line);
    const ordered = /^\d+[.)]\s+(.*)$/.exec(line);
    const bullet = /^[-*•]\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      out.push(
        <h4 key={`h${out.length}`} className="font-montserrat font-black text-white text-base mt-4 mb-1.5">
          {inline(heading[1].replace(/\*\*/g, ""))}
        </h4>,
      );
    } else if (ordered || bullet) {
      const isOrdered = !!ordered;
      if (list && list.ordered !== isOrdered) flush();
      if (!list) list = { ordered: isOrdered, items: [] };
      list.items.push((ordered || bullet)![1]);
    } else {
      flush();
      out.push(
        <p key={`p${out.length}`} className="text-white/80 leading-relaxed my-2">{inline(line)}</p>,
      );
    }
  });
  flush();

  return <div className="text-[15px]">{out}</div>;
}
