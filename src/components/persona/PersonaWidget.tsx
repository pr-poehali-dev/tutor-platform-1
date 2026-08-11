import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import PersonaFace from "./PersonaFace";
import usePersonaChat from "./usePersonaChat";
import { Persona, getPersona } from "./personaTypes";

interface Props {
  /** Кого показываем. По умолчанию — консультант Дмитрий. */
  personaId?: string;
  /** Своя персона (из студии) — важнее personaId. */
  persona?: Persona;
  /** Сторона экрана. */
  side?: "right" | "left";
  /** Открыть сразу развёрнутым. */
  defaultOpen?: boolean;
}

/**
 * Виджет говорящей ИИ-персоны в углу экрана.
 *
 * Свёрнутый вид — круглый портрет с живым лицом (моргает и дышит).
 * По клику разворачивается в окно диалога: пользователь пишет вопрос,
 * персона отвечает голосом, губы двигаются под речь.
 */
export default function PersonaWidget({
  personaId = "dmitry",
  persona: personaProp,
  side = "right",
  defaultOpen = false,
}: Props) {
  const persona = personaProp || getPersona(personaId);
  const [open, setOpen] = useState(defaultOpen);
  const [input, setInput] = useState("");
  const greetedRef = useRef(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  const { messages, phase, level, muted, setMuted, ask, greet, stopSpeaking } =
    usePersonaChat(persona);

  // Первое приветствие — только после клика пользователя:
  // браузер не даст воспроизвести звук без действия человека.
  useEffect(() => {
    if (open && !greetedRef.current) {
      greetedRef.current = true;
      greet();
    }
  }, [open, greet]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, phase]);

  const send = () => {
    const t = input.trim();
    if (!t || phase === "thinking") return;
    setInput("");
    ask(t);
  };

  const posClass = side === "right" ? "right-4 md:right-6" : "left-4 md:left-6";

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label={`Спросить: ${persona.fullName}`}
        className={`fixed bottom-4 md:bottom-6 ${posClass} z-40 group`}
      >
        <span className="relative block">
          <span
            className="block w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 shadow-2xl"
            style={{ borderColor: persona.accent, boxShadow: `0 0 28px ${persona.accent}55` }}
          >
            <PersonaFace persona={persona} level={0} speaking={false} className="w-full h-full" />
          </span>
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background"
            style={{ background: "#22c55e" }}
          />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black/85 text-white text-xs font-semibold px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
            Спросить {persona.name}
          </span>
        </span>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-4 md:bottom-6 ${posClass} z-40 w-[calc(100vw-2rem)] max-w-sm rounded-3xl overflow-hidden border bg-[#0f1017]/97 backdrop-blur-xl shadow-2xl`}
      style={{ borderColor: `${persona.accent}55` }}
    >
      {/* Лицо */}
      <div className="relative h-56 bg-black/40">
        <PersonaFace
          persona={persona}
          level={level}
          speaking={phase === "speaking"}
          thinking={phase === "thinking"}
          className="w-full h-full"
        />

        <div className="absolute top-0 inset-x-0 flex items-start justify-between p-3 bg-gradient-to-b from-black/70 to-transparent">
          <div>
            <div className="text-white font-bold text-sm leading-tight">{persona.fullName}</div>
            <div className="text-white/65 text-[11px]">{persona.job}</div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setMuted(!muted);
                if (!muted) stopSpeaking();
              }}
              aria-label={muted ? "Включить голос" : "Выключить голос"}
              className="w-8 h-8 rounded-full bg-black/55 hover:bg-black/75 flex items-center justify-center text-white transition-colors"
            >
              <Icon name={muted ? "VolumeX" : "Volume2"} size={15} />
            </button>
            <button
              onClick={() => {
                stopSpeaking();
                setOpen(false);
              }}
              aria-label="Свернуть"
              className="w-8 h-8 rounded-full bg-black/55 hover:bg-black/75 flex items-center justify-center text-white transition-colors"
            >
              <Icon name="X" size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Диалог */}
      <div ref={listRef} className="max-h-56 overflow-y-auto px-3 py-3 space-y-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`text-sm leading-relaxed rounded-2xl px-3 py-2 ${
              m.from === "user"
                ? "bg-white/10 text-white ml-8"
                : "bg-white/5 text-white/90 mr-4"
            }`}
          >
            {m.text}
          </div>
        ))}
        {phase === "thinking" && (
          <div className="text-white/45 text-xs px-1">{persona.name} печатает…</div>
        )}
      </div>

      {/* Быстрые вопросы — снимают ступор «а что спросить» */}
      {messages.length <= 1 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {persona.quickAsks.map((q) => (
            <button
              key={q}
              onClick={() => ask(q)}
              className="text-[11px] px-2.5 py-1.5 rounded-full border border-white/15 text-white/70 hover:text-white hover:border-white/35 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Ввод */}
      <div className="p-3 pt-1 flex items-center gap-2 border-t border-white/10">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={`Спросите ${persona.name}…`}
          className="flex-1 bg-white/8 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:bg-white/12 transition-colors"
        />
        <button
          onClick={send}
          disabled={!input.trim() || phase === "thinking"}
          aria-label="Отправить"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-opacity"
          style={{ background: persona.accent }}
        >
          <Icon name="Send" size={16} />
        </button>
      </div>
    </div>
  );
}
