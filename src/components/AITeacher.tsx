import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

// ─── DATA ────────────────────────────────────────────────────────────────────

interface Teacher {
  id: string;
  name: string;
  subject: string;
  emoji: string;
  avatar: string;
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
    subject: "Математика",
    emoji: "🧑‍🏫",
    avatar: "👨‍💼",
    voice: "Мужской, спокойный",
    style: "Строгий математик",
    color: "from-purple-600 to-blue-600",
    accent: "#a855f7",
    badge: "Топ-1 по математике",
    traits: ["Точность", "Логика", "Терпение"],
    greeting: "Привет! Я Алекс, твой преподаватель математики. Сегодня разберём квадратные уравнения — это проще, чем кажется! Готов начать?",
  },
  {
    id: "sofia",
    name: "София",
    subject: "Английский",
    emoji: "👩‍🏫",
    avatar: "👩‍💼",
    voice: "Женский, энергичный",
    style: "Энергичная учительница",
    color: "from-pink-500 to-rose-600",
    accent: "#f72585",
    badge: "Носитель языка",
    traits: ["Юмор", "Практика", "Живые диалоги"],
    greeting: "Hey! Я София, и я обожаю английский! Сегодня поговорим как настоящие носители языка — никаких скучных правил, только живая речь!",
  },
  {
    id: "dmitry",
    name: "Дмитрий",
    subject: "Физика",
    emoji: "🧑‍🔬",
    avatar: "👨‍🔬",
    voice: "Мужской, глубокий",
    style: "Учёный-энтузиаст",
    color: "from-cyan-500 to-blue-600",
    accent: "#00d4ff",
    badge: "Кандидат наук",
    traits: ["Эксперименты", "Визуализация", "Глубина"],
    greeting: "Добро пожаловать! Я Дмитрий. Физика — это не формулы, это магия природы! Сегодня объясню механику так, что ты сам не заметишь, как всё поймёшь.",
  },
  {
    id: "natasha",
    name: "Наташа",
    subject: "Русский язык",
    emoji: "👩‍💻",
    avatar: "👩‍🎓",
    voice: "Женский, мягкий",
    style: "Добрый наставник",
    color: "from-rose-500 to-orange-500",
    accent: "#ff6b35",
    badge: "Эксперт ЕГЭ",
    traits: ["Поддержка", "Мнемотехники", "Понятность"],
    greeting: "Привет, дружок! Я Наташа. Русский — это не страшно, это увлекательно! Сегодня разберём орфографию так, что ты запомнишь навсегда.",
  },
];

interface LessonMessage {
  id: number;
  from: "teacher" | "student";
  text: string;
  type?: "question" | "praise" | "hint" | "task";
}

const DEMO_LESSON: LessonMessage[] = [
  { id: 1, from: "teacher", type: "question", text: "Привет! Сегодня разберём квадратные уравнения. Скажи, ты помнишь, что такое уравнение второй степени?" },
  { id: 2, from: "student", text: "Вроде помню, но не очень уверен..." },
  { id: 3, from: "teacher", type: "hint", text: "Не переживай! Квадратное уравнение — это ax² + bx + c = 0, где a ≠ 0. Ключевое: есть переменная в квадрате. Давай разберём на примере: 2x² - 5x + 3 = 0. Что здесь a, b и c?" },
  { id: 4, from: "student", text: "Наверное... a=2, b=-5, c=3?" },
  { id: 5, from: "teacher", type: "praise", text: "🎉 Точно! Отлично справился! Теперь найдём дискриминант по формуле D = b² - 4ac. Подставь числа — что получится?" },
  { id: 6, from: "student", text: "D = 25 - 24 = 1?" },
  { id: 7, from: "teacher", type: "praise", text: "Молодец, всё верно! D = 1 > 0, значит уравнение имеет два корня. Находим их по формуле x = (-b ± √D) / 2a. Попробуй сам вычислить!" },
];

const LESSON_STAGES = [
  { label: "Приветствие", icon: "👋", done: true },
  { label: "Теория", icon: "📖", done: true },
  { label: "Пример", icon: "✍️", done: false, active: true },
  { label: "Практика", icon: "🎯", done: false },
  { label: "Итог", icon: "🏆", done: false },
];

// ─── AVATAR COMPONENT ─────────────────────────────────────────────────────────

