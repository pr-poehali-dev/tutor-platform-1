import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { DIRECTIONS, LEARNER_ORDER, LearnerDirection, getSavedDirection, saveDirection } from "@/lib/directions";
import { trackGoal } from "@/components/analytics/YandexMetrika";
import TochkaPartnerBadge from "@/components/partners/TochkaPartnerBadge";

const DOOR_IMAGES: Record<LearnerDirection, string> = {
  kids: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/d2270d9d-8d65-4f21-92cf-98add66b6130.jpg",
  school: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/ffeb04f8-8c69-4da8-8c6f-a352b52a50e7.jpg",
  adult: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/b3d98499-94a6-4220-ac2b-1f3614e9c7b2.jpg",
};

const DOOR_POINTS: Record<LearnerDirection, string[]> = {
  kids: ["Занятия по возрасту", "Песни и сказки", "Подготовка к школе"],
  school: ["ИИ-репетитор 24/7", "Домашка по фото", "ОГЭ, ЕГЭ, поступление"],
  adult: ["Нейросети для работы", "Удалённые профессии", "Своё дело и управление"],
};

/**
 * Первый экран главной — три «двери». Человек выбирает, кто будет
 * учиться, и попадает в своё направление. Выбор запоминается: при
 * следующем визите сверху появится «Продолжить: …». Автоматически не
 * перекидываем — иначе с главной нельзя сменить направление, а поиск
 * не увидит её содержимое.
 */
export default function DirectionDoors() {
  const [saved, setSaved] = useState<LearnerDirection | null>(null);
  useEffect(() => setSaved(getSavedDirection()), []);

  return (
    <section id="hero" className="relative px-4 pt-6 md:pt-10 pb-12">
      <div className="max-w-6xl mx-auto">
        {saved && (
          <Link
            to={DIRECTIONS[saved].home}
            onClick={() => trackGoal("direction_continue", { direction: saved })}
            className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/8 hover:bg-white/12 px-4 py-2 text-sm font-semibold text-white transition-colors"
          >
            <span aria-hidden="true">{DIRECTIONS[saved].emoji}</span>
            Продолжить: {DIRECTIONS[saved].label}
            <Icon name="ArrowRight" size={15} />
          </Link>
        )}

        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
          {/* Знак доверия на первом экране — как было до разделения на направления */}
          <TochkaPartnerBadge className="mb-4" />
          <h1 className="font-montserrat font-black text-3xl sm:text-4xl lg:text-5xl leading-[1.08] mb-3">
            Учёба для всей семьи —{" "}
            <span className="gradient-text-purple">с ИИ-наставником</span>
          </h1>
          <p className="text-white/70 text-base md:text-lg">Кто будет учиться? Выберите — покажем только то, что нужно именно ему.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          {LEARNER_ORDER.map((id) => {
            const d = DIRECTIONS[id];
            return (
              <Link
                key={id}
                to={d.home}
                onClick={() => {
                  saveDirection(id);
                  trackGoal("direction_door", { direction: id });
                }}
                className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] hover:border-white/25 hover:-translate-y-1 transition-all duration-300 flex flex-col focus-visible:outline-none focus-visible:ring-2 ${d.ring}`}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={DOOR_IMAGES[id]}
                    alt=""
                    loading="eager"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a1f] via-[#0d0a1f]/20 to-transparent" />
                  <span className="absolute top-3 left-3 rounded-full bg-black/45 backdrop-blur px-3 py-1 text-xs font-bold text-white">
                    {d.age}
                  </span>
                </div>
                <div className="p-5 pt-2 flex-1 flex flex-col">
                  <h2 className="font-montserrat font-black text-2xl text-white flex items-center gap-2">
                    <span aria-hidden="true">{d.emoji}</span>
                    {d.label}
                  </h2>
                  <p className="text-white/65 text-sm mt-1 mb-4">{d.tagline}</p>
                  <ul className="space-y-1.5 mb-5">
                    {DOOR_POINTS[id].map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm text-white/80">
                        <Icon name="Check" size={15} className="text-emerald-400 flex-shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex items-center justify-between gap-3">
                    <span className="text-xs text-white/50">{d.price}</span>
                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r ${d.gradient} text-white group-hover:scale-110 transition-transform`}>
                      <Icon name="ArrowRight" size={18} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}