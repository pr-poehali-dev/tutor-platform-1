import { useEffect, useState } from "react";
import { Link, useSearchParams } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { trackGoal } from "@/components/analytics/YandexMetrika";
import { COURSES } from "@/components/courses/coursesData";
import { courseUrl } from "@/components/courses/courseSlug";
import { marathonApi, MarathonMe, getSavedToken, saveToken } from "./api";
import { MarathonProgram, MarathonExercise } from "./types";
import ReadingTest from "./ReadingTest";
import { SchulteTable, Wedge, FlashWords } from "./trainers";
import MarathonMentor from "./MarathonMentor";
import MarathonOffer from "./MarathonOffer";

const CHECKLIST = "/files/chek-list-10-sposobov-bystro-chitat.pdf";

function Exercise({ ex, token, grade }: { ex: MarathonExercise; token: string; grade: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#120c25]/80 p-5 md:p-6">
      <p className="inline-flex items-center gap-1.5 text-amber-200 text-xs font-bold uppercase tracking-wider mb-1">
        <Icon name="Gamepad2" size={13} /> Тренажёр
      </p>
      <h3 className="font-montserrat font-black text-white text-lg mb-1">{ex.title}</h3>
      <p className="text-white/60 text-sm mb-4">{ex.instruction}</p>
      {ex.kind === "schulte" && <SchulteTable />}
      {ex.kind === "wedge" && <Wedge />}
      {ex.kind === "flash-words" && <FlashWords />}
      {ex.kind === "reading-test" && <ReadingTest token={token} defaultGrade={grade} compact />}
    </div>
  );
}

function timeLeft(startedAt: string, day: number): string {
  const opens = new Date(startedAt).getTime() + (day - 1) * 24 * 3600 * 1000;
  const ms = opens - Date.now();
  if (ms <= 0) return "скоро";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `через ${h} ч ${m} мин` : `через ${m} мин`;
}

