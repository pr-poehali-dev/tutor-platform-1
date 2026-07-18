import { Link } from "react-router-dom";
import { TUTOR_SUBJECTS } from "./tutorHubData";

export default function TutorSubjects() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white">Выбери предмет</h2>
        <p className="text-white/55 text-sm md:text-base mt-2">Заходи сразу в нужную тему</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {TUTOR_SUBJECTS.map((s) => (
          <Link
            key={s.id}
            to={s.href}
            className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-card/50 py-6 hover:border-white/25 hover:-translate-y-0.5 transition-all"
            style={{ boxShadow: `inset 0 0 0 rgba(0,0,0,0)` }}
          >
            <span
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border transition-colors"
              style={{ background: `${s.accent}18`, borderColor: `${s.accent}38` }}
            >
              {s.emoji}
            </span>
            <span className="text-white font-semibold text-sm text-center">{s.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
