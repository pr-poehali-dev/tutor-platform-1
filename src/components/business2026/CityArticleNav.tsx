import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { CITIES } from "./cities";

interface Props {
  /** slug текущей статьи — чтобы не предлагать её же */
  slug: string;
}

/** Блок под статьёй о городе: ведёт в каталог и к соседним городам.
 *  Показывается только на страницах серии «Бизнес 2026». */
export default function CityArticleNav({ slug }: Props) {
  const current = CITIES.find((c) => c.slug === slug);
  if (!current) return null;

  // Предлагаем города с похожей динамикой рынка — они полезнее для сравнения
  const similar = CITIES.filter(
    (c) => c.slug !== slug && c.trend === current.trend,
  ).slice(0, 3);

  const others = CITIES.filter(
    (c) => c.slug !== slug && !similar.includes(c),
  ).slice(0, 3);

  const suggestions = [...similar, ...others].slice(0, 4);

  return (
    <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">
            Ещё 15 городов-миллионников
          </h2>
          <p className="mt-1 text-sm text-white/60">
            Мы разобрали экономику каждого: где рынок растёт, а где сжимается.
          </p>
        </div>
        <Icon
          name="ChartNoAxesCombined"
          size={22}
          className="shrink-0 text-primary"
        />
      </div>

      <div className="mb-5 grid gap-2 sm:grid-cols-2">
        {suggestions.map((c) => (
          <Link
            key={c.slug}
            to={`/feed/${c.slug}`}
            className="group flex items-center justify-between gap-3 rounded-xl border border-white/10
                       bg-white/[0.02] px-4 py-3 transition hover:border-primary/40 hover:bg-white/[0.05]"
          >
            <div className="min-w-0">
              <div className="font-semibold text-white group-hover:text-primary">
                {c.city}
              </div>
              <div className="truncate text-xs text-white/50">{c.essence}</div>
            </div>
            <Icon
              name="ArrowRight"
              size={15}
              className="shrink-0 text-white/40 transition group-hover:translate-x-1 group-hover:text-primary"
            />
          </Link>
        ))}
      </div>

      <Link
        to="/business-2026"
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
      >
        Все 16 городов на одной странице
        <Icon name="ArrowRight" size={15} />
      </Link>
    </section>
  );
}
