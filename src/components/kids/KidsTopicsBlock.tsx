import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { KIDS_TOPICS } from "./kidsTopicData";

/**
 * Блок «Вопросы родителей» на главной раздела «Малыш».
 *
 * Даёт вход в подробные разборы и одновременно связывает новые страницы
 * с основным разделом — без внутренних ссылок поиск их почти не находит.
 */
export default function KidsTopicsBlock() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-6">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white">
          Вопросы родителей
        </h2>
        <p className="text-white/55 text-sm md:text-base mt-2">
          Разбираем спокойно: что норма, что делать и когда пора к специалисту
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {KIDS_TOPICS.map((t) => (
          <Link
            key={t.slug}
            to={`/kids/vopros/${t.slug}`}
            className="group bg-card border border-white/10 hover:border-pink-400/40 hover:-translate-y-0.5 transition-all rounded-3xl p-5 flex flex-col"
          >
            <span className="text-3xl mb-3">{t.emoji}</span>
            <h3 className="font-bold text-white leading-snug mb-2">{t.h1}</h3>
            <p className="text-white/55 text-sm leading-relaxed line-clamp-3 flex-1">{t.lead}</p>
            <span className="inline-flex items-center gap-1.5 text-pink-300 text-sm font-semibold mt-4">
              Читать разбор
              <Icon
                name="ArrowRight"
                size={15}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
