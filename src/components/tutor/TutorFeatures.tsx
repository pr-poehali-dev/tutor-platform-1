import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { TUTOR_FEATURES } from "./tutorHubData";

export default function TutorFeatures() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white">Всё для учёбы в одном месте</h2>
        <p className="text-white/55 text-sm md:text-base mt-2">Выбери, с чего начать сегодня</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
        {TUTOR_FEATURES.map((f) => (
          <Link
            key={f.id}
            to={f.href}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-card/60 p-6 md:p-7 hover:border-white/20 transition-all"
            style={{ boxShadow: `0 0 0 rgba(0,0,0,0)` }}
          >
            <div
              className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"
              style={{ background: f.accent }}
              aria-hidden="true"
            />
            <div className="relative flex items-start gap-4">
              <div
                className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border"
                style={{ background: `${f.accent}18`, borderColor: `${f.accent}40` }}
              >
                {f.emoji}
              </div>
              <div className="flex-1 min-w-0">
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
                <span
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold group-hover:gap-2.5 transition-all"
                  style={{ color: f.accent }}
                >
                  <Icon name={f.icon} size={16} />
                  {f.cta}
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
