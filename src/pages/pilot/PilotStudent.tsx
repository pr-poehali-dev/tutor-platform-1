import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/context/AccessContext";
import { trackGoal } from "@/components/analytics/YandexMetrika";
import { PilotSchool, pendingJoin, pilotApi } from "@/components/pilot/api";

const GRADES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
const LETTERS = ["", "А", "Б", "В", "Г", "Д", "Е"];

const fmt = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Moscow" }) : "31.05.2027";

/**
 * Страница школы для учеников: /s/КОД. Ученик выбирает класс, входит — и доступ
 * открывается сам, без промокода. Если вход ушёл на Яндекс, активация завершится
 * при возвращении (см. PilotPendingJoin).
 */
export default function PilotStudent() {
  const { code = "" } = useParams();
  const { isAuthenticated, openLogin, token, loading } = useAuth();
  const { refreshAccess } = useAccess();
  const [school, setSchool] = useState<PilotSchool | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [grade, setGrade] = useState("");
  const [letter, setLetter] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [doneUntil, setDoneUntil] = useState<string | null>(null);
  const waitingLogin = useRef(false);

  const classLabel = grade ? `${grade}${letter}` : "";

  useEffect(() => {
    pilotApi.school(code).then((r) => (r.ok ? setSchool(r.school) : setNotFound(true)));
  }, [code]);

  const activate = async (label: string) => {
    if (!token) return;
    setBusy(true);
    setError("");
    const r = await pilotApi.activate(token, code, label);
    setBusy(false);
    pendingJoin.clear();
    if (!r.ok) return setError(r.error || "Не удалось открыть доступ");
    trackGoal("pilot_student_activated", { school: code, already: r.already });
    setDoneUntil(r.expires_at);
    refreshAccess();
  };

  // Вошёл через окно входа на этой же странице — активируем без второго нажатия.
  useEffect(() => {
    if (isAuthenticated && waitingLogin.current) {
      waitingLogin.current = false;
      activate(classLabel);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const start = () => {
    if (!grade) return setError("Выберите класс");
    if (!isAuthenticated) {
      pendingJoin.set(code, classLabel);
      waitingLogin.current = true;
      openLogin();
      return;
    }
    activate(classLabel);
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo title={school ? `${school.school_name} — бесплатный доступ к УЧИСЬПРО` : "Бесплатный доступ для учеников"} description="Бесплатный доступ к ИИ-наставнику и курсам для учеников школы — участницы пилотного проекта." noindex />
      <header className="border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-xl items-center px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 text-lg">🎓</div>
            <span className="font-montserrat font-black gradient-text-purple">УЧИСЬПРО</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-5 py-8">
        {notFound ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center">
            <Icon name="SearchX" size={36} className="mx-auto mb-3 text-white/50" />
            <p className="mb-1 text-lg font-bold">Ссылка школы не найдена</p>
            <p className="mb-4 text-sm text-white/60">Проверьте адрес у классного руководителя или подключитесь по промокоду города.</p>
            <Link to="/pilot" className="font-bold text-cyan-200 hover:underline">
              Найти свой город
            </Link>
          </div>
        ) : !school ? (
          <div className="flex h-60 items-center justify-center text-white/60">
            <Icon name="Loader2" size={24} className="mr-2 animate-spin" /> Загружаем…
          </div>
        ) : doneUntil ? (
          <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20">
              <Icon name="CheckCircle2" size={30} className="text-emerald-300" />
            </div>
            <h1 className="mb-2 font-montserrat text-2xl font-black">Доступ открыт!</h1>
            <p className="mb-6 text-white/75">
              Все школьные курсы и ИИ-наставник бесплатны для тебя до <b className="text-white">{fmt(doneUntil)}</b>.
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/super-courses" className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 py-3.5 font-black">
                <Icon name="Bot" size={18} /> Задать вопрос ИИ-наставнику
              </Link>
              <Link to="/courses" className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 py-3.5 font-bold hover:bg-white/10">
                <Icon name="BookOpen" size={18} /> Все курсы
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/35 bg-cyan-500/15 px-4 py-1.5">
                <Icon name="School" size={13} className="text-cyan-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-100">{school.city_name}</span>
              </div>
              <h1 className="mb-2 font-montserrat text-2xl font-black leading-tight md:text-3xl">{school.school_name}</h1>
              <p className="text-white/70">Твоя школа подключила бесплатный доступ к УЧИСЬПРО до 31 мая 2027 года.</p>
            </div>

            <div className="rounded-3xl border border-white/12 bg-white/[0.04] p-5 md:p-6">
              <p className="mb-2 font-bold">В каком ты классе?</p>
              <div className="mb-3 grid grid-cols-6 gap-1.5">
                {GRADES.map((g) => (
                  <button
                    key={g}
                    onClick={() => {
                      setGrade(g);
                      setError("");
                    }}
                    className={`rounded-lg py-2.5 font-bold ${grade === g ? "bg-violet-500 text-white" : "bg-white/5 text-white/80 hover:bg-white/10"}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              {grade && (
                <div className="mb-4 flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-xs text-white/50">Буква:</span>
                  {LETTERS.map((l) => (
                    <button
                      key={l || "none"}
                      onClick={() => setLetter(l)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-bold ${letter === l ? "bg-cyan-500 text-slate-900" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
                    >
                      {l || "нет"}
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={start}
                disabled={busy || loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 py-4 text-lg font-black transition-transform hover:scale-[1.01] disabled:opacity-60"
              >
                <Icon name={busy ? "Loader2" : isAuthenticated ? "Unlock" : "LogIn"} size={20} className={busy ? "animate-spin" : ""} />
                {isAuthenticated ? "Получить доступ" : "Войти и получить доступ"}
              </button>
              <p className="mt-2 text-center text-xs text-white/45">
                {isAuthenticated ? "Доступ откроется сразу" : "Вход через почту или Яндекс ID — 1 минута. Оплата не нужна."}
              </p>
              {error && (
                <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-rose-300">
                  <Icon name="CircleAlert" size={15} /> {error}
                </p>
              )}
            </div>

            <ul className="mt-6 space-y-2.5 text-sm text-white/75">
              {[
                ["Bot", "ИИ-наставник 24/7: объясняет тему и подводит к ответу"],
                ["Camera", "Разбор домашки по фото — по шагам"],
                ["BookOpen", "Курсы 1–11 класса, подготовка к ОГЭ и ЕГЭ"],
              ].map(([icon, text]) => (
                <li key={text} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <Icon name={icon} size={18} className="shrink-0 text-cyan-300" /> {text}
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
