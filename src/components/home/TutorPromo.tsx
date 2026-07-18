import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const MINI = [
  { icon: "Mic", emoji: "🎓", title: "Уроки голосом", text: "Наставник объясняет вслух", href: "/super-courses", accent: "#a855f7" },
  { icon: "Camera", emoji: "📸", title: "Домашка по фото", text: "Решит и разберёт за минуту", href: "/homework", accent: "#22c55e" },
  { icon: "Target", emoji: "🎯", title: "Подготовка к ЕГЭ", text: "Банк заданий и трек в вуз", href: "/exam-bank", accent: "#ef4444" },
];

export default function TutorPromo() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-6" aria-label="Личный репетитор с ИИ">
      <div className="rounded-3xl border border-purple-500/25 bg-gradient-to-br from-purple-600/15 via-fuchsia-500/8 to-cyan-500/12 overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5 p-6 md:p-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-3xl flex-shrink-0">
            🎓
          </div>
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-purple-200 font-bold uppercase tracking-wider mb-1.5">
              <Icon name="Sparkles" size={12} /> Флагман · Первый урок бесплатно
            </div>
            <h3 className="font-montserrat font-black text-white text-xl md:text-2xl leading-tight mb-1.5">
              Личный репетитор по всем предметам
            </h3>
            <p className="text-white/65 text-sm leading-snug max-w-2xl">
              Голосовые уроки, проверка домашки по фото и разбор задач — всё в одном месте и всегда рядом. Как настоящий репетитор, только в десятки раз дешевле.
            </p>
          </div>
          <Link
            to="/tutor"
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-5 py-3 rounded-xl flex-shrink-0 hover:scale-[1.03] transition-transform"
          >
            Открыть репетитора <Icon name="ChevronRight" size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/5 border-t border-white/5">
          {MINI.map((m) => (
            <Link key={m.title} to={m.href} className="group flex items-center gap-3 bg-background/40 p-4 hover:bg-white/5 transition-colors">
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border shrink-0"
                style={{ background: `${m.accent}18`, borderColor: `${m.accent}38` }}
              >
                {m.emoji}
              </span>
              <div className="min-w-0">
                <div className="text-white font-bold text-sm">{m.title}</div>
                <div className="text-white/50 text-xs">{m.text}</div>
              </div>
              <Icon name="ChevronRight" size={16} className="text-white/30 ml-auto group-hover:text-white/60 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
