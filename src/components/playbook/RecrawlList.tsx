import { useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { COURSES, getCoursePrice } from "@/components/courses/coursesData";
import { courseUrl } from "@/components/courses/courseSlug";
import { RECRAWL_HUBS, RECRAWL_DAILY_LIMIT } from "./webmaster";

const SITE = "https://учисьпро.рф";

interface Item {
  url: string;
  label: string;
  note: string;
}

/**
 * Готовая очередь адресов для «Переобхода страниц» в Вебмастере.
 *
 * Порядок неслучаен: лимит около 20 адресов в сутки, поэтому сначала идут
 * разделы-хабы (с них робот уходит вглубь по ссылкам), затем курсы для
 * взрослых по убыванию цены — они приносят основную выручку, — и лишь потом
 * школьные. Список строится из каталога, поэтому не устаревает.
 */
export default function RecrawlList() {
  const [day, setDay] = useState(0);
  const [copied, setCopied] = useState(false);

  const queue = useMemo<Item[]>(() => {
    const hubs: Item[] = RECRAWL_HUBS.map((h) => ({
      url: SITE + h,
      label: h,
      note: "раздел",
    }));

    const byPrice = (a: (typeof COURSES)[number], b: (typeof COURSES)[number]) =>
      getCoursePrice(b) - getCoursePrice(a);

    const adult: Item[] = COURSES.filter((c) => c.grade === "adult")
      .sort(byPrice)
      .map((c) => ({
        url: SITE + courseUrl(c),
        label: c.title,
        note: getCoursePrice(c) > 0 ? `${getCoursePrice(c).toLocaleString("ru-RU")} ₽` : "бесплатно",
      }));

    const school: Item[] = COURSES.filter((c) => c.grade !== "adult")
      .sort((a, b) => Number(b.isHit) - Number(a.isHit) || byPrice(a, b))
      .map((c) => ({
        url: SITE + courseUrl(c),
        label: c.title,
        note: c.isHit ? "хит" : "курс",
      }));

    return [...hubs, ...adult, ...school];
  }, []);

  const days = Math.ceil(queue.length / RECRAWL_DAILY_LIMIT);
  const chunk = queue.slice(day * RECRAWL_DAILY_LIMIT, (day + 1) * RECRAWL_DAILY_LIMIT);

  const copy = () => {
    const text = chunk.map((i) => i.url).join("\n");
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      },
      () => setCopied(false),
    );
  };

  return (
    <section aria-labelledby="recrawl" className="mb-10">
      <h2 id="recrawl" className="font-montserrat font-black text-xl mb-1">
        Список адресов для переобхода
      </h2>
      <p className="text-white/50 text-sm mb-4 max-w-2xl leading-relaxed">
        {queue.length} адресов, разбитых на {days} дней по {RECRAWL_DAILY_LIMIT} штук — это
        обычный суточный лимит Вебмастера. Порядок важен: сначала разделы, затем курсы для
        взрослых по убыванию цены, потом школьные. Копируйте день целиком и вставляйте в
        поле «Переобход страниц».
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {Array.from({ length: days }, (_, i) => (
          <button
            key={i}
            onClick={() => setDay(i)}
            aria-pressed={day === i}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              day === i
                ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                : "bg-white/[0.05] border border-white/12 text-white/60 hover:text-white hover:border-white/25"
            }`}
          >
            День {i + 1}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/8">
          <p className="text-white/55 text-xs">
            День {day + 1} — {chunk.length} адресов
          </p>
          <button
            onClick={copy}
            className="inline-flex items-center gap-1.5 bg-white/[0.06] border border-white/12 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Icon name={copied ? "Check" : "Copy"} size={13} aria-hidden="true" />
            {copied ? "Скопировано" : "Копировать все"}
          </button>
        </div>

        <ol className="divide-y divide-white/5">
          {chunk.map((item, i) => (
            <li key={item.url} className="flex items-start gap-3 px-4 py-2.5">
              <span className="text-white/25 text-xs tabular-nums mt-0.5 w-6 flex-shrink-0">
                {day * RECRAWL_DAILY_LIMIT + i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-white/85 text-xs font-mono break-all leading-relaxed">
                  {item.url}
                </span>
                <span className="block text-white/40 text-[11px] mt-0.5 truncate">
                  {item.label} · {item.note}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
