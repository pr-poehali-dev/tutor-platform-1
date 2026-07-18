import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { TUTOR_FEATURES } from "./tutorHubData";

export default function TutorFeatures() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 bg-purple-500/15 border border-purple-500/30 rounded-full px-4 py-1.5 mb-3">
          <Icon name="Package" size={14} className="text-purple-300" />
          <span className="text-xs text-purple-200 font-bold uppercase tracking-wider">Единый модуль · всё включено</span>
        </div>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white">Что входит в «Репетитор»</h2>
        <p className="text-white/55 text-sm md:text-base mt-2">Одна подписка открывает сразу все инструменты обучения</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
        {TUTOR_FEATURES.map((f) => (
          <Link
            key={f.id}
            to="/checkout/tutor?period=month&from=/tutor"
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-card/60 p-6 md:p-7 hover:border-purple-400/40 transition-all"
            style={{ boxShadow: `0 0 0 rgba(0,0,0,0)` }}
          >
            <div
              className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"
              style={{ background: f.accent }}
              aria-hidden="true"
            />
            {/* Замок — функция открывается после оплаты модуля */}
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/8 border border-white/12 flex items-center justify-center text-white/45 group-hover:text-purple-300 group-hover:border-purple-400/40 transition-colors">
              <Icon name="Lock" size={14} />
            </div>
            <div className="relative flex items-start gap-4">
              <div
                className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border"
                style={{ background: `${f.accent}18`, borderColor: `${f.accent}40` }}
              >
                {f.emoji}
              </div>
              <div className="flex-1 min-w-0 pr-8">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-montserrat font-black text-lg text-white">{f.title}</h3>
                  {f.badge && (
                    <span
                      className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                      style={{ background: `${f.accent}22`, color: f.accent }}
                    >
                      {f.badge}
                    </span>
                  )}
                </div>
                <p className="text-white/45 text-xs font-semibold mt-0.5">{f.subtitle}</p>
                <p className="text-white/65 text-sm mt-2.5 leading-relaxed">{f.description}</p>
                <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-purple-300 group-hover:gap-2.5 transition-all">
                  <Icon name="Unlock" size={16} />
                  Открыть по подписке
                  <Icon name="ArrowRight" size={15} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}