import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { SCORE_SCALES, primaryToSecondary, getGrade } from "@/data/scoreScales";

export default function ScoreCalculator() {
  const [scaleId, setScaleId] = useState<string>(SCORE_SCALES[0].id);
  const [primary, setPrimary] = useState<number>(0);

  const scale = useMemo(() => SCORE_SCALES.find((s) => s.id === scaleId)!, [scaleId]);
  const secondary = primaryToSecondary(scaleId, primary);
  const grade = getGrade(scaleId, secondary);
  const percent = Math.round((primary / scale.maxPrimary) * 100);

  return (
    <div className="min-h-screen bg-background text-white">
      <Seo
        title="Калькулятор баллов ЕГЭ 2025 — перевод первичных в тестовые | учисьпро.рф"
        description="Бесплатный калькулятор баллов ЕГЭ: переводит первичные баллы в тестовые по математике, русскому, физике, информатике и обществознанию. Узнай свой результат за секунду."
        canonical="https://xn--h1agdcde2c.xn--p1ai/score-calculator"
        keywords="калькулятор баллов ЕГЭ, перевод баллов ЕГЭ 2025, первичные баллы, тестовые баллы, шкала ЕГЭ"
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Калькулятор баллов ЕГЭ" },
          ]}
        />

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
        >
          <Icon name="ArrowLeft" size={14} />
          На главную
        </Link>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/15 via-blue-500/8 to-transparent p-6 md:p-8 mb-6">
          <div className="flex items-start gap-4">
            <div className="hidden md:flex w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/30">
              <Icon name="Calculator" size={28} className="text-white" />
            </div>
            <div>
              <h1 className="font-montserrat font-black text-2xl md:text-4xl text-white mb-2 leading-tight">
                Калькулятор баллов ЕГЭ
              </h1>
              <p className="text-white/70 text-sm md:text-base leading-relaxed">
                Узнай, сколько тестовых баллов получишь по своим первичным. Шкалы основаны на
                официальной методике перевода ФИПИ 2024–2025.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-card/40 p-5 md:p-6 mb-5">
          <p className="text-white/70 text-xs font-medium uppercase mb-2 tracking-wide">
            Предмет
          </p>
          <div className="flex flex-wrap gap-2">
            {SCORE_SCALES.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setScaleId(s.id);
                  setPrimary(0);
                }}
                className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                  scaleId === s.id
                    ? "bg-cyan-500/25 text-white border-cyan-500/50"
                    : "bg-white/5 text-white/70 border-white/10 hover:text-white hover:border-white/20"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-card/40 p-5 md:p-6 mb-5">
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-white/70 text-xs font-medium uppercase tracking-wide">
              Первичные баллы
            </p>
            <p className="text-white/50 text-xs">из {scale.maxPrimary}</p>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setPrimary(Math.max(0, primary - 1))}
              disabled={primary === 0}
              aria-label="Уменьшить"
              className="w-10 h-10 rounded-xl bg-white/8 hover:bg-white/12 border border-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <Icon name="Minus" size={16} />
            </button>

            <div className="flex-1 text-center">
              <p className="font-montserrat font-black text-5xl md:text-6xl text-white">
                {primary}
              </p>
            </div>

            <button
              onClick={() => setPrimary(Math.min(scale.maxPrimary, primary + 1))}
              disabled={primary === scale.maxPrimary}
              aria-label="Увеличить"
              className="w-10 h-10 rounded-xl bg-white/8 hover:bg-white/12 border border-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <Icon name="Plus" size={16} />
            </button>
          </div>

          <input
            type="range"
            min={0}
            max={scale.maxPrimary}
            value={primary}
            onChange={(e) => setPrimary(Number(e.target.value))}
            aria-label="Первичный балл"
            className="w-full accent-cyan-500"
          />
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>0</span>
            <span>{Math.round(scale.maxPrimary / 2)}</span>
            <span>{scale.maxPrimary}</span>
          </div>
        </div>

        <div
          className="rounded-3xl border p-6 md:p-8 mb-6"
          style={{
            borderColor: `${grade.color}40`,
            background: `linear-gradient(135deg, ${grade.color}18, transparent)`,
          }}
        >
          <p className="text-white/60 text-xs font-medium uppercase tracking-wide mb-2">
            {scale.id === "math-base" ? "Оценка" : "Тестовый балл"}
          </p>
          <div className="flex items-baseline gap-3 mb-1">
            <p
              className="font-montserrat font-black text-6xl md:text-7xl leading-none"
              style={{ color: grade.color }}
            >
              {secondary}
            </p>
            <p className="text-white/50 text-sm">
              {scale.id === "math-base" ? "(5 макс.)" : "(100 макс.)"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-semibold"
              style={{ background: `${grade.color}25`, color: grade.color }}
            >
              <Icon name="Award" size={14} />
              {grade.grade}
            </span>
            <span className="px-3 py-1 rounded-lg text-sm bg-white/6 text-white/70 border border-white/10">
              Выполнено {percent}% работы
            </span>
          </div>
          <p className="text-white/70 text-sm mt-3 leading-relaxed">{grade.comment}</p>
          <p className="text-white/50 text-xs mt-2">{scale.description}</p>
        </div>

        <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-500/15 to-pink-500/10 p-6 md:p-8 text-center">
          <Icon name="Target" size={28} className="text-purple-300 mx-auto mb-3" />
          <h2 className="font-montserrat font-bold text-xl md:text-2xl text-white mb-2">
            Хочешь увидеть здесь 90+ баллов?
          </h2>
          <p className="text-white/70 text-sm md:text-base mb-5 max-w-2xl mx-auto">
            ИИ-репетитор найдёт слабые места и составит план, чтобы поднять твой балл за
            оставшееся время.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-montserrat font-bold text-sm shadow-lg shadow-purple-500/30 transition-all"
            >
              <Icon name="GraduationCap" size={16} />
              Подобрать курс
            </Link>
            <Link
              to="/exam-bank"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/8 hover:bg-white/12 border border-white/15 text-white font-montserrat font-bold text-sm transition-all"
            >
              <Icon name="Library" size={16} />
              Тренировать задания
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
