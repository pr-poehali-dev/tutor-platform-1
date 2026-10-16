import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import type { RatedSchool } from "./schools";

interface Props {
  school: RatedSchool;
  place: number;
}

export default function SchoolCard({ school: s, place }: Props) {
  return (
    <article
      id={s.slug}
      className={`scroll-mt-6 rounded-3xl border p-5 sm:p-6 ${s.own ? "border-primary/40 bg-primary/[0.08]" : "border-white/10 bg-white/[0.04]"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-lg font-bold">{place}</span>
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">{s.name}</h2>
            <p className="text-sm text-white/50">{s.segment} · {s.audience}</p>
          </div>
        </div>
        <div className="text-right text-sm">
          {s.revenue ? (
            <>
              <p className="font-semibold">{s.revenue}</p>
              <p className="text-emerald-300">{s.growth} за год</p>
            </>
          ) : (
            <p className="rounded-full border border-primary/30 px-3 py-1 text-xs text-primary">Наша платформа</p>
          )}
        </div>
      </div>

      <p className="mt-4 text-white/75">{s.summary}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-emerald-500/[0.07] p-4">
          <p className="mb-2 flex items-center gap-2 font-semibold text-emerald-300">
            <Icon name="ThumbsUp" size={16} />
            Плюсы
          </p>
          <ul className="space-y-2 text-sm text-white/80">
            {s.pros.map((p) => (
              <li key={p} className="flex gap-2">
                <Icon name="Plus" size={16} className="mt-0.5 shrink-0 text-emerald-300" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-rose-500/[0.07] p-4">
          <p className="mb-2 flex items-center gap-2 font-semibold text-rose-300">
            <Icon name="ThumbsDown" size={16} />
            Минусы
          </p>
          <ul className="space-y-2 text-sm text-white/80">
            {s.cons.map((c) => (
              <li key={c} className="flex gap-2">
                <Icon name="Minus" size={16} className="mt-0.5 shrink-0 text-rose-300" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/70">
          <span className="font-semibold text-white">Кому подойдёт:</span> {s.bestFor.charAt(0).toLowerCase() + s.bestFor.slice(1)}
        </p>
        {s.own ? (
          <Link to={s.url} className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            Тарифы УЧИСЬПРО
            <Icon name="ArrowRight" size={15} />
          </Link>
        ) : (
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex items-center gap-1 text-sm text-white/60 hover:text-white"
          >
            Сайт школы
            <Icon name="ExternalLink" size={14} />
          </a>
        )}
      </div>
    </article>
  );
}
