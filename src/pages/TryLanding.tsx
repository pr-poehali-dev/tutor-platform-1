import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import RichText from "@/components/ui/rich-text";
import { trackGoal } from "@/components/analytics/YandexMetrika";
import { useAuth } from "@/context/AuthContext";
import func2url from "../../backend/func2url.json";

const AI_URL = (func2url as Record<string, string>)["ai-chat"];
const CONTACT_URL = (func2url as Record<string, string>)["contact"];

const EXAMPLES = ["Не понимаю дроби", "Как решать задачи на проценты?", "Разбери задание 13 ЕГЭ", "Помоги с уравнением 2x + 5 = 17"];
const GRADES = ["1–4 класс", "5–8 класс", "9 класс · ОГЭ", "10–11 класс · ЕГЭ"];

type Msg = { role: "user" | "assistant"; text: string };

function utmFromUrl(params: URLSearchParams) {
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "yclid"];
  const out: Record<string, string> = { landing: "/start" };
  keys.forEach((k) => {
    const v = params.get(k);
    if (v) out[k] = v.slice(0, 120);
  });
  return out;
}

/** Посадочная страница для рекламы: одно действие — задать вопрос ИИ-репетитору прямо здесь. */
export default function TryLanding() {
  const [params] = useSearchParams();
  const { user, openLogin } = useAuth();
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const tryRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    trackGoal("start_view");
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs, loading]);

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || loading) return;
    setInput("");
    setError(null);
    const history = msgs.map((m) => ({ role: m.role, content: m.text }));
    setMsgs((p) => [...p, { role: "user", text: q }]);
    setLoading(true);
    trackGoal("start_ask", { n: msgs.filter((m) => m.role === "user").length + 1 });
    try {
      const res = await fetch(AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, history, voice_mode: false }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.reply) throw new Error(data?.error || "no reply");
      setMsgs((p) => [...p, { role: "assistant", text: String(data.reply) }]);
      trackGoal("start_answer");
    } catch (e) {
      const m = e instanceof Error ? e.message : "";
      setError(/[а-яё]/i.test(m) ? m : "Связь прервалась. Нажмите на вопрос ещё раз — обычно со второй попытки всё работает.");
    } finally {
      setLoading(false);
    }
  };

  const answered = msgs.some((m) => m.role === "assistant");
  const goTry = () => {
    tryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => inputRef.current?.focus(), 400);
    trackGoal("start_cta_top");
  };

  return (
    <div className="min-h-screen bg-mesh text-white font-golos">
      <Seo
        title="ИИ-репетитор для школьника: объяснит любую тему за минуту — бесплатно"
        description="Ребёнок не понимает тему или не может сделать домашку? Спросите ИИ-репетитора прямо сейчас — без регистрации. Объясняет простыми словами, ведёт к ответу, готовит к ОГЭ и ЕГЭ."
        canonical="https://учисьпро.рф/start"
      />

      <header className="sticky top-0 z-30 bg-background/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-sm">🎓</span>
            <span className="font-montserrat font-black gradient-text-purple">УЧИСЬПРО</span>
          </Link>
          <button onClick={goTry} className="text-xs font-bold bg-white text-[#1a1033] px-3.5 py-2 rounded-xl">
            Попробовать
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pb-16">
        <section className="pt-6 pb-4 text-center">
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-xs font-bold rounded-full px-3 py-1 mb-4">
            <Icon name="Gift" size={13} /> Бесплатно · без регистрации
          </span>
          <h1 className="font-montserrat font-black text-[28px] leading-[1.15] mb-3">
            Ребёнок не понял тему? <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">ИИ-репетитор объяснит за минуту</span>
          </h1>
          <p className="text-white/70 text-[15px] leading-relaxed">
            Математика, русский, физика, химия и другие предметы 1–11 класса. Объясняет простыми словами и ведёт к ответу подсказками — а не даёт списать.
          </p>
        </section>

        <div ref={tryRef} className="scroll-mt-20 rounded-3xl border border-white/15 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-4 shadow-2xl shadow-violet-500/10">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            <p className="text-sm font-bold">Задайте вопрос прямо сейчас</p>
          </div>

          {msgs.length > 0 && (
            <div ref={chatRef} className="mb-3 max-h-[55vh] overflow-y-auto space-y-2.5 pr-1">
              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === "user"
                      ? "ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-violet-500/25 border border-violet-400/30 px-3.5 py-2 text-sm"
                      : "mr-auto max-w-[94%] rounded-2xl rounded-bl-md bg-white/[0.08] border border-white/12 px-3.5 py-2.5 text-sm text-white/90 leading-relaxed"
                  }
                >
                  {m.role === "user" ? m.text : <RichText text={m.text} />}
                </div>
              ))}
              {loading && (
                <div className="mr-auto flex items-center gap-2 rounded-2xl bg-white/[0.08] border border-white/12 px-3.5 py-2.5">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="h-1.5 w-1.5 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                  <span className="text-xs text-white/60 ml-1">думает…</span>
                </div>
              )}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Например: не понимаю дроби"
              aria-label="Вопрос ИИ-репетитору"
              className="flex-1 min-w-0 rounded-xl bg-white/[0.08] border border-white/15 px-3.5 py-3.5 text-[16px] placeholder:text-white/45 outline-none focus:border-violet-400/60"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Отправить"
              className="shrink-0 h-[50px] w-[50px] rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center disabled:opacity-40"
            >
              <Icon name={loading ? "Loader2" : "Send"} size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </form>

          {msgs.length === 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex) => (
                <button key={ex} type="button" onClick={() => ask(ex)} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 active:bg-white/15">
                  {ex}
                </button>
              ))}
            </div>
          )}

          {error && (
            <p className="mt-2.5 text-xs text-rose-300 flex items-center gap-1.5">
              <Icon name="TriangleAlert" size={13} /> {error}
            </p>
          )}

          {answered && (
            <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
              <p className="text-sm font-bold mb-1">Понравилось объяснение?</p>
              <p className="text-sm text-white/75 mb-3">
                Зарегистрируйтесь бесплатно — репетитор запомнит, что ребёнок уже прошёл, и составит план. Домашку можно проверять по фото.
              </p>
              {user ? (
                <Link to="/cabinet" onClick={() => trackGoal("start_cta_cabinet")} className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-bold">
                  Перейти в личный кабинет <Icon name="ArrowRight" size={16} />
                </Link>
              ) : (
                <button
                  onClick={() => {
                    trackGoal("start_cta_register");
                    openLogin();
                  }}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-bold"
                >
                  Продолжить бесплатно <Icon name="ArrowRight" size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        <section className="mt-8 grid grid-cols-3 gap-2 text-center">
          {[
            { icon: "Clock", t: "24/7", s: "и в выходные" },
            { icon: "Camera", t: "Фото", s: "проверка домашки" },
            { icon: "GraduationCap", t: "ОГЭ/ЕГЭ", s: "задания с разбором" },
          ].map((b) => (
            <div key={b.t} className="rounded-2xl border border-white/10 bg-white/[0.03] py-3 px-2">
              <Icon name={b.icon} size={20} className="mx-auto text-violet-300 mb-1" />
              <p className="font-bold text-sm">{b.t}</p>
              <p className="text-white/50 text-[11px] leading-tight">{b.s}</p>
            </div>
          ))}
        </section>

        <section className="mt-8">
          <h2 className="font-montserrat font-black text-xl mb-3">Почему родители выбирают</h2>
          <div className="space-y-2.5">
            {[
              { i: "ShieldCheck", t: "Не даёт списать", s: "Наставник задаёт наводящие вопросы — ребёнок сам приходит к ответу и понимает тему." },
              { i: "Wallet", t: "Дешевле репетитора", s: "Начать можно бесплатно. Подписка на все предметы — 1 490 ₽ в месяц: дешевле одного занятия с частным репетитором." },
              { i: "Moon", t: "Помощь, когда нужна", s: "Вечером над домашкой, после болезни, перед контрольной — без записи и ожидания." },
            ].map((f) => (
              <div key={f.t} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <Icon name={f.i} size={22} className="text-cyan-300 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">{f.t}</p>
                  <p className="text-white/65 text-sm leading-relaxed">{f.s}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <LeadForm utm={utmFromUrl(params)} />

        <section className="mt-8 text-center">
          <button onClick={goTry} className="w-full rounded-2xl bg-white text-[#1a1033] font-bold py-4">
            Задать вопрос репетитору бесплатно
          </button>
          <p className="text-white/40 text-xs mt-4">
            <Link to="/legal/privacy" className="underline">Политика конфиденциальности</Link> · <Link to="/" className="underline">Все возможности УЧИСЬПРО</Link>
          </p>
        </section>
      </main>
    </div>
  );
}

function LeadForm({ utm }: { utm: Record<string, string> }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [grade, setGrade] = useState("");
  const [agree, setAgree] = useState(true);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    if (name.trim().length < 2) return setMsg("Укажите имя");
    const contact = phone.trim();
    const isEmail = contact.includes("@");
    if (!isEmail && contact.replace(/\D/g, "").length < 10) return setMsg("Укажите телефон или email");
    if (!agree) return setMsg("Нужно согласие на обработку данных");
    setMsg("");
    setState("sending");
    try {
      const res = await fetch(`${CONTACT_URL}?action=partner_lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_name: name.trim(),
          contact_phone: isEmail ? "" : contact,
          contact_email: isEmail ? contact : "",
          audience_type: "parent",
          topic: grade ? `Класс: ${grade}` : "",
          message: "Заявка с посадочной страницы /start: подобрать план занятий",
          utm,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Не получилось отправить");
      setState("done");
      setMsg(data.message || "Спасибо! Мы свяжемся с вами.");
      trackGoal("start_lead");
    } catch (err) {
      setState("idle");
      setMsg(err instanceof Error ? err.message : "Не получилось отправить");
    }
  };

  return (
    <section className="mt-8 rounded-3xl border border-violet-400/25 bg-gradient-to-br from-violet-600/15 to-cyan-600/10 p-5">
      <h2 className="font-montserrat font-black text-xl mb-1">Нужна помощь с выбором?</h2>
      <p className="text-white/65 text-sm mb-4">Оставьте контакт — подскажем, с чего начать именно вашему ребёнку. Бесплатно и без навязывания.</p>
      {state === "done" ? (
        <div className="flex items-center gap-2 text-emerald-200 text-sm"><Icon name="CircleCheck" size={18} /> {msg}</div>
      ) : (
        <form onSubmit={submit} className="space-y-2.5">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя" className="w-full rounded-xl bg-white/[0.08] border border-white/15 px-3.5 py-3.5 text-[16px] placeholder:text-white/45 outline-none focus:border-violet-400/60" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Телефон или email" inputMode="tel" className="w-full rounded-xl bg-white/[0.08] border border-white/15 px-3.5 py-3.5 text-[16px] placeholder:text-white/45 outline-none focus:border-violet-400/60" />
          <div className="flex flex-wrap gap-1.5">
            {GRADES.map((g) => (
              <button type="button" key={g} onClick={() => setGrade(g === grade ? "" : g)} className={`rounded-full px-3 py-1.5 text-xs border ${grade === g ? "bg-violet-500/30 border-violet-400/60" : "border-white/15 bg-white/5 text-white/75"}`}>
                {g}
              </button>
            ))}
          </div>
          <label className="flex items-start gap-2 text-[11px] text-white/55">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" />
            <span>Согласен на обработку персональных данных по <Link to="/legal/privacy" className="underline">политике конфиденциальности</Link></span>
          </label>
          <button type="submit" disabled={state === "sending"} className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 py-3.5 font-bold disabled:opacity-60">
            {state === "sending" ? "Отправляем…" : "Получить план занятий"}
          </button>
          {msg && <p className="text-rose-300 text-xs">{msg}</p>}
        </form>
      )}
    </section>
  );
}
