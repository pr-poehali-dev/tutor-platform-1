import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { trackGoal } from "@/components/analytics/YandexMetrika";
import {
  CompetencyScore,
  LEVEL_LABEL,
  Level,
  overallPercent,
  overallProfile,
} from "./leaderTestData";

export const COURSE_URL = "/kurs/rukovoditel-novoy-formacii-mini-mba-dlya-liderov-biznesa-s-98";

const LEVEL_STYLE: Record<Level, { bar: string; badge: string }> = {
  low: { bar: "bg-rose-400", badge: "bg-rose-500/15 text-rose-200 border-rose-400/30" },
  mid: { bar: "bg-amber-400", badge: "bg-amber-500/15 text-amber-200 border-amber-400/30" },
  high: { bar: "bg-emerald-400", badge: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30" },
};

interface Props {
  scores: CompetencyScore[];
  onRestart: () => void;
}

export default function LeaderTestResult({ scores, onRestart }: Props) {
  const total = overallPercent(scores);
  const profile = overallProfile(total);
  const growth = [...scores].sort((a, b) => a.percent - b.percent).slice(0, 2);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-emerald-400/25 bg-gradient-to-br from-emerald-500/15 to-teal-600/10 p-6 md:p-8">
        <p className="text-emerald-200/80 text-xs uppercase tracking-widest font-bold mb-2">Ваш результат</p>
        <div className="flex flex-wrap items-end gap-x-5 gap-y-2 mb-3">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white">{profile.title}</h2>
          <span className="font-montserrat font-black text-4xl text-emerald-300">{total}%</span>
        </div>
        <p className="text-white/75 leading-relaxed max-w-2xl">{profile.text}</p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <h3 className="font-montserrat font-black text-lg text-white mb-5">Профиль по пяти компетенциям</h3>
        <div className="space-y-5">
          {scores.map((s) => (
            <div key={s.competency.id}>
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="flex items-center gap-2 text-white font-semibold text-sm md:text-base">
                  <Icon name={s.competency.icon} size={18} className="text-emerald-300" />
                  {s.competency.title}
                </span>
                <span className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${LEVEL_STYLE[s.level].badge}`}>
                    {LEVEL_LABEL[s.level]}
                  </span>
                  <span className="text-white font-bold text-sm w-10 text-right">{s.percent}%</span>
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                <div className={`h-full rounded-full ${LEVEL_STYLE[s.level].bar}`} style={{ width: `${Math.max(s.percent, 3)}%` }} />
              </div>
              <p className="text-white/60 text-sm mt-2 leading-relaxed">{s.competency[s.level]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <h3 className="font-montserrat font-black text-lg text-white mb-2">С чего начать</h3>
        <p className="text-white/60 text-sm mb-4">Две компетенции с наибольшим потенциалом роста и модули курса, которые закрывают их в первую очередь:</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {growth.map((s) => (
            <div key={s.competency.id} className="rounded-2xl bg-white/[0.04] border border-white/10 p-4">
              <p className="flex items-center gap-2 text-white font-bold mb-2">
                <Icon name={s.competency.icon} size={17} className="text-emerald-300" />
                {s.competency.title} · {s.percent}%
              </p>
              <ul className="space-y-1">
                {s.competency.modules.map((m) => (
                  <li key={m} className="flex gap-2 text-white/70 text-sm">
                    <Icon name="Check" size={15} className="text-emerald-300 flex-shrink-0 mt-0.5" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl overflow-hidden border border-white/10 bg-card">
        <img
          src="/covers/rukovoditel-novoy-formacii.jpg"
          alt="Курс «Руководитель новой формации»"
          className="w-full aspect-[16/6] object-cover"
          loading="lazy"
        />
        <div className="p-6 md:p-8">
          <p className="text-emerald-300 text-xs uppercase tracking-widest font-bold mb-2">Курс УЧИСЬПРО</p>
          <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-2">
            Руководитель новой формации: мини-MBA для лидеров бизнеса с ИИ
          </h3>
          <p className="text-white/65 mb-5 max-w-2xl">
            8 модулей и 48 уроков по всем пяти компетенциям, практика на задачах вашего бизнеса и ИИ-наставник 24/7.
            Первый урок бесплатно, полный курс — 5 990 ₽, доступ навсегда.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to={COURSE_URL}
              onClick={() => trackGoal("leader_test_course_click", { total })}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white font-bold px-5 py-3"
            >
              Смотреть программу курса <Icon name="ArrowRight" size={18} />
            </Link>
            <button
              onClick={onRestart}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 hover:bg-white/5 text-white font-semibold px-5 py-3"
            >
              <Icon name="RotateCcw" size={17} /> Пройти заново
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
