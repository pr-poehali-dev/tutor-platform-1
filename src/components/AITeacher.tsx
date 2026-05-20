import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

// ─── BACKEND URLs ─────────────────────────────────────────────────────────────
const AI_CHAT_URL = "https://functions.poehali.dev/d2f39a05-0f9a-44a1-a65e-cace2e81c84b";
const TTS_URL = "https://functions.poehali.dev/fa3b03da-815c-4f28-baf2-1a88e36fca8d";

// ─── DATA ────────────────────────────────────────────────────────────────────

interface Teacher {
  id: string;
  name: string;
  fullName: string;
  age: number;
  subject: string;
  image: string;
  voice: string;
  style: string;
  color: string;
  accent: string;
  badge: string;
  traits: string[];
  greeting: string;
}

const TEACHERS: Teacher[] = [
  {
    id: "alex",
    name: "Алекс",
    fullName: "Алексей Орлов",
    age: 32,
    subject: "Математика",
    image: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/85df8459-c320-41c1-a41c-3b73de815009.jpg",
    voice: "Мужской · уверенный",
    style: "Преподаватель МФТИ",
    color: "from-purple-600 to-blue-600",
    accent: "#a855f7",
    badge: "10 лет опыта · 90+ ЕГЭ",
    traits: ["Логика", "Лайфхаки", "Глубокое понимание"],
    greeting: "Здравствуйте! Я Алексей, ваш преподаватель математики. Готов разобрать любую тему — от базовой алгебры до олимпиадных задач. О чём поговорим сегодня?",
  },
  {
    id: "sofia",
    name: "София",
    fullName: "София Беккер",
    age: 29,
    subject: "Английский",
    image: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/9828f3eb-1c3b-464a-84d0-272f0b389cb3.jpg",
    voice: "Женский · мягкий",
    style: "Носитель языка (C2)",
    color: "from-pink-500 to-rose-600",
    accent: "#f72585",
    badge: "Cambridge CELTA · 7 лет",
    traits: ["Живая речь", "Произношение", "Современный English"],
    greeting: "Hi there! Я София. Учу английскому через живой язык — фильмы, диалоги, реальные ситуации. Что хочешь подтянуть: грамматику, разговорную речь или подготовку к экзамену?",
  },
  {
    id: "dmitry",
    name: "Дмитрий",
    fullName: "Дмитрий Волков",
    age: 35,
    subject: "Физика",
    image: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/c1afd5d7-869f-49e3-885f-32257ce00c0a.jpg",
    voice: "Мужской · спокойный",
    style: "Кандидат физ-мат наук",
    color: "from-cyan-500 to-blue-600",
    accent: "#00d4ff",
    badge: "PhD · 12 лет преподавания",
    traits: ["Эксперименты", "Глубина", "Простые объяснения"],
    greeting: "Добрый день. Я Дмитрий. Физика — это не страшно: главное понять идею, а не зазубрить формулы. С какой темой нужна помощь?",
  },
  {
    id: "nika",
    name: "Ника",
    fullName: "Виктория Снежина",
    age: 30,
    subject: "Русский язык",
    image: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/8d5fd6de-e689-4542-8c8b-01d77d501142.jpg",
    voice: "Женский · тёплый",
    style: "Эксперт ЕГЭ по русскому",
    color: "from-rose-500 to-orange-500",
    accent: "#ff6b35",
    badge: "Филфак МГУ · 8 лет",
    traits: ["Мнемотехники", "Поддержка", "Чёткая методика"],
    greeting: "Здравствуйте! Я Виктория. Помогу разобраться с любым правилом русского — от орфографии до сочинения на ЕГЭ. С чего начнём?",
  },
];

interface LessonMessage {
  id: number;
  from: "teacher" | "student";
  text: string;
  type?: "question" | "praise" | "hint" | "task";
}

// ─── AVATAR DISPLAY ──────────────────────────────────────────────────────────

