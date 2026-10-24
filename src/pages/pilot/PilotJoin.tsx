import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { trackGoal } from "@/components/analytics/YandexMetrika";
import SchoolKit from "@/components/pilot/SchoolKit";
import { PilotSchool, mySchool, pilotApi } from "@/components/pilot/api";

const BENEFITS = [
  { icon: "Bot", text: "ИИ-наставник по школьным предметам 24/7 — объясняет и подводит к ответу, а не решает за ученика" },
  { icon: "Camera", text: "Разбор домашнего задания по фото — по шагам" },
  { icon: "BookOpen", text: "Курсы 1–11 класса и подготовка к ОГЭ и ЕГЭ" },
];

const TERMS = [
  { big: "0 ₽", text: "для школы и учеников" },
  { big: "1 мин", text: "на подключение" },
  { big: "до 31.05.2027", text: "весь учебный год" },
];

const input =
  "w-full rounded-xl border border-white/15 bg-background/70 px-4 py-3 text-white placeholder:text-white/35 focus:border-violet-400 focus:outline-none";

/**
 * «Подключить школу»: одна форма из четырёх полей → школа сразу получает
 * свою ссылку и QR для учеников, тексты для чатов, памятку и статистику.
 * ?city=kazan&ref=<токен из письма> — форма заполняется данными школы из справочника.
 */