function AvatarDisplay({ teacher, isSpeaking, emotion }: {
  teacher: Teacher;
  isSpeaking: boolean;
  emotion: "neutral" | "happy" | "thinking" | "explaining";
}) {
  const emotionEmoji = {
    neutral: teacher.avatar,
    happy: "😄",
    thinking: "🤔",
    explaining: "🧑‍💻",
  }[emotion];

  return (
    <div className="relative flex flex-col items-center">
      {/* Glow ring */}
      <div
        className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center transition-all duration-500 ${isSpeaking ? "scale-105" : "scale-100"}`}
        style={{
          background: `linear-gradient(135deg, ${teacher.accent}30, ${teacher.accent}10)`,
          boxShadow: isSpeaking ? `0 0 40px ${teacher.accent}60, 0 0 80px ${teacher.accent}20` : `0 0 20px ${teacher.accent}20`,
          border: `2px solid ${teacher.accent}40`,
        }}
      >
        {/* Animated ring when speaking */}
        {isSpeaking && (
          <>
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{ backgroundColor: `${teacher.accent}15` }}
            />
            <div
              className="absolute -inset-3 rounded-full"
              style={{
                border: `1px solid ${teacher.accent}30`,
                animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
              }}
            />
          </>
        )}
        <span
          className="text-6xl md:text-7xl transition-all duration-300 select-none"
          style={{ filter: isSpeaking ? "drop-shadow(0 0 8px rgba(255,255,255,0.3))" : "none" }}
        >
          {emotionEmoji}
        </span>
      </div>

      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="flex items-center gap-1 mt-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className="w-1 rounded-full"
              style={{
                backgroundColor: teacher.accent,
                height: `${8 + Math.sin(Date.now() / 200 + i) * 8}px`,
                animation: `soundBar 0.6s ease-in-out ${i * 0.1}s infinite alternate`,
                minHeight: "4px",
                maxHeight: "20px",
              }}
            />
          ))}
        </div>
      )}

      {/* Name badge */}
      <div
        className="mt-3 px-4 py-1.5 rounded-full text-sm font-bold"
        style={{ background: `${teacher.accent}25`, color: teacher.accent, border: `1px solid ${teacher.accent}40` }}
      >
        {teacher.name} · {teacher.subject}
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
  const [msgIndex, setMsgIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [userXP, setUserXP] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [visibleMessages, isTyping]);

  // Auto-play demo messages
  useEffect(() => {
    if (!demoActive || msgIndex >= DEMO_LESSON.length) return;

    const msg = DEMO_LESSON[msgIndex];
    const delay = msg.from === "teacher" ? 1200 : 800;

    if (msg.from === "teacher") {
      setIsTyping(true);
    }

    const timer = setTimeout(() => {
      setIsTyping(false);
      setVisibleMessages(prev => [...prev, msg]);

      if (msg.from === "teacher") {
        setIsSpeaking(true);
        const emo = msg.type === "praise" ? "happy" : msg.type === "hint" ? "explaining" : msg.type === "question" ? "thinking" : "neutral";
        setEmotion(emo as typeof emotion);
        if (msg.type === "praise") setUserXP(p => p + 50);
        setTimeout(() => { setIsSpeaking(false); setEmotion("neutral"); }, 2500);
      }

      setTimeout(() => setMsgIndex(i => i + 1), msg.from === "teacher" ? 2800 : 1200);
    }, delay);

    return () => clearTimeout(timer);
  }, [demoActive, msgIndex]);

  const startDemo = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setDemoActive(true);
    setVisibleMessages([]);
    setMsgIndex(0);
    setUserXP(0);
    setIsSpeaking(false);
    setEmotion("neutral");
    // First greeting
    setTimeout(() => {
      setVisibleMessages([{ id: 0, from: "teacher", type: "question", text: teacher.greeting }]);
      setIsSpeaking(true);
      setEmotion("happy");
      setTimeout(() => { setIsSpeaking(false); setEmotion("neutral"); setMsgIndex(0); }, 3000);
    }, 500);
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;
    setVisibleMessages(prev => [...prev, { id: Date.now(), from: "student", text: inputText }]);
    setInputText("");
    // Simulate teacher response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setIsSpeaking(true);
      setEmotion("explaining");
      setVisibleMessages(prev => [...prev, {
        id: Date.now() + 1,
        from: "teacher",
        type: "hint",
        text: "Отличный вопрос! Давай разберём это подробнее. Ключевой момент здесь — обратить внимание на знаки перед коэффициентами. Попробуй ещё раз с этой подсказкой! 💡",
      }]);
      setUserXP(p => p + 20);
      setTimeout(() => { setIsSpeaking(false); setEmotion("neutral"); }, 2500);
    }, 1800);
  };

  return (
    <section id="ai-teacher" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/25 rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse inline-block"></span>
            <span className="text-sm text-purple-300 font-medium">ИИ-технология нового поколения</span>
          </div>
          <h2 className="font-montserrat font-black text-3xl md:text-5xl text-white mb-4">
            Твой личный{" "}
            <span className="gradient-text-purple">ИИ‑преподаватель</span>
          </h2>
          <p className="text-white/55 text-lg max-w-2xl mx-auto">
            Живой аватар объясняет, отвечает на вопросы и адаптируется под тебя — 24/7 без опозданий и плохого настроения
          </p>
        </div>

        {!demoActive ? (
          <>
            {/* Feature highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { icon: "🎙️", title: "Живой голос", desc: "Эмоциональный TTS с паузами и интонациями" },
                { icon: "🎭", title: "Мимика", desc: "Аватар реагирует на твои ответы" },
                { icon: "🧠", title: "ИИ-ядро", desc: "Адаптирует урок под твой уровень" },
                { icon: "💬", title: "Диалог", desc: "Задавай вопросы голосом или текстом" },
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
                        ? "border-opacity-60 scale-[1.02]"
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
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${teacher.color} flex items-center justify-center text-3xl mx-auto mb-3`}
                      style={{ boxShadow: selectedTeacher.id === teacher.id ? `0 4px 20px ${teacher.accent}40` : "none" }}
                    >
                      {teacher.emoji}
                    </div>

                    <p className="font-montserrat font-black text-base text-white mb-0.5">{teacher.name}</p>
                    <p className="text-xs mb-3" style={{ color: teacher.accent }}>{teacher.subject}</p>

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

            {/* Selected teacher details + CTA */}
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
                  Преподаватель {selectedTeacher.name}
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
                    Начать пробный урок
                  </button>
                  <button className="flex items-center gap-2 border text-white/60 hover:text-white text-sm font-medium px-5 py-3.5 rounded-2xl transition-all hover:border-white/30"
                    style={{ borderColor: `${selectedTeacher.accent}30` }}
                  >
                    <Icon name="Settings" size={15} />
                    Настроить аватар
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* ── LESSON DEMO ── */
          <div className="grid md:grid-cols-[280px_1fr] gap-6">

            {/* Left: avatar panel */}
            <div className="flex flex-col gap-4">
              {/* Avatar */}
              <div
                className="rounded-3xl p-6 border flex flex-col items-center"
                style={{
                  background: `linear-gradient(160deg, ${selectedTeacher.accent}15, transparent)`,
                  borderColor: `${selectedTeacher.accent}25`,
                }}
              >
                <AvatarDisplay teacher={selectedTeacher} isSpeaking={isSpeaking} emotion={emotion} />

                {/* Emotion state */}
                <div className="mt-4 w-full bg-white/5 rounded-xl px-3 py-2 text-center">
                  <p className="text-white/40 text-xs mb-1">Состояние</p>
                  <p className="text-sm font-medium" style={{ color: selectedTeacher.accent }}>
                    {isSpeaking ? "🎙️ Говорит..." : emotion === "thinking" ? "🤔 Думает..." : emotion === "happy" ? "😄 Доволен!" : "👂 Слушает"}
                  </p>
                </div>
              </div>

              {/* XP earned */}
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

              {/* Lesson stages */}
              <div className="bg-card/60 border border-white/8 rounded-2xl p-4">
                <p className="text-white/50 text-xs mb-3">Прогресс урока</p>
                <div className="flex flex-col gap-2">
                  {LESSON_STAGES.map((stage, i) => (
                    <div key={i} className={`flex items-center gap-2.5 text-sm ${stage.active ? "text-white" : stage.done ? "text-white/60" : "text-white/25"}`}>
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${
                          stage.done ? "bg-green-500/20 border border-green-500/40" :
                          stage.active ? "border" : "bg-white/5"
                        }`}
                        style={stage.active ? { borderColor: selectedTeacher.accent, backgroundColor: `${selectedTeacher.accent}20` } : {}}
                      >
                        {stage.done ? "✓" : stage.emoji}
                      </div>
                      <span className={stage.active ? "font-semibold" : ""}>{stage.label}</span>
                      {stage.active && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: selectedTeacher.accent }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Back button */}
              <button
                onClick={() => { setDemoActive(false); setVisibleMessages([]); setMsgIndex(0); }}
                className="flex items-center gap-2 text-white/40 hover:text-white text-xs transition-colors justify-center py-2"
              >
                <Icon name="ArrowLeft" size={13} />
                Сменить преподавателя
              </button>
            </div>

            {/* Right: chat */}
            <div className="flex flex-col">
              {/* Header */}
              <div
                className="flex items-center gap-3 px-5 py-3.5 rounded-2xl mb-3 border"
                style={{ background: `${selectedTeacher.accent}10`, borderColor: `${selectedTeacher.accent}25` }}
              >
                <span className="text-2xl">{selectedTeacher.emoji}</span>
                <div className="flex-1">
                  <p className="font-montserrat font-bold text-sm text-white">{selectedTeacher.name}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-green inline-block animate-pulse"></span>
                    <span className="text-xs text-white/50">{selectedTeacher.subject} · В эфире</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                    <Icon name="Mic" size={14} />
                  </button>
                  <button className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                    <Icon name="Volume2" size={14} />
                  </button>
                  <button className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                    <Icon name="Maximize2" size={14} />
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
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 mt-0.5"
                        style={{ background: `${selectedTeacher.accent}25` }}
                      >
                        {selectedTeacher.emoji}
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.from === "student"
                          ? "bg-purple-500/20 border border-purple-500/30 text-white rounded-tr-sm"
                          : "bg-white/6 border border-white/8 text-white/90 rounded-tl-sm"
                      } ${msg.type === "praise" ? "border-yellow-500/30 bg-yellow-500/10" : ""}`}
                    >
                      {msg.type === "praise" && <span className="block text-xs text-yellow-400 font-semibold mb-1">+50 XP · Правильно!</span>}
                      {msg.type === "hint" && msg.from === "teacher" && <span className="block text-xs mb-1" style={{ color: selectedTeacher.accent }}>💡 Подсказка</span>}
                      {msg.text}
                    </div>
                    {msg.from === "student" && (
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-base flex-shrink-0 mt-0.5">
                        🦁
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex gap-2.5 animate-fade-in">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                      style={{ background: `${selectedTeacher.accent}25` }}
                    >
                      {selectedTeacher.emoji}
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
              </div>

              {/* Input */}
              <div className="mt-3 flex gap-2">
                <button className="w-10 h-10 rounded-xl bg-card/60 border border-white/10 flex items-center justify-center text-white/40 hover:text-neon-green hover:border-neon-green/30 transition-all flex-shrink-0">
                  <Icon name="Mic" size={16} />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                    placeholder="Напиши вопрос или ответ..."
                    className="w-full bg-card/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!inputText.trim()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
                  style={{ background: inputText.trim() ? `linear-gradient(135deg, ${selectedTeacher.accent}, ${selectedTeacher.accent}aa)` : "rgba(255,255,255,0.05)" }}
                >
                  <Icon name="Send" size={15} className="text-white" />
                </button>
              </div>

              {/* Quick replies */}
              <div className="flex gap-2 mt-2 flex-wrap">
                {["Не понял, объясни ещё раз", "Дай подсказку", "Следующее задание"].map(q => (
                  <button
                    key={q}
                    onClick={() => { setInputText(q); }}
                    className="text-xs text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10 border border-white/8 px-3 py-1.5 rounded-xl transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom features strip */}
        {!demoActive && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: "🕐",
                title: "Доступен 24/7",
                desc: "Никаких переносов уроков, болезней и плохого настроения. Всегда готов объяснить.",
                color: "#a855f7",
              },
              {
                icon: "🎯",
                title: "Адаптивный сценарий",
                desc: "ИИ анализирует ответы и выбирает: повторить тему, дать подсказку или идти дальше.",
                color: "#00d4ff",
              },
              {
                icon: "😌",
                title: "Без стресса",
                desc: "Не ругает за ошибки — только помогает. Объясняет столько раз, сколько нужно.",
                color: "#06d6a0",
              },
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

      {/* Keyframes for sound bars and bounce */}
      <style>{`
        @keyframes soundBar {
          from { height: 4px; }
          to { height: 20px; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </section>
  );
}