export default function MarathonCabinet({ program }: { program: MarathonProgram }) {
  const [params] = useSearchParams();
  const token = params.get("t") || getSavedToken(program.track) || "";
  const welcome = params.get("welcome") === "1";
  const [me, setMe] = useState<MarathonMe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(1);
  const [hw, setHw] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("no_token");
      return;
    }
    saveToken(program.track, token);
    marathonApi
      .me(token)
      .then((d) => {
        setMe(d);
        const firstOpen = Math.min(d.unlocked_day, 3);
        const next = [1, 2, 3].find((x) => x <= d.unlocked_day && !d.completed_days.includes(x));
        setActive(next || firstOpen);
      })
      .catch((e) => setError(e.message));
  }, [token, program.track]);

  useEffect(() => {
    setHw(me?.homework?.[String(active)] || "");
  }, [active, me]);

  const offerCourse = COURSES.find((c) => c.id === program.offer.courseId);
  const offerUrl = offerCourse ? courseUrl(offerCourse) : "/courses";
  const grade = program.track === "teacher" ? "adult" : "2";

  if (error) {
    return (
      <div className="min-h-screen bg-mesh font-golos text-white flex items-center justify-center px-6 text-center">
        <Seo title="Кабинет марафона" description="Личный кабинет участника марафона скорочтения." noindex />
        <div className="max-w-md">
          <div className="text-5xl mb-4">🔑</div>
          <h1 className="font-montserrat font-black text-2xl mb-3">Нужна ссылка доступа</h1>
          <p className="text-white/60 mb-6">
            {error === "no_token"
              ? "Откройте кабинет по ссылке из письма или зарегистрируйтесь — это бесплатно."
              : `Не удалось открыть кабинет: ${error}`}
          </p>
          <Link to={`/${program.slug}`} className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-6 py-3.5 rounded-2xl">
            На страницу марафона
          </Link>
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <Icon name="Loader2" size={32} className="animate-spin text-violet-300" />
      </div>
    );
  }

  const day = program.days[active - 1];
  const done = me.completed_days.includes(active);
  const finished = me.completed_days.length >= 3;

  const complete = async () => {
    setSaving(true);
    try {
      const r = await marathonApi.completeDay(token, active, hw);
      setMe({ ...me, completed_days: r.completed_days, homework: { ...me.homework, [String(active)]: hw } });
      trackGoal("marathon_day_done", { track: program.track, day: active });
      if (active < 3 && active + 1 <= me.unlocked_day) setActive(active + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Не удалось сохранить");
    }
    setSaving(false);
  };

  const firstTest = me.tests[0];
  const lastTest = me.tests[me.tests.length - 1];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo title={`Кабинет: ${program.shortTitle}`} description="Уроки марафона скорочтения." noindex />

      <header className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">📖</div>
            <span className="font-montserrat font-black text-base gradient-text-purple hidden sm:inline">УЧИСЬПРО</span>
          </Link>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-white/50 hidden sm:inline">Пройдено</span>
            <span className="font-bold">{me.completed_days.length} / 3</span>
            <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden ml-1">
              <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400" style={{ width: `${(me.completed_days.length / 3) * 100}%` }} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 pt-6 pb-16">
        <Breadcrumbs className="mb-5" items={[{ label: "Главная", href: "/" }, { label: program.shortTitle, href: `/${program.slug}` }, { label: "Мои уроки" }]} />

        {welcome && (
          <div className="mb-6 rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-bold text-white">{me.name ? `${me.name}, вы в марафоне!` : "Вы в марафоне!"} Первый урок уже открыт.</p>
              <p className="text-white/60 text-sm">Ссылку на кабинет и подарок мы отправили на {me.email}. Сохраните это письмо.</p>
            </div>
            <a href={CHECKLIST} target="_blank" rel="noreferrer" onClick={() => trackGoal("marathon_checklist")} className="inline-flex items-center justify-center gap-2 bg-white text-[#1a1033] font-bold px-5 py-3 rounded-2xl">
              <Icon name="Download" size={17} /> Скачать чек-лист
            </a>
          </div>
        )}

        {/* Дни */}
        <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6">
          {program.days.map((d) => {
            const open = d.day <= me.unlocked_day;
            const isDone = me.completed_days.includes(d.day);
            return (
              <button
                key={d.day}
                disabled={!open}
                onClick={() => setActive(d.day)}
                className={`text-left rounded-2xl border p-3 md:p-4 transition-colors ${
                  active === d.day ? "border-violet-400/60 bg-violet-500/20" : open ? "border-white/10 bg-white/[0.03] hover:border-white/25" : "border-white/5 bg-white/[0.02] opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white/60">День {d.day}</span>
                  <Icon name={isDone ? "CircleCheck" : open ? "PlayCircle" : "Lock"} size={16} className={isDone ? "text-emerald-300" : open ? "text-cyan-300" : "text-white/40"} />
                </div>
                <p className="text-white text-xs md:text-sm font-bold leading-snug line-clamp-2">{d.title}</p>
                {!open && <p className="text-white/45 text-[11px] mt-1">Откроется {timeLeft(me.started_at, d.day)}</p>}
              </button>
            );
          })}
        </div>

        {/* Урок */}
        <article className="space-y-6">
          <div>
            <p className="text-cyan-300 text-xs font-bold uppercase tracking-wider mb-1">День {day.day} · ≈ {day.minutes} минут</p>
            <h1 className="font-montserrat font-black text-2xl md:text-4xl mb-2">{day.title}</h1>
            <p className="text-white/60">{day.subtitle}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {day.goals.map((g) => (
                <span key={g} className="inline-flex items-center gap-1.5 bg-white/[0.05] border border-white/10 rounded-full px-3 py-1.5 text-white/75 text-xs">
                  <Icon name="Target" size={13} className="text-violet-300" /> {g}
                </span>
              ))}
            </div>
          </div>

          {day.sections.map((s) => (
            <section key={s.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-7">
              <h2 className="font-montserrat font-black text-white text-xl mb-3">{s.title}</h2>
              {s.paragraphs.map((p) => (
                <p key={p.slice(0, 40)} className="text-white/80 leading-relaxed mb-3 last:mb-0">{p}</p>
              ))}
              {s.bullets && (
                <ul className="mt-3 space-y-2">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex gap-2.5 text-white/80 text-sm">
                      <Icon name="Dot" size={20} className="text-cyan-300 flex-shrink-0 -mt-0.5" /> {b}
                    </li>
                  ))}
                </ul>
              )}
              {s.tip && (
                <div className="mt-4 rounded-2xl bg-amber-500/10 border border-amber-400/25 p-4 flex gap-3">
                  <Icon name="Lightbulb" size={19} className="text-amber-300 flex-shrink-0" />
                  <p className="text-amber-50/90 text-sm">{s.tip}</p>
                </div>
              )}
            </section>
          ))}

          {day.exercises.map((ex) => (
            <Exercise key={ex.title} ex={ex} token={token} grade={grade} />
          ))}

          <MarathonMentor day={day} track={program.track} />

          {/* Домашнее задание */}
          <section className="rounded-3xl border border-violet-400/30 bg-violet-500/[0.08] p-5 md:p-7">
            <h2 className="font-montserrat font-black text-white text-xl mb-2">{day.homework.title}</h2>
            <p className="text-white/75 text-sm mb-4">{day.homework.task}</p>
            <textarea
              value={hw}
              onChange={(e) => setHw(e.target.value)}
              rows={4}
              placeholder={day.homework.placeholder}
              className="w-full bg-white/[0.06] border border-white/15 rounded-2xl px-4 py-3 text-white text-sm placeholder:text-white/35 focus:outline-none focus:border-violet-400/60 mb-4"
            />
            <button
              onClick={complete}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-6 py-3.5 rounded-2xl disabled:opacity-60"
            >
              {saving ? <Icon name="Loader2" size={18} className="animate-spin" /> : <Icon name={done ? "Save" : "CircleCheck"} size={18} />}
              {done ? "Сохранить ответ" : `Завершить день ${day.day}`}
            </button>
            {done && <p className="text-emerald-300 text-sm mt-3">День {day.day} пройден ✓</p>}
          </section>
        </article>

        {/* Прогресс замеров */}
        {me.tests.length > 0 && (
          <section className="mt-8 rounded-3xl border border-cyan-400/25 bg-cyan-500/[0.06] p-5 md:p-6">
            <h2 className="font-montserrat font-black text-white text-lg mb-3">Ваши замеры скорости</h2>
            <div className="flex flex-wrap gap-2">
              {me.tests.map((tst, i) => (
                <span key={i} className="bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
                  {tst.wpm} сл/мин · {tst.comprehension}%
                </span>
              ))}
            </div>
            {me.tests.length > 1 && lastTest.wpm > firstTest.wpm && (
              <p className="text-emerald-300 text-sm mt-3">Прирост: +{lastTest.wpm - firstTest.wpm} слов в минуту</p>
            )}
          </section>
        )}

        {/* Напоминания в MAX */}
        {!me.max_linked && me.max_link_code && (
          <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <p className="font-bold text-white mb-1 flex items-center gap-2"><Icon name="BellRing" size={18} className="text-cyan-300" /> Напоминания в MAX</p>
              <p className="text-white/60 text-sm">
                {me.max_bot ? (
                  <>
                    Откройте{" "}
                    <a href={me.max_bot.startsWith("http") ? me.max_bot : `https://max.ru/${me.max_bot.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="text-cyan-300 underline font-bold">
                      бота УЧИСЬПРО в MAX
                    </a>{" "}
                    и отправьте команду:
                  </>
                ) : (
                  "Отправьте нашему боту в MAX команду:"
                )}
              </p>
            </div>
            <button
              onClick={() => navigator.clipboard?.writeText(`/start ${me.max_link_code}`)}
              className="inline-flex items-center justify-center gap-2 font-mono font-bold bg-white/[0.08] border border-white/15 rounded-xl px-4 py-3 text-white"
            >
              /start {me.max_link_code} <Icon name="Copy" size={15} />
            </button>
          </section>
        )}
        {me.max_linked && (
          <p className="mt-6 text-white/55 text-sm flex items-center gap-2"><Icon name="BellRing" size={15} className="text-emerald-300" /> Напоминания в MAX подключены</p>
        )}

        {/* Оффер */}
        <section className="mt-10">
          {finished ? (
            <MarathonOffer program={program} courseUrl={offerUrl} />
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-center">
              <Icon name="Gift" size={22} className="text-amber-300 mx-auto mb-2" />
              <p className="text-white/70 text-sm">Пройдите все три дня — в конце марафона вас ждёт подарок для участников.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
