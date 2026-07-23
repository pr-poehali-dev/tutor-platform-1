import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const HERO_IMG =
  "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/c73fcba3-5f13-4f38-af08-a5e096083ba7.jpg";

const STEPS = [
  { icon: "ClipboardList", text: "Отвечаете на чек-лист" },
  { icon: "Sparkles", text: "ИИ собирает курс под вас" },
  { icon: "GraduationCap", text: "Учитесь по своей программе" },
];

export default function CareerProPromo() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-6" aria-label="Профориентация PRO — индивидуальный курс">
      <div className="relative rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-600/20 via-fuchsia-500/10 to-cyan-500/15 overflow-hidden">
        {/* Свечение */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-purple-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/20 blur-3xl" />

        <div className="relative grid md:grid-cols-2 gap-6 md:gap-8 p-6 md:p-10 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] text-purple-200 font-bold uppercase tracking-wider bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-1 mb-4">
              <Icon name="Fingerprint" size={13} /> Новинка · такого нет ни у кого
            </div>
            <h2 className="font-montserrat font-black text-white text-2xl md:text-4xl leading-[1.08] mb-3">
              Курс, который создан{" "}
              <span className="bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
                только для вас
              </span>
            </h2>
            <p className="text-white/70 text-sm md:text-base leading-snug mb-5 max-w-lg">
              У каждого своя идеальная картина знаний. Пройдите чек-лист — и ИИ соберёт индивидуальный
              курс под вашу цель, уровень и нужные навыки. Персональная программа — бесплатно.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 mb-6">
              {STEPS.map((s, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-2 text-sm text-white/80 bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-purple-500/25 flex items-center justify-center text-[11px] font-bold text-purple-200">
                    {i + 1}
                  </span>
                  <Icon name={s.icon} size={15} className="text-purple-300" />
                  {s.text}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/career-pro"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold px-6 py-3.5 rounded-xl hover:scale-[1.03] transition-transform glow-purple"
              >
                <Icon name="Rocket" size={18} /> Собрать мой курс
              </Link>
              <span className="text-white/60 text-sm">
                Индивидуальный курс <span className="text-white font-bold">от 10 000 ₽</span>
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <img
                src={HERO_IMG}
                alt="Профориентация PRO — индивидуальный курс, собранный ИИ под конкретного человека"
                loading="lazy"
                className="w-full h-full object-cover aspect-[4/3]"
              />
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2">
              <Icon name="Sparkles" size={16} className="text-cyan-300 flex-shrink-0" />
              <span className="text-white/85 text-xs">Программа собирается ИИ за минуту — лично под вас</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