function AvatarDisplay({ teacher, isSpeaking, emotion, size = "md" }: {
  teacher: Teacher;
  isSpeaking: boolean;
  emotion: "neutral" | "happy" | "thinking" | "explaining";
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "lg" ? "w-48 h-48 md:w-56 md:h-56" : size === "sm" ? "w-20 h-20" : "w-36 h-36 md:w-44 md:h-44";

  const emotionFilter = {
    neutral: "none",
    happy: "saturate(1.15) brightness(1.05)",
    thinking: "saturate(0.85) brightness(0.95)",
    explaining: "saturate(1.1)",
  }[emotion];

  return (
    <div className="relative flex flex-col items-center">
      <div
        className={`relative ${dim} rounded-full transition-all duration-500 ${isSpeaking ? "scale-[1.04]" : "scale-100"}`}
        style={{
          boxShadow: isSpeaking
            ? `0 0 50px ${teacher.accent}80, 0 0 100px ${teacher.accent}30, inset 0 0 0 3px ${teacher.accent}`
            : `0 0 30px ${teacher.accent}40, inset 0 0 0 2px ${teacher.accent}60`,
        }}
      >
        {isSpeaking && (
          <>
            <div
              className="absolute -inset-2 rounded-full animate-ping"
              style={{ border: `2px solid ${teacher.accent}40`, animationDuration: "1.5s" }}
            />
            <div
              className="absolute -inset-5 rounded-full"
              style={{
                border: `1px solid ${teacher.accent}25`,
                animation: "ping 2s cubic-bezier(0,0,0.2,1) infinite",
              }}
            />
          </>
        )}

        <div className="absolute inset-0 rounded-full overflow-hidden">
          <img
            src={teacher.image}
            alt={teacher.name}
            className="w-full h-full object-cover transition-all duration-300"
            style={{ filter: emotionFilter }}
          />
          <div
            className="absolute inset-0 mix-blend-overlay opacity-20"
            style={{ background: `linear-gradient(135deg, ${teacher.accent}, transparent 60%)` }}
          />
          {emotion !== "neutral" && (
            <div className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-white/95 flex items-center justify-center text-xl shadow-lg animate-fade-in">
              {emotion === "happy" ? "😊" : emotion === "thinking" ? "🤔" : "💡"}
            </div>
          )}
        </div>

        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block"></span>
          <span className="text-white text-xs font-bold">LIVE</span>
        </div>
      </div>

      {isSpeaking && (
        <div className="flex items-end gap-1 mt-3 h-5">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div
              key={i}
              className="w-1 rounded-full"
              style={{
                backgroundColor: teacher.accent,
                animation: `soundBar 0.5s ease-in-out ${i * 0.08}s infinite alternate`,
                minHeight: "4px",
                height: "16px",
              }}
            />
          ))}
        </div>
      )}

      <div
        className="mt-3 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2"
        style={{ background: `${teacher.accent}20`, color: teacher.accent, border: `1px solid ${teacher.accent}40` }}
      >
        <span>{teacher.fullName}</span>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function AITeacher() {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher>(TEACHERS[0]);
  const [demoActive, setDemoActive] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState<LessonMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [emotion, setEmotion] = useState<"neutral" | "happy" | "thinking" | "explaining">("neutral");
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userXP, setUserXP] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [visibleMessages, isLoading]);

  // ─── TTS ───
  const speak = async (text: string, teacherId: string) => {
    if (!voiceEnabled) return;
    try {
      const res = await fetch(TTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, teacher_id: teacherId }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.audio_base64) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(`data:${data.mime || "audio/mpeg"};base64,${data.audio_base64}`);
        audioRef.current = audio;
        setIsSpeaking(true);
        audio.onended = () => { setIsSpeaking(false); setEmotion("neutral"); };
        audio.onerror = () => { setIsSpeaking(false); setEmotion("neutral"); };
        await audio.play();
      }
    } catch {
      // silent fail — chat still works
    }
  };

  // ─── AI Chat ───
  const askAI = async (userMsg: string) => {
    setIsLoading(true);
    setError(null);
    setEmotion("thinking");
    try {
      const res = await fetch(AI_CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher_id: selectedTeacher.id,
          message: userMsg,
          history: visibleMessages,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Ошибка ИИ-преподавателя");
      }
      const reply = data.reply || "Извини, не смог ответить. Попробуй переформулировать.";
      const newMsg: LessonMessage = { id: Date.now(), from: "teacher", text: reply, type: "hint" };
      setVisibleMessages(prev => [...prev, newMsg]);
      setUserXP(p => p + 20);
      setEmotion("explaining");
      await speak(reply, selectedTeacher.id);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Неизвестная ошибка";
      setError(msg);
      setEmotion("neutral");
    } finally {
      setIsLoading(false);
    }
  };

  const startDemo = async (teacher: Teacher) => {
    if (audioRef.current) audioRef.current.pause();
    setSelectedTeacher(teacher);
    setDemoActive(true);
    setVisibleMessages([{ id: 0, from: "teacher", text: teacher.greeting, type: "question" }]);
    setUserXP(0);
    setError(null);
    setEmotion("happy");
    await speak(teacher.greeting, teacher.id);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    const msg = inputText.trim();
    setVisibleMessages(prev => [...prev, { id: Date.now(), from: "student", text: msg }]);
    setInputText("");
    await askAI(msg);
  };

  const stopDemo = () => {
    if (audioRef.current) audioRef.current.pause();
    setDemoActive(false);
    setVisibleMessages([]);
    setIsSpeaking(false);
    setEmotion("neutral");
  };

  return (
    <section id="ai-teacher" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/25 rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse inline-block"></span>
            <span className="text-sm text-purple-300 font-medium">Polza.ai + Yandex SpeechKit · работает в реальном времени</span>
          </div>
          <h2 className="font-montserrat font-black text-3xl md:text-5xl text-white mb-4">
            Твой персональный{" "}
            <span className="gradient-text-purple">ИИ‑преподаватель</span>
          </h2>
          <p className="text-white/55 text-lg max-w-2xl mx-auto">
            Полная замена репетитора: умные ответы, живой голос, бесконечное терпение. Доступен 24/7 и стоит в 10 раз дешевле.
          </p>
        </div>

        {!demoActive ? (
          <>
            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { icon: "🎙️", title: "Живой голос", desc: "Yandex SpeechKit с эмоциями" },
                { icon: "🧠", title: "GPT-4 ядро", desc: "Polza.ai отвечает мгновенно" },
                { icon: "💬", title: "Реальный диалог", desc: "Любые вопросы, любой темп" },
                { icon: "💰", title: "От 0 ₽", desc: "Без оплаты по часам" },
              ].map(f => (
                <div key={f.title} className="bg-card/50 border border-white/8 rounded-2xl p-4 text-center card-hover">
                  <div className="text-3xl mb-2">{f.icon}</div>
                  <div className="font-montserrat font-bold text-sm text-white mb-1">{f.title}</div>
                  <div className="text-white/40 text-xs">{f.desc}</div>
                </div>
              ))}
            </div>

            {/* Teacher picker */}
            <div className="mb-8">
              <h3 className="font-montserrat font-black text-xl text-white mb-6 text-center">
                Выбери своего преподавателя
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {TEACHERS.map(teacher => (
                  <div
                    key={teacher.id}
                    onClick={() => setSelectedTeacher(teacher)}
                    className={`relative bg-card/60 border rounded-2xl p-5 cursor-pointer transition-all duration-300 card-hover text-center ${
                      selectedTeacher.id === teacher.id
                        ? "scale-[1.02]"
                        : "border-white/8 hover:border-white/20"
                    }`}
                    style={selectedTeacher.id === teacher.id ? {
                      borderColor: teacher.accent,
                      boxShadow: `0 0 20px ${teacher.accent}30`,
                    } : {}}
                  >
                    {selectedTeacher.id === teacher.id && (
                      <div className="absolute top-2.5 right-2.5">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: teacher.accent }}>
                          <Icon name="Check" size={11} className="text-white" />
                        </div>
                      </div>
                    )}

                    <div
                      className="relative w-28 h-28 rounded-2xl overflow-hidden mx-auto mb-3"
                      style={{
                        boxShadow: selectedTeacher.id === teacher.id ? `0 4px 24px ${teacher.accent}60, inset 0 0 0 2px ${teacher.accent}` : `inset 0 0 0 1px ${teacher.accent}40`,
                      }}
                    >
                      <img src={teacher.image} alt={teacher.name} className="w-full h-full object-cover" />
                      <div
                        className="absolute inset-0 mix-blend-overlay opacity-25"
                        style={{ background: `linear-gradient(135deg, ${teacher.accent}, transparent 65%)` }}
                      />
                      <div className="absolute bottom-1.5 right-1.5 w-3 h-3 rounded-full bg-neon-green border-2 border-card"></div>
                    </div>

                    <p className="font-montserrat font-black text-base text-white mb-0.5">{teacher.fullName}</p>
                    <p className="text-xs mb-3" style={{ color: teacher.accent }}>{teacher.subject} · {teacher.age} лет</p>

                    <div className="flex flex-wrap justify-center gap-1 mb-3">
                      {teacher.traits.map(t => (
                        <span key={t} className="text-xs bg-white/8 text-white/50 px-2 py-0.5 rounded-lg">{t}</span>
                      ))}
                    </div>

                    <div className="text-xs bg-white/5 rounded-xl px-2 py-1.5 text-white/50">
                      🎙 {teacher.voice}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected teacher CTA */}
            <div
              className="rounded-3xl p-6 md:p-8 border flex flex-col md:flex-row gap-6 items-center"
              style={{
                background: `linear-gradient(135deg, ${selectedTeacher.accent}15, transparent)`,
                borderColor: `${selectedTeacher.accent}30`,
              }}
            >
              <div className="flex-shrink-0">
                <AvatarDisplay teacher={selectedTeacher} isSpeaking={false} emotion="happy" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mb-3"
                  style={{ background: `${selectedTeacher.accent}20`, color: selectedTeacher.accent, border: `1px solid ${selectedTeacher.accent}30` }}
                >
                  ⭐ {selectedTeacher.badge}
                </div>
                <h3 className="font-montserrat font-black text-2xl text-white mb-2">
                  {selectedTeacher.fullName}
                </h3>
                <p className="text-white/55 text-sm leading-relaxed mb-5 max-w-lg">
                  {selectedTeacher.greeting}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <button
                    onClick={() => startDemo(selectedTeacher)}
                    className="flex items-center gap-2 text-white font-bold px-6 py-3.5 rounded-2xl text-sm hover:opacity-90 transition-all"
                    style={{ background: `linear-gradient(135deg, ${selectedTeacher.accent}, ${selectedTeacher.accent}cc)`, boxShadow: `0 4px 20px ${selectedTeacher.accent}40` }}
                  >
                    <Icon name="Play" size={16} />
                    Начать занятие
                  </button>
                  <button
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className="flex items-center gap-2 border text-white/60 hover:text-white text-sm font-medium px-5 py-3.5 rounded-2xl transition-all hover:border-white/30"
                    style={{ borderColor: `${selectedTeacher.accent}30` }}
                  >
                    <Icon name={voiceEnabled ? "Volume2" : "VolumeX"} size={15} />
                    Голос {voiceEnabled ? "вкл" : "выкл"}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* ── LIVE LESSON ── */
          <div className="grid md:grid-cols-[280px_1fr] gap-6">

            {/* Left panel */}
            <div className="flex flex-col gap-4">
              <div
                className="rounded-3xl p-6 border flex flex-col items-center"
                style={{
                  background: `linear-gradient(160deg, ${selectedTeacher.accent}15, transparent)`,
                  borderColor: `${selectedTeacher.accent}25`,
                }}
              >
                <AvatarDisplay teacher={selectedTeacher} isSpeaking={isSpeaking} emotion={emotion} />

                <div className="mt-4 w-full bg-white/5 rounded-xl px-3 py-2 text-center">
                  <p className="text-white/40 text-xs mb-1">Состояние</p>
                  <p className="text-sm font-medium" style={{ color: selectedTeacher.accent }}>
                    {isSpeaking ? "🎙️ Говорит..." : isLoading ? "🤔 Думает..." : emotion === "happy" ? "😊 Готов!" : "👂 Слушает"}
                  </p>
                </div>
              </div>

              {/* XP */}
              <div className="bg-card/60 border border-white/8 rounded-2xl p-4">
                <p className="text-white/50 text-xs mb-2">Заработано на уроке</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-montserrat font-black text-2xl text-yellow-400">{userXP}</span>
                  <span className="text-yellow-400 text-sm">XP</span>
                </div>
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(userXP / 2, 100)}%`, backgroundColor: selectedTeacher.accent }}
                  />
                </div>
              </div>

              {/* Voice toggle */}
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className="bg-card/60 border border-white/8 rounded-2xl p-3 flex items-center gap-2 text-sm text-white/60 hover:text-white hover:border-white/20 transition-all"
              >
                <Icon name={voiceEnabled ? "Volume2" : "VolumeX"} size={16} />
                Голос: {voiceEnabled ? "включён" : "выключен"}
              </button>

              <button
                onClick={stopDemo}
                className="flex items-center gap-2 text-white/40 hover:text-white text-xs transition-colors justify-center py-2"
              >
                <Icon name="ArrowLeft" size={13} />
                Завершить занятие
              </button>
            </div>

            {/* Chat */}
            <div className="flex flex-col">
              <div
                className="flex items-center gap-3 px-5 py-3.5 rounded-2xl mb-3 border"
                style={{ background: `${selectedTeacher.accent}10`, borderColor: `${selectedTeacher.accent}25` }}
              >
                <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0" style={{ boxShadow: `inset 0 0 0 2px ${selectedTeacher.accent}50` }}>
                  <img src={selectedTeacher.image} alt={selectedTeacher.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-montserrat font-bold text-sm text-white">{selectedTeacher.fullName}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-green inline-block animate-pulse"></span>
                    <span className="text-xs text-white/50">{selectedTeacher.subject} · В эфире</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${voiceEnabled ? "text-white" : "text-white/30"}`}
                    style={{ background: voiceEnabled ? `${selectedTeacher.accent}30` : "rgba(255,255,255,0.05)" }}
                  >
                    <Icon name={voiceEnabled ? "Volume2" : "VolumeX"} size={14} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={chatRef}
                className="flex-1 bg-card/40 border border-white/8 rounded-2xl p-4 overflow-y-auto flex flex-col gap-3 min-h-[380px] max-h-[420px]"
              >
                {visibleMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.from === "student" ? "flex-row-reverse" : "flex-row"} animate-fade-in`}
                  >
                    {msg.from === "teacher" && (
                      <div
                        className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 mt-0.5"
                        style={{ boxShadow: `inset 0 0 0 1.5px ${selectedTeacher.accent}60` }}
                      >
                        <img src={selectedTeacher.image} alt={selectedTeacher.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.from === "student"
                          ? "bg-purple-500/20 border border-purple-500/30 text-white rounded-tr-sm"
                          : "bg-white/6 border border-white/8 text-white/90 rounded-tl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                    {msg.from === "student" && (
                      <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-base flex-shrink-0 mt-0.5">
                        🧑
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-2.5 animate-fade-in">
                    <div
                      className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0"
                      style={{ boxShadow: `inset 0 0 0 1.5px ${selectedTeacher.accent}60` }}
                    >
                      <img src={selectedTeacher.image} alt={selectedTeacher.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="bg-white/6 border border-white/8 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-white/40"
                          style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-300 text-xs animate-fade-in">
                    ⚠️ {error}
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="mt-3 flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                    disabled={isLoading}
                    placeholder="Задай вопрос преподавателю..."
                    className="w-full bg-card/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors disabled:opacity-50"
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!inputText.trim() || isLoading}
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
                  style={{ background: inputText.trim() && !isLoading ? `linear-gradient(135deg, ${selectedTeacher.accent}, ${selectedTeacher.accent}aa)` : "rgba(255,255,255,0.05)" }}
                >
                  <Icon name="Send" size={16} className="text-white" />
                </button>
              </div>

              {/* Quick replies */}
              <div className="flex gap-2 mt-2 flex-wrap">
                {["Объясни подробнее", "Дай пример", "Что почитать по теме?"].map(q => (
                  <button
                    key={q}
                    onClick={() => setInputText(q)}
                    disabled={isLoading}
                    className="text-xs text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10 border border-white/8 px-3 py-1.5 rounded-xl transition-all disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom features */}
        {!demoActive && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: "🕐", title: "Доступен 24/7", desc: "Никаких отмен, опозданий и плохого настроения." },
              { icon: "🎯", title: "Запоминает контекст", desc: "Помнит, что ты не понял, и возвращается к этому." },
              { icon: "😌", title: "Без стресса", desc: "Не ругает за ошибки. Объясняет столько раз, сколько нужно." },
            ].map(f => (
              <div key={f.title} className="bg-card/50 border border-white/8 rounded-2xl p-5 card-hover">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h4 className="font-montserrat font-black text-base text-white mb-2">{f.title}</h4>
                <p className="text-white/45 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        )}

      </div>

      <style>{`
        @keyframes soundBar { from { height: 4px; } to { height: 20px; } }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </section>
  );
}
