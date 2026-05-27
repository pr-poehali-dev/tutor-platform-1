import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import QuestionCard from "@/components/knowYourself/QuestionCard";
import { QUESTIONS, TEST_BLOCKS } from "@/components/knowYourself/questions";
import { loadAnswers, saveAnswers, clearAnswers } from "@/components/knowYourself/scoring";
import { Answer, TestBlockCode } from "@/components/knowYourself/types";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

type Mode = "intro" | "test" | "review";

export default function KnowYourself() {
  const [mode, setMode] = useState<Mode>("intro");
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = loadAnswers();
    if (saved && Object.keys(saved).length > 0) {
      setAnswers(saved);
    }
  }, []);

  const blockOfStep = QUESTIONS[step]?.block as TestBlockCode | undefined;
  const blockInfo = blockOfStep ? TEST_BLOCKS.find((b) => b.code === blockOfStep) : undefined;

  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / QUESTIONS.length) * 100);

  const blockProgress = useMemo(() => {
    return TEST_BLOCKS.map((b) => {
      const inBlock = QUESTIONS.filter((q) => q.block === b.code);
      const done = inBlock.filter((q) => answers[q.id] !== undefined).length;
      return { ...b, done, totalInBlock: inBlock.length };
    });
  }, [answers]);

  const handleAnswer = (a: Answer) => {
    const q = QUESTIONS[step];
    const next = { ...answers, [q.id]: a };
    setAnswers(next);
    saveAnswers(next);
    // Автопереход на следующий вопрос с задержкой
    setTimeout(() => {
      if (step < QUESTIONS.length - 1) {
        setStep(step + 1);
      } else {
        setMode("review");
      }
    }, 220);
  };

  const handleStart = () => {
    // Если уже сохранены ответы — начнём с первого неотвеченного
    const firstUnanswered = QUESTIONS.findIndex((q) => answers[q.id] === undefined);
    setStep(firstUnanswered === -1 ? 0 : firstUnanswered);
    setMode("test");
  };

  const handleReset = () => {
    if (!confirm("Сбросить все ответы и начать тест заново?")) return;
    clearAnswers();
    setAnswers({});
    setStep(0);
    setMode("intro");
  };

  const handleFinish = () => {
    saveAnswers(answers);
    navigate("/know-yourself/result");
  };

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: "Познай себя — профориентационный тест УЧИСЬПРО",
      about: "Профориентация, выбор профессии и вуза",
      educationalUse: "assessment",
      inLanguage: "ru",
      provider: { "@type": "Organization", name: "УЧИСЬПРО" },
      hasPart: TEST_BLOCKS.map((b) => ({
        "@type": "Question",
        name: b.title,
        text: b.description,
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Познай себя — профориентационный тест: выбор профессии и вуза | УЧИСЬПРО"
        description="Подробный тест на 60+ вопросов: определит твой тип личности по Холланду (RIASEC), сильные стороны и ценности. Подберёт топ-10 профессий и конкретные вузы из 100 в базе УЧИСЬПРО."
        canonical={`${SITE_URL}/know-yourself`}
        keywords="профориентационный тест, тест на профессию, тест Холланда, RIASEC, какую профессию выбрать, какой вуз выбрать, тест для 11 класса"
        jsonLd={jsonLd}
      />

      {/* Top bar */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-lg">🪞</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Познай себя" }]} />
          </div>
          {mode === "test" && (
            <button
              onClick={() => setMode("intro")}
              className="hidden md:inline-flex items-center gap-1.5 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <Icon name="LayoutGrid" size={14} />
              К обзору блоков
            </button>
          )}
        </div>
      </div>

      <div className="md:hidden max-w-7xl mx-auto px-4 pt-3">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Познай себя" }]} />
      </div>

      <main className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 pt-6 pb-16">

        {/* ─── ИНТРО ─────────────────────────────────────────────────────── */}
        {mode === "intro" && (
          <>
            <section className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-full px-4 py-1.5 mb-5">
                <span className="text-base">🪞</span>
                <span className="text-sm text-cyan-200 font-bold uppercase tracking-wider">Профориентация</span>
              </div>
              <h1 className="font-montserrat font-black text-3xl md:text-5xl lg:text-6xl text-white mb-4 leading-[1.05]">
                Познай себя —{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">найди свою профессию</span>
              </h1>
              <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto mb-3 leading-relaxed">
                Подробный тест на основе модели Холланда (RIASEC) и анализа способностей. Покажет тип твоей личности, сильные стороны, ценности — и подберёт топ-10 профессий и конкретные вузы.
              </p>
              <p className="text-white/45 text-xs md:text-sm">
                61 вопрос · 6 блоков · 12–15 минут · Ответы сохраняются автоматически
              </p>
            </section>

            {/* Возобновление */}
            {answeredCount > 0 && answeredCount < QUESTIONS.length && (
              <div className="bg-amber-500/15 border border-amber-500/35 rounded-2xl p-4 mb-6 flex items-center gap-3 flex-wrap">
                <Icon name="History" size={20} className="text-amber-300 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">Найдены сохранённые ответы</p>
                  <p className="text-white/65 text-xs">Отвечено {answeredCount} из {QUESTIONS.length} вопросов. Можно продолжить.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleStart} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl">
                    <Icon name="Play" size={12} className="inline mr-1" />
                    Продолжить
                  </button>
                  <button onClick={handleReset} className="bg-white/8 hover:bg-white/12 text-white/65 font-bold text-xs px-3 py-2 rounded-xl">
                    Сбросить
                  </button>
                </div>
              </div>
            )}

            {answeredCount === QUESTIONS.length && (
              <div className="bg-emerald-500/15 border border-emerald-500/35 rounded-2xl p-4 mb-6 flex items-center gap-3 flex-wrap">
                <Icon name="CheckCircle2" size={22} className="text-emerald-300 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">Тест пройден полностью</p>
                  <p className="text-white/65 text-xs">Открой результаты или пройди заново.</p>
                </div>
                <div className="flex gap-2">
                  <Link to="/know-yourself/result" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl">
                    <Icon name="Sparkles" size={12} className="inline mr-1" />
                    Открыть результат
                  </Link>
                  <button onClick={handleReset} className="bg-white/8 hover:bg-white/12 text-white/65 font-bold text-xs px-3 py-2 rounded-xl">
                    Пройти заново
                  </button>
                </div>
              </div>
            )}

            {/* Блоки теста */}
            <section className="bg-card border border-white/10 rounded-3xl p-5 md:p-6 mb-6">
              <h2 className="font-montserrat font-black text-white text-xl md:text-2xl mb-4">
                6 блоков · 61 вопрос
              </h2>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {blockProgress.map((b) => {
                  const done = b.done === b.totalInBlock && b.totalInBlock > 0;
                  return (
                    <div key={b.code} className={`bg-white/[0.03] border ${done ? "border-emerald-500/35" : "border-white/10"} rounded-2xl p-3 md:p-4`}>
                      <div className="flex items-start gap-2.5">
                        <div className="text-3xl">{b.emoji}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                            <p className="font-montserrat font-black text-white text-sm">{b.title}</p>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${done ? "bg-emerald-500/25 text-emerald-200" : "bg-white/5 text-white/55"}`}>
                              {done && <Icon name="Check" size={9} />}
                              {b.done}/{b.totalInBlock}
                            </span>
                          </div>
                          <p className="text-white/60 text-[11px] leading-snug">{b.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Что получишь */}
            <section className="bg-gradient-to-br from-cyan-500/12 to-blue-500/12 border border-cyan-500/30 rounded-3xl p-5 md:p-6 mb-6">
              <h2 className="font-montserrat font-black text-white text-xl md:text-2xl mb-4">
                Что ты получишь в результате
              </h2>
              <div className="grid md:grid-cols-2 gap-2.5">
                {[
                  { icon: "User", title: "Тип личности по Холланду", desc: "6 типов: реалист, исследователь, художник, социальный, предприниматель, организатор." },
                  { icon: "Zap", title: "Карта сильных сторон", desc: "Аналитика, креатив, общение, лидерство — где у тебя реальные преимущества." },
                  { icon: "Compass", title: "Карта ценностей", desc: "Стабильность vs свобода, доход vs служение, наука vs творчество." },
                  { icon: "Trophy", title: "Топ-10 профессий", desc: "С зарплатами, прогнозом спроса и описанием рабочего дня." },
                  { icon: "Building2", title: "Подходящие вузы", desc: "Из 100 вузов в нашей базе — где учат на твою профессию." },
                  { icon: "BookOpen", title: "Какие ЕГЭ сдавать", desc: "С прямой ссылкой на курс подготовки и проходные баллы." },
                ].map((o) => (
                  <div key={o.title} className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 md:p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <Icon name={o.icon} size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-montserrat font-bold text-white text-sm mb-0.5">{o.title}</p>
                      <p className="text-white/65 text-xs leading-relaxed">{o.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="text-center">
              <button
                onClick={handleStart}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-base font-black px-7 py-4 rounded-2xl hover:scale-[1.02] transition-transform shadow-lg shadow-cyan-500/30"
              >
                <Icon name="Sparkles" size={18} />
                {answeredCount > 0 && answeredCount < QUESTIONS.length ? "Продолжить тест" : "Начать тест"}
                <Icon name="ArrowRight" size={16} />
              </button>
              <p className="text-white/40 text-xs mt-3">Бесплатно · Без регистрации · Анонимно</p>
            </div>
          </>
        )}

        {/* ─── ТЕСТ ──────────────────────────────────────────────────────── */}
        {mode === "test" && QUESTIONS[step] && (
          <>
            <div className="mb-5">
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{blockInfo?.emoji}</span>
                  <span className="font-montserrat font-bold text-white text-sm">{blockInfo?.title}</span>
                </div>
                <span className="text-white/45 text-xs">{progress}% · {answeredCount}/{QUESTIONS.length}</span>
              </div>
              <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <QuestionCard
              question={QUESTIONS[step]}
              selected={answers[QUESTIONS[step].id]}
              onSelect={handleAnswer}
              index={step}
              total={QUESTIONS.length}
            />

            <div className="flex items-center justify-between gap-2 mt-4">
              <button
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/75 text-sm px-4 py-2 rounded-xl disabled:opacity-30"
              >
                <Icon name="ArrowLeft" size={14} />
                Назад
              </button>
              <span className="text-white/35 text-xs">Можно вернуться и поменять ответ</span>
              <button
                onClick={() => setStep(Math.min(QUESTIONS.length - 1, step + 1))}
                disabled={step >= QUESTIONS.length - 1}
                className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/75 text-sm px-4 py-2 rounded-xl disabled:opacity-30"
              >
                Пропустить
                <Icon name="ArrowRight" size={14} />
              </button>
            </div>
          </>
        )}

        {/* ─── ОБЗОР / ФИНАЛ ─────────────────────────────────────────────── */}
        {mode === "review" && (
          <section className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="font-montserrat font-black text-white text-3xl md:text-4xl mb-3">
              Готово! Все {QUESTIONS.length} вопросов
            </h2>
            <p className="text-white/70 text-base mb-6 max-w-xl mx-auto">
              Открой результат — там твой профиль личности, топ-10 профессий и вузы, где этому учат.
            </p>
            <button
              onClick={handleFinish}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-base font-black px-7 py-4 rounded-2xl hover:scale-[1.02] transition-transform shadow-lg shadow-cyan-500/30 mb-3"
            >
              <Icon name="Sparkles" size={18} />
              Показать результат
              <Icon name="ArrowRight" size={16} />
            </button>
            <div>
              <button
                onClick={() => { setStep(0); setMode("test"); }}
                className="text-white/55 hover:text-white text-xs underline"
              >
                Вернуться и поменять ответы
              </button>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
