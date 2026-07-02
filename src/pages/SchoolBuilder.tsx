import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { generateCourse, type GenerateResult } from "@/components/builder/api";
import CourseResult from "@/components/builder/CourseResult";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

const EXAMPLES = [
  "Английский для начинающих",
  "Профессиональная фотография",
  "Основы Python",
  "Домашняя выпечка",
  "SMM с нуля",
  "Финансовая грамотность",
];

const LOADING_STEPS = [
  "Анализирую тему и аудиторию…",
  "Проектирую структуру модулей…",
  "Пишу уроки, задания и квизы…",
  "Собираю маркетинг-пакет для продаж…",
  "Рассчитываю цену и УТП…",
];

export default function SchoolBuilder() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [lessons, setLessons] = useState(8);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const stepTimer = useRef<number | null>(null);

  useEffect(() => {
    if (loading) {
      setStep(0);
      stepTimer.current = window.setInterval(() => {
        setStep((s) => (s < LOADING_STEPS.length - 1 ? s + 1 : s));
      }, 2200);
    } else if (stepTimer.current) {
      clearInterval(stepTimer.current);
    }
    return () => {
      if (stepTimer.current) clearInterval(stepTimer.current);
    };
  }, [loading]);

  const submit = async () => {
    if (loading) return;
    if (topic.trim().length < 3) return setError("Опишите тему курса");
    setError(null);
    setLoading(true);
    setResult(null);
    const res = await generateCourse({
      topic: topic.trim(),
      audience: audience.trim() || undefined,
      lessons_count: lessons,
    });
    setLoading(false);
    if (!res.ok || !res.data) return setError(res.error || "Не удалось собрать курс");
    setResult(res.data);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = () => {
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="ИИ-конструктор курса · Соберите онлайн-курс за минуту — УЧИСЬПРО"
        description="Введите тему — искусственный интеллект соберёт готовый онлайн-курс: программу, уроки с заданиями и квизами, плюс маркетинг-пакет для продаж. Бесплатная демонстрация конструктора школ."
        canonical={`${SITE_URL}/school-builder`}
      />

      {/* Хедер */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple">УЧИСЬПРО</span>
            <span className="hidden sm:inline text-[11px] text-white/45 border border-white/15 rounded-lg px-2 py-0.5">конструктор</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/school" className="text-sm text-white/65 hover:text-white transition-colors inline-flex items-center gap-1.5">
              <Icon name="School" size={15} /> Моя школа
            </Link>
            <Link to="/for-business" className="hidden sm:inline-flex text-sm text-white/65 hover:text-white transition-colors items-center gap-1.5">
              <Icon name="Building2" size={15} /> Для бизнеса
            </Link>
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 pt-8 pb-16">
        {result ? (
          <CourseResult result={result} onRestart={restart} onLead={() => navigate("/for-business#lead")} />
        ) : (
          <>
            {/* Hero */}
            <section className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/35 rounded-full px-4 py-1.5 mb-5">
                <Icon name="Sparkles" size={12} className="text-violet-300" />
                <span className="text-xs text-violet-200 font-bold uppercase tracking-wider">ИИ-конструктор курса</span>
              </div>
              <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-4 leading-tight">
                Соберите онлайн-курс{" "}
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">за одну минуту</span>
              </h1>
              <p className="text-white/65 text-base md:text-lg max-w-2xl mx-auto">
                Назовите тему — ИИ соберёт программу, уроки с заданиями и квизами, и даже маркетинг-пакет для продаж. Бесплатно, прямо сейчас.
              </p>
            </section>

            {/* Форма */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 max-w-2xl mx-auto">
              {loading ? (
                <div className="py-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-violet-500/15 flex items-center justify-center mx-auto mb-5">
                    <Icon name="Loader2" size={28} className="text-violet-300 animate-spin" />
                  </div>
                  <div className="font-montserrat font-bold text-lg text-white mb-4">Собираю ваш курс…</div>
                  <div className="space-y-2 max-w-sm mx-auto text-left">
                    {LOADING_STEPS.map((s, i) => (
                      <div key={i} className={`flex items-center gap-2.5 text-sm transition-all ${i <= step ? "text-white/85" : "text-white/30"}`}>
                        <Icon
                          name={i < step ? "CircleCheck" : i === step ? "Loader2" : "Circle"}
                          size={15}
                          className={i < step ? "text-emerald-400" : i === step ? "text-violet-300 animate-spin" : "text-white/25"}
                        />
                        {s}
                      </div>
                    ))}
                  </div>
                  <p className="text-white/40 text-xs mt-5">Обычно занимает 15–40 секунд</p>
                </div>
              ) : (
                <>
                  <label className="block text-white/70 text-sm font-medium mb-2">Чему хотите учить?</label>
                  <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    placeholder="Например: Английский для начинающих"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50 mb-3"
                  />

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {EXAMPLES.map((ex) => (
                      <button
                        key={ex}
                        onClick={() => setTopic(ex)}
                        className="text-xs text-white/55 border border-white/10 hover:border-violet-500/40 hover:text-white rounded-lg px-2.5 py-1 transition-colors"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>

                  <label className="block text-white/70 text-sm font-medium mb-2">Для кого курс? (необязательно)</label>
                  <input
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="Например: взрослые с нуля"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50 mb-4"
                  />

                  <label className="block text-white/70 text-sm font-medium mb-2">Сколько уроков?</label>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {[6, 8, 12, 16].map((n) => (
                      <button
                        key={n}
                        onClick={() => setLessons(n)}
                        className={`rounded-lg border px-4 py-2 text-sm transition-all ${
                          lessons === n
                            ? "border-violet-400/60 bg-violet-500/15 text-white"
                            : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/25"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>

                  {error && <div className="text-rose-300 text-sm mb-3">{error}</div>}

                  <button
                    onClick={submit}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold py-4 rounded-xl hover:scale-[1.01] transition-transform"
                  >
                    <Icon name="Sparkles" size={18} /> Собрать курс с ИИ
                  </button>
                  <p className="text-white/35 text-[11px] text-center mt-3">
                    Бесплатно и без регистрации. Это демонстрация возможностей платформы.
                  </p>
                </>
              )}
            </section>

            {/* Что получите */}
            {!loading && (
              <section className="grid sm:grid-cols-3 gap-3 mt-8 max-w-2xl mx-auto">
                {[
                  { icon: "GraduationCap", title: "Программа и уроки", desc: "Модули, темы, задания и квизы" },
                  { icon: "Megaphone", title: "Маркетинг-пакет", desc: "Заголовки, посты, email-цепочка" },
                  { icon: "Tag", title: "Бизнес-подсказки", desc: "Цена, УТП и каналы продаж" },
                ].map((f) => (
                  <div key={f.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center mx-auto mb-2">
                      <Icon name={f.icon} size={18} className="text-violet-300" />
                    </div>
                    <div className="font-semibold text-white text-sm mb-0.5">{f.title}</div>
                    <div className="text-white/50 text-xs">{f.desc}</div>
                  </div>
                ))}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}