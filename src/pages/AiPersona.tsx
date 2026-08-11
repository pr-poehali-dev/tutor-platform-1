import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import PersonaFace from "@/components/persona/PersonaFace";
import usePersonaChat from "@/components/persona/usePersonaChat";
import { ROLE_LABELS } from "@/components/persona/personaTypes";
import { allPersonas } from "@/components/persona/personaStorage";

const SITE = "https://учисьпро.рф";

/**
 * Живой разговор с ИИ-персоной: полноэкранный собеседник.
 *
 * Человек выбирает, с кем говорить, и задаёт вопросы — персона отвечает
 * голосом, лицо двигается в такт речи. Это витрина технологии и рабочий
 * инструмент одновременно.
 */
export default function AiPersona() {
  const people = useMemo(() => allPersonas(), []);
  const [activeId, setActiveId] = useState(people[0]?.id || "");
  const active = people.find((p) => p.id === activeId) || people[0];
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);

  const { messages, phase, level, muted, setMuted, ask, greet, stopSpeaking } =
    usePersonaChat(active);

  useEffect(() => () => stopSpeaking(), [stopSpeaking]);

  const start = () => {
    setStarted(true);
    greet();
  };

  const send = () => {
    const t = input.trim();
    if (!t || phase === "thinking") return;
    setInput("");
    ask(t);
  };

  if (!active) return null;

  return (
    <div className="min-h-screen bg-background text-white">
      <Seo
        title="Поговорить с ИИ-преподавателем голосом — УЧИСЬПРО"
        description="Живой диалог с ИИ-персоной: задайте вопрос голосом или текстом и получите ответ вслух. Репетитор, консультант и приёмная комиссия — отвечают как люди."
        canonical={`${SITE}/ai-persona`}
        keywords="ии-репетитор голосом, говорящий ассистент, ии-аватар, виртуальный преподаватель"
      />

      <header className="border-b border-white/10 sticky top-0 z-30 bg-background/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">
              🚀
            </div>
            <span className="font-montserrat font-black gradient-text-purple">УЧИСЬПРО</span>
          </Link>
          <Link to="/courses" className="text-white/60 hover:text-white text-sm font-bold transition-colors">
            Все курсы
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 pt-5">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Живой ИИ-собеседник" }]} />
      </div>

      <main className="max-w-6xl mx-auto px-4 pt-6 pb-14">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 px-3 py-1.5 text-xs font-bold text-purple-300 mb-4">
            <Icon name="Sparkles" size={13} />
            Отвечает голосом · лицо двигается в такт речи
          </span>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-3 leading-tight">
            Поговорите с ИИ вживую
          </h1>
          <p className="text-white/65 text-base md:text-lg max-w-2xl mx-auto">
            Выберите собеседника и задайте любой вопрос. Ответ прозвучит голосом — как в разговоре
            с живым человеком.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Собеседник */}
          <div className="rounded-3xl overflow-hidden border border-white/15 bg-black/30">
            <div className="relative aspect-[4/3] md:aspect-[16/10] bg-black/50">
              <PersonaFace
                persona={active}
                level={level}
                speaking={phase === "speaking"}
                thinking={phase === "thinking"}
                className="w-full h-full"
              />

              <div className="absolute top-0 inset-x-0 p-4 flex items-start justify-between bg-gradient-to-b from-black/70 to-transparent">
                <div>
                  <div className="font-bold">{active.fullName}</div>
                  <div className="text-white/60 text-xs">{active.job}</div>
                </div>
                <button
                  onClick={() => {
                    setMuted(!muted);
                    if (!muted) stopSpeaking();
                  }}
                  aria-label={muted ? "Включить голос" : "Выключить голос"}
                  className="w-9 h-9 rounded-full bg-black/55 hover:bg-black/75 flex items-center justify-center transition-colors"
                >
                  <Icon name={muted ? "VolumeX" : "Volume2"} size={16} />
                </button>
              </div>

              {!started && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[2px]">
                  <button
                    onClick={start}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 px-6 py-3.5 rounded-2xl font-bold hover:opacity-90 transition-opacity"
                  >
                    <Icon name="Mic" size={18} />
                    Начать разговор
                  </button>
                </div>
              )}
            </div>

            {/* Диалог */}
            {started && (
              <div className="p-4 space-y-3">
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`text-sm leading-relaxed rounded-2xl px-3.5 py-2.5 ${
                        m.from === "user"
                          ? "bg-white/10 ml-10"
                          : "bg-white/5 mr-6 text-white/90"
                      }`}
                    >
                      {m.text}
                    </div>
                  ))}
                  {phase === "thinking" && (
                    <div className="text-white/45 text-xs px-1">{active.name} думает…</div>
                  )}
                </div>

                {messages.length <= 1 && (
                  <div className="flex flex-wrap gap-2">
                    {active.quickAsks.map((q) => (
                      <button
                        key={q}
                        onClick={() => ask(q)}
                        className="text-xs px-3 py-2 rounded-full border border-white/15 text-white/70 hover:text-white hover:border-white/35 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder={`Спросите ${active.name}…`}
                    className="flex-1 bg-white/8 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white/12 transition-colors"
                  />
                  <button
                    onClick={send}
                    disabled={!input.trim() || phase === "thinking"}
                    aria-label="Отправить"
                    className="w-12 rounded-xl flex items-center justify-center disabled:opacity-40 transition-opacity"
                    style={{ background: active.accent }}
                  >
                    <Icon name="Send" size={17} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Выбор собеседника */}
          <aside className="space-y-3">
            <h2 className="font-bold text-sm text-white/70 px-1">Выберите собеседника</h2>
            {people.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  stopSpeaking();
                  setActiveId(p.id);
                  setStarted(false);
                }}
                className={`w-full flex items-center gap-3 rounded-2xl p-3 border text-left transition-colors ${
                  p.id === active.id
                    ? "bg-white/10 border-white/25"
                    : "border-white/10 hover:bg-white/5"
                }`}
              >
                <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover" />
                <div className="min-w-0">
                  <div className="font-bold text-sm truncate">{p.fullName}</div>
                  <div className="text-[11px] text-white/50 truncate">{p.job}</div>
                  <div
                    className="text-[10px] font-bold uppercase tracking-wider mt-0.5"
                    style={{ color: p.accent }}
                  >
                    {ROLE_LABELS[p.role]}
                  </div>
                </div>
              </button>
            ))}
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
