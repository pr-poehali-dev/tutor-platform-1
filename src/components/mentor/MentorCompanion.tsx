import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";
import { useZnaika } from "@/context/ZnaikaContext";
import {
  AGE_OPTIONS,
  AgeGroup,
  MentorMessage,
  MentorProfile,
  QUICK_PROMPTS,
  ageForGroup,
  askMentor,
  daysSinceSeen,
  getAgeGroup,
  markSeen,
  setAgeGroup,
} from "./mentorData";

/**
 * ИИ-наставник-мотиватор «Маяк» — виджет-компаньон.
 * Видит прогресс ученика, мягко мотивирует, ставит цель дня и возвращает к учёбе.
 * Тон адаптируется под возраст (от малыша до 60+).
 */
export default function MentorCompanion() {
  const { user, isAuthenticated } = useAuth();
  const { state: znaika } = useZnaika();

  const [ageGroup, setAge] = useState<AgeGroup | null>(getAgeGroup());
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const inactiveDays = useMemo(() => daysSinceSeen(), []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    markSeen();
  }, []);

  const buildProfile = (): MentorProfile => {
    const p: MentorProfile = {};
    if (user?.name) p.name = user.name;
    if (ageGroup) p.age = ageForGroup(ageGroup);
    if (znaika) {
      p.streak = znaika.current_streak;
      p.znaika = znaika.balance;
    }
    if (inactiveDays > 0) p.days_inactive = inactiveDays;
    return p;
  };

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg || loading) return;
    setError(null);
    setExpanded(true);
    const next = [...messages, { from: "user" as const, text: msg }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const reply = await askMentor(msg, messages, buildProfile());
      setMessages([...next, { from: "mentor", text: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Наставник недоступен");
    } finally {
      setLoading(false);
    }
  };

  // Приветствие наставника — зависит от прогресса и активности.
  const greeting = useMemo(() => {
    const name = user?.name ? `, ${user.name}` : "";
    if (inactiveDays >= 3) {
      return `Рад тебя видеть снова${name}! Возвращение — это уже шаг. Начнём с малого?`;
    }
    if (znaika && znaika.current_streak >= 2) {
      return `Отличная серия — ${znaika.current_streak} дн. подряд${name}! Держим ритм. Чем займёмся сегодня?`;
    }
    return `Привет${name}! Я Маяк — твой наставник. Помогу не бросить и двигаться маленькими шагами.`;
  }, [user?.name, znaika, inactiveDays]);

  // Выбор возраста при первом запуске
  if (!ageGroup) {
    return (
      <div className="rounded-3xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 p-6 md:p-7">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/20 flex items-center justify-center text-2xl">
            🧭
          </div>
          <div>
            <h3 className="font-montserrat font-black text-lg text-white">Маяк — твой ИИ-наставник</h3>
            <p className="text-white/55 text-sm">Подберу тон под тебя. Для кого занимаемся?</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {AGE_OPTIONS.map((o) => (
            <button
              key={o.id}
              onClick={() => {
                setAgeGroup(o.id);
                setAge(o.id);
              }}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-left hover:border-cyan-500/40 hover:bg-cyan-500/[0.06] transition-all"
            >
              <span className="text-xl">{o.emoji}</span>
              <span className="text-white/85 text-sm font-medium">{o.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 p-5 md:p-6">
      {/* Шапка */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/20 flex items-center justify-center text-2xl flex-shrink-0">
          🧭
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-montserrat font-black text-lg text-white">Маяк</h3>
            <span className="text-cyan-300/80 text-[11px] font-bold uppercase tracking-wide">наставник 24/7</span>
          </div>
          <p className="text-white/70 text-sm">{greeting}</p>
        </div>
        <button
          onClick={() => {
            setAgeGroup("adult");
            setAge(null);
          }}
          title="Сменить возраст"
          className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0"
        >
          <Icon name="Settings2" size={16} />
        </button>
      </div>

      {/* Полоска прогресса (если залогинен) */}
      {isAuthenticated && znaika && (
        <div className="flex items-center gap-3 mb-4 text-sm">
          <span className="inline-flex items-center gap-1 text-orange-300">
            <Icon name="Flame" size={15} /> {znaika.current_streak} дн.
          </span>
          <span className="inline-flex items-center gap-1 text-yellow-300">
            <Icon name="Coins" size={15} /> {znaika.balance} ЗНАЕК
          </span>
        </div>
      )}

      {/* Диалог */}
      {expanded && messages.length > 0 && (
        <div
          ref={scrollRef}
          className="max-h-64 overflow-y-auto space-y-2 mb-3 pr-1"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`text-sm rounded-2xl px-3 py-2 max-w-[90%] ${
                m.from === "mentor"
                  ? "bg-white/[0.06] text-white/85"
                  : "bg-cyan-500/20 text-white ml-auto"
              }`}
            >
              {m.text}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-white/50 text-sm px-3 py-2">
              <Icon name="Loader2" size={14} className="animate-spin" /> Маяк думает...
            </div>
          )}
        </div>
      )}

      {error && <div className="text-rose-300 text-xs mb-2">{error}</div>}

      {/* Быстрые цели */}
      {!expanded && (
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full border border-white/12 bg-white/[0.04] text-white/75 hover:border-cyan-500/40 hover:text-white transition-all disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Поле ввода */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Напиши наставнику..."
          className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/40"
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          className="inline-flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold px-4 rounded-xl disabled:opacity-50 hover:scale-[1.03] transition-transform"
        >
          <Icon name="Send" size={16} />
        </button>
      </div>
    </div>
  );
}