export default function PilotJoin() {
  const [params] = useSearchParams();
  const ref = params.get("ref") || "";
  const source = params.get("src") || (ref ? "letter" : "site");
  const [cities, setCities] = useState<{ slug: string; name: string }[]>([]);
  const [form, setForm] = useState({ school_name: "", contact_name: "", contact: "", city: params.get("city") || "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ school: PilotSchool; existing: boolean } | null>(null);
  const [saved] = useState(mySchool.get);

  useEffect(() => {
    pilotApi.cities().then((r) => r.ok && setCities(r.cities));
    if (ref)
      pilotApi.lookup(ref).then((r) => {
        if (!r.ok) return;
        setForm((f) => ({
          school_name: f.school_name || r.school_name,
          contact_name: f.contact_name || r.contact_name,
          contact: f.contact || r.contact,
          city: f.city || r.city,
        }));
      });
  }, [ref]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setError("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.city) return setError("Выберите город");
    setBusy(true);
    const r = await pilotApi.join({ ...form, institution_ref: ref || undefined, source });
    setBusy(false);
    if (!r.ok) return setError(r.error || "Не получилось — попробуйте ещё раз");
    mySchool.set(r.school);
    trackGoal("pilot_school_joined", { city: form.city, source, existing: r.existing });
    setDone({ school: r.school, existing: r.existing });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Подключить школу к пилотному проекту УЧИСЬПРО — бесплатно"
        description="Бесплатный доступ к ИИ-наставнику и курсам 1–11 класса для всех учеников школы до 31 мая 2027 года. Подключение за 1 минуту, без договоров."
        canonical="https://учисьпро.рф/podklyuchit-shkolu"
      />
      <header className="sticky top-0 z-40 border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 text-lg">🎓</div>
            <span className="font-montserrat font-black gradient-text-purple">УЧИСЬПРО</span>
          </Link>
          <Link to="/for-schools/presentation" className="text-sm font-bold text-violet-200 hover:text-white">
            Презентация для директора
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-8 md:py-12">
        {done ? (
          <SchoolKit school={done.school} existing={done.existing} />
        ) : (
          <>
            <section className="mb-8 text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/35 bg-emerald-500/15 px-4 py-1.5">
                <Icon name="School" size={13} className="text-emerald-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">Пилотный проект для школ · 2026/27</span>
              </div>
              <h1 className="mb-4 font-montserrat text-3xl font-black leading-tight md:text-5xl">
                Подключите школу{" "}
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">за 1 минуту</span>
              </h1>
              <p className="mx-auto max-w-2xl text-base text-white/70 md:text-lg">
                Все ученики школы получат бесплатный доступ к ИИ-наставнику и курсам. Без договоров, закупок и нагрузки на учителей.
              </p>
            </section>

            <div className="mb-8 grid grid-cols-3 gap-3">
              {TERMS.map((t) => (
                <div key={t.big} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center">
                  <p className="font-montserrat text-lg font-black text-cyan-200 md:text-2xl">{t.big}</p>
                  <p className="text-xs text-white/60 md:text-sm">{t.text}</p>
                </div>
              ))}
            </div>

            {saved && (
              <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-violet-400/30 bg-violet-500/10 p-4 text-sm">
                <Icon name="History" size={18} className="text-violet-200" />
                <span className="flex-1">
                  Вы уже подключали <b>{saved.school_name}</b>.
                </span>
                <button onClick={() => setDone({ school: saved, existing: true })} className="rounded-lg bg-white/10 px-3 py-1.5 font-bold hover:bg-white/20">
                  Открыть материалы
                </button>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-[1fr_300px]">
              <form onSubmit={submit} className="space-y-3 rounded-3xl border border-white/12 bg-white/[0.04] p-5 md:p-7">
                <p className="font-montserrat text-xl font-black">Данные школы</p>
                {ref && form.school_name && (
                  <p className="flex items-center gap-1.5 text-xs text-emerald-200">
                    <Icon name="Sparkles" size={13} /> Заполнили по данным из справочника — проверьте и отправьте
                  </p>
                )}
                <label className="block">
                  <span className="mb-1 block text-xs text-white/55">Название школы</span>
                  <input className={input} value={form.school_name} onChange={set("school_name")} placeholder="МБОУ «Школа № 5»" required minLength={3} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-white/55">Город</span>
                  <select className={input} value={form.city} onChange={set("city")} required>
                    <option value="" className="bg-slate-900">
                      Выберите город или регион
                    </option>
                    {cities.map((c) => (
                      <option key={c.slug} value={c.slug} className="bg-slate-900">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-white/55">Ваше имя</span>
                  <input className={input} value={form.contact_name} onChange={set("contact_name")} placeholder="Ирина Петровна" required minLength={2} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-white/55">Email или телефон</span>
                  <input className={input} value={form.contact} onChange={set("contact")} placeholder="school5@mail.ru" required />
                </label>
                {error && (
                  <p className="flex items-center gap-1.5 text-sm text-rose-300">
                    <Icon name="CircleAlert" size={15} /> {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-3.5 font-black transition-transform hover:scale-[1.01] disabled:opacity-60"
                >
                  <Icon name={busy ? "Loader2" : "Rocket"} size={18} className={busy ? "animate-spin" : ""} />
                  {busy ? "Подключаем…" : "Подключить школу"}
                </button>
                <p className="text-center text-xs text-white/40">
                  Регистрация не нужна. Нажимая кнопку, вы соглашаетесь с{" "}
                  <Link to="/privacy" className="underline">
                    политикой обработки данных
                  </Link>
                  .
                </p>
              </form>

              <div className="space-y-4">
                <a
                  href={`https://max.ru/id631205241205_bot?start=pilot_join${form.city ? "_" + form.city : ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackGoal("pilot_join_max_click", { city: form.city })}
                  className="flex items-center gap-3 rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4 text-sm hover:bg-sky-500/15"
                >
                  <Icon name="MessageCircle" size={20} className="shrink-0 text-sky-300" />
                  <span className="flex-1">
                    <b>Удобнее в MAX?</b> Бот пришлёт условия и ссылку на подключение — можно переслать коллегам.
                  </span>
                </a>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="mb-3 font-bold">Что сразу получит школа</p>
                  <ul className="space-y-2 text-sm text-white/70">
                    {["Свою ссылку и QR-код для учеников", "Тексты для чатов учеников и родителей", "Памятку для печати", "Статистику подключения по классам"].map((x) => (
                      <li key={x} className="flex gap-2">
                        <Icon name="Check" size={16} className="mt-0.5 shrink-0 text-emerald-300" /> {x}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="mb-3 font-bold">Что получат ученики</p>
                  <ul className="space-y-2.5 text-sm text-white/70">
                    {BENEFITS.map((b) => (
                      <li key={b.text} className="flex gap-2">
                        <Icon name={b.icon} size={16} className="mt-0.5 shrink-0 text-cyan-300" /> {b.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <section className="mt-10">
              <h2 className="mb-4 text-center font-montserrat text-2xl font-black">Как это работает</h2>
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  ["1", "Подключаете школу", "Эта форма — 1 минута. Сразу получаете ссылку, QR и тексты."],
                  ["2", "Отправляете в чаты", "Классные руководители пересылают текст в чаты учеников и родителей."],
                  ["3", "Ученики подключаются", "Вход, класс — и доступ открыт до 31.05.2027. Вы видите статистику."],
                ].map(([n, title, text]) => (
                  <div key={n} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/25 font-bold">{n}</span>
                    <p className="mb-1 font-bold">{title}</p>
                    <p className="text-sm text-white/60">{text}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
