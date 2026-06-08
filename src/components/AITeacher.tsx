import { useState, useEffect, useRef } from "react";
import TeacherPicker from "./teacher/TeacherPicker";
import LessonRoom from "./teacher/LessonRoom";
import { useVoiceInput } from "./teacher/useVoiceInput";
import { TEACHERS, Teacher, LessonMessage, Emotion, AI_CHAT_URL, TTS_URL } from "./teacher/teachersData";

export default function AITeacher() {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher>(TEACHERS[0]);
  const [demoActive, setDemoActive] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState<LessonMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [emotion, setEmotion] = useState<Emotion>("neutral");
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
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = data.detail || data.error || `HTTP ${res.status}`;
        setError(`Голос недоступен: ${detail}`);
        return;
      }
      if (data.audio_base64) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(`data:${data.mime || "audio/mpeg"};base64,${data.audio_base64}`);
        audioRef.current = audio;
        setIsSpeaking(true);
        audio.onended = () => { setIsSpeaking(false); setEmotion("neutral"); };
        audio.onerror = () => { setIsSpeaking(false); setEmotion("neutral"); };
        try {
          await audio.play();
        } catch (playErr) {
          // Autoplay policy might block — silent fail
          setIsSpeaking(false);
          const msg = playErr instanceof Error ? playErr.message : "браузер заблокировал автовоспроизведение";
          setError(`Звук заблокирован: ${msg}. Кликни по странице и попробуй снова.`);
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "неизвестная ошибка";
      setError(`Голос не загрузился: ${msg}`);
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

  // ─── Voice input ───
  const sendVoiceText = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const msg = text.trim();
    setVisibleMessages(prev => [...prev, { id: Date.now(), from: "student", text: msg }]);
    await askAI(msg);
  };
  const voice = useVoiceInput(sendVoiceText);

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
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-12">
          <div className="order-2 md:order-1">
            <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/30 rounded-full px-3.5 py-1 mb-3">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse inline-block"></span>
              <span className="text-[11px] text-purple-200 font-bold uppercase tracking-wider">В реальном времени · с голосом</span>
            </div>
            <h2 className="font-montserrat font-black text-3xl md:text-4xl text-white leading-tight">
              Твой персональный{" "}
              <span className="gradient-text-purple">ИИ‑преподаватель</span>
            </h2>
            <p className="text-white/65 text-sm md:text-base mt-3">
              Умные ответы, живой голос, бесконечное терпение. Доступен круглосуточно и подстраивается под твой темп.
            </p>
          </div>
          <div className="order-1 md:order-2 relative">
            <div className="relative rounded-3xl overflow-hidden border border-white/10 glow-purple">
              <img
                src="https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/596ca9cf-4e07-4206-bb13-0a8dbfc7c39d.jpg"
                alt="Ученик занимается с ИИ-преподавателем на ноутбуке"
                className="w-full aspect-[4/3] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 bg-card/85 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-2.5 flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-white text-sm font-bold">Урок идёт</span>
              </div>
            </div>
          </div>
        </div>

        {!demoActive ? (
          <TeacherPicker
            selectedTeacher={selectedTeacher}
            setSelectedTeacher={setSelectedTeacher}
            voiceEnabled={voiceEnabled}
            setVoiceEnabled={setVoiceEnabled}
            startDemo={startDemo}
          />
        ) : (
          <LessonRoom
            selectedTeacher={selectedTeacher}
            visibleMessages={visibleMessages}
            isSpeaking={isSpeaking}
            emotion={emotion}
            isLoading={isLoading}
            error={error}
            userXP={userXP}
            voiceEnabled={voiceEnabled}
            setVoiceEnabled={setVoiceEnabled}
            inputText={inputText}
            setInputText={setInputText}
            sendMessage={sendMessage}
            stopDemo={stopDemo}
            chatRef={chatRef}
            isRecording={voice.isRecording}
            isTranscribing={voice.isTranscribing}
            voiceError={voice.voiceError}
            startRecording={voice.start}
            stopRecording={voice.stop}
            cancelRecording={voice.cancel}
          />
        )}

        {/* Bottom features */}
        {!demoActive && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: "🕐", title: "Доступен круглосуточно", desc: "Никаких отмен, опозданий и плохого настроения." },
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