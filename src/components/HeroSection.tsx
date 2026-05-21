import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const HERO_IMAGE =
  "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/0994044b-25d5-4180-a660-45350695aeb1.jpg";

const TRUST_POINTS = [
  { icon: "Zap", text: "Первый урок — за 30 секунд" },
  { icon: "CreditCard", text: "Без карты, без обязательств" },
  { icon: "ShieldCheck", text: "Данные на серверах в РФ" },
];

const SUBJECTS_QUICK = [
  { label: "Математика", emoji: "📐" },
  { label: "Русский", emoji: "📚" },
  { label: "Физика", emoji: "⚛️" },
  { label: "Информатика", emoji: "💻" },
  { label: "Обществознание", emoji: "🏛️" },
];

const AVATAR_COLORS = ["#a855f7", "#06b6d4", "#f59e0b", "#ec4899", "#10b981"];

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative pt-24 md:pt-28 pb-12 px-4 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* LEFT */}
          <div className="lg:col-span-7">
            {/* Бейдж — социальное доказательство */}
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/12 rounded-full pl-1.5 pr-4 py-1.5 mb-5 animate-fade-in-up backdrop-blur-sm">
              <div className="flex -space-x-2">
                {AVATAR_COLORS.map((c, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${c}, ${c}aa)` }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span className="text-xs md:text-sm text-white/85 font-medium">
                12 000+ школьников сейчас на платформе
              </span>
            </div>

            <h1 className="font-montserrat text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] mb-5 animate-fade-in-up animate-delay-100">
              ИИ-репетитор,{" "}
              <span className="gradient-text-purple text-glow-purple">
                который доводит
              </span>
              <br />
              до{" "}
              <span className="gradient-text-pink text-glow-pink">
                90+ баллов
              </span>{" "}
              на экзамене
            </h1>

            <p className="text-white/80 text-base md:text-lg leading-relaxed mb-7 max-w-xl animate-fade-in-up animate-delay-200">
              Голосовой репетитор находит твои пробелы за 5 минут диагностики и
              ведёт по персональному маршруту до результата. 24/7, без записи,
              без ожидания.
            </p>

            {/* CTA — один главный, один второстепенный */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in-up animate-delay-300">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("quick-quiz");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="group bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white font-bold px-7 py-4 rounded-2xl text-base flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/40 transition-all glow-purple"
              >
                <span>Подобрать маршрут</span>
                <Icon
                  name="ArrowRight"
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
              <Link
                to="/exam-bank"
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/25 transition-all font-medium text-base backdrop-blur-sm"
              >
                <Icon name="Library" size={16} className="text-purple-300" />
                Посмотреть задания ЕГЭ
              </Link>
            </div>

            {/* Trust-маркеры */}
            <ul className="flex flex-wrap gap-x-5 gap-y-2 mb-8 animate-fade-in-up animate-delay-400">
              {TRUST_POINTS.map((p) => (
                <li
                  key={p.text}
                  className="flex items-center gap-1.5 text-xs md:text-sm text-white/75"
                >
                  <Icon
                    name={p.icon}
                    size={14}
                    className="text-emerald-400 flex-shrink-0"
                  />
                  {p.text}
                </li>
              ))}
            </ul>

            {/* Быстрый выбор предмета */}
            <div className="animate-fade-in-up animate-delay-500">
              <p className="text-white/60 text-xs font-medium uppercase tracking-wide mb-2">
                Готовимся к экзаменам по
              </p>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS_QUICK.map((s) => (
                  <Link
                    key={s.label}
                    to="/exam-bank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/85 hover:bg-white/10 hover:border-white/20 transition-all"
                  >
                    <span>{s.emoji}</span>
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — превью продукта */}
          <div className="lg:col-span-5 relative animate-fade-in-up animate-delay-200">
            {/* Фрейм с фотографией */}
            <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl shadow-purple-500/20">
              <img
                src={HERO_IMAGE}
                alt="Счастливые выпускники с отличными результатами ЕГЭ"
                loading="eager"
                className="w-full aspect-[4/5] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>

              {/* Внутренний UI-мок: чат с ИИ */}
              <div className="absolute left-3 right-3 bottom-3 rounded-2xl bg-background/85 backdrop-blur-xl border border-white/15 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                    <Icon name="Bot" size={14} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white leading-tight">
                      ИИ-репетитор Юра
                    </p>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      онлайн
                    </p>
                  </div>
                </div>
                <p className="text-xs text-white/85 leading-relaxed">
                  «Нашёл у тебя 3 темы, на которых теряются баллы. Начнём с
                  производных — это даст +8 баллов за неделю.»
                </p>
              </div>
            </div>

            {/* Плавающие карточки достижений */}
            <div className="absolute -left-3 md:-left-6 top-[18%] bg-card/95 backdrop-blur-md border border-white/15 rounded-2xl p-2.5 animate-float shadow-xl">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center">
                  <Icon name="Zap" size={16} className="text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">+120 XP</div>
                  <div className="text-[10px] text-white/60">за урок</div>
                </div>
              </div>
            </div>

            <div className="absolute -right-3 md:-right-6 top-[55%] bg-card/95 backdrop-blur-md border border-white/15 rounded-2xl p-2.5 animate-float-delayed shadow-xl">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center">
                  <Icon name="Flame" size={16} className="text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">7 дней</div>
                  <div className="text-[10px] text-white/60">стрик подряд</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Отзыв-полоса */}
        <div className="mt-12 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-5 md:p-6 backdrop-blur-sm animate-fade-in-up animate-delay-500">
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <div className="flex items-center gap-3 md:border-r md:border-white/10 md:pr-5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center font-montserrat font-black text-white text-lg">
                А
              </div>
              <div>
                <p className="font-bold text-white text-sm">Аня, 11 класс</p>
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Icon key={i} name="Star" size={11} fill="currentColor" />
                  ))}
                  <span className="text-white/60 text-xs ml-1">5,0</span>
                </div>
              </div>
            </div>
            <p className="text-white/85 text-sm md:text-base leading-relaxed flex-1">
              «За 4 месяца с ИИ-репетитором по математике подняла с 62 до 89
              баллов. Главное — он всегда онлайн, можно спросить даже в 2 часа
              ночи перед пробником.»
            </p>
            <div className="flex items-center gap-2 text-xs text-white/60 md:flex-shrink-0">
              <Icon name="TrendingUp" size={14} className="text-emerald-400" />
              <span>
                <span className="font-bold text-emerald-400">+27 баллов</span>{" "}
                за 4 месяца
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Фоновые блики */}
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
    </section>
  );
}