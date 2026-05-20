import { RefObject } from "react";
import Icon from "@/components/ui/icon";
import AvatarDisplay from "./AvatarDisplay";
import { Teacher, LessonMessage, Emotion } from "./teachersData";

interface LessonRoomProps {
  selectedTeacher: Teacher;
  visibleMessages: LessonMessage[];
  isSpeaking: boolean;
  emotion: Emotion;
  isLoading: boolean;
  error: string | null;
  userXP: number;
  voiceEnabled: boolean;
  setVoiceEnabled: (v: boolean) => void;
  inputText: string;
  setInputText: (v: string) => void;
  sendMessage: () => void;
  stopDemo: () => void;
  chatRef: RefObject<HTMLDivElement>;
  isRecording: boolean;
  isTranscribing: boolean;
  voiceError: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  cancelRecording: () => void;
}

export default function LessonRoom({
  selectedTeacher,
  visibleMessages,
  isSpeaking,
  emotion,
  isLoading,
  error,
  userXP,
  voiceEnabled,
  setVoiceEnabled,
  inputText,
  setInputText,
  sendMessage,
  stopDemo,
  chatRef,
  isRecording,
  isTranscribing,
  voiceError,
  startRecording,
  stopRecording,
  cancelRecording,
}: LessonRoomProps) {
  return (
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
            <span className="text-yellow-400 text-sm">опыта</span>
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

          {voiceError && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 text-orange-300 text-xs animate-fade-in">
              🎙 {voiceError}
            </div>
          )}
        </div>

        {/* Recording state */}
        {(isRecording || isTranscribing) && (
          <div
            className="mt-3 flex items-center gap-3 px-4 py-3 rounded-xl border animate-fade-in"
            style={{
              background: isRecording ? "rgba(239, 68, 68, 0.1)" : `${selectedTeacher.accent}15`,
              borderColor: isRecording ? "rgba(239, 68, 68, 0.4)" : `${selectedTeacher.accent}40`,
            }}
          >
            {isRecording ? (
              <>
                <span className="relative flex h-3 w-3 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <div className="flex-1">
                  <p className="text-red-300 text-sm font-semibold">Запись идёт...</p>
                  <p className="text-red-300/60 text-xs">Говори чётко, ИИ слушает</p>
                </div>
                <button
                  onClick={cancelRecording}
                  className="px-3 py-1.5 rounded-lg bg-white/10 text-white/60 hover:text-white text-xs transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={stopRecording}
                  className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Icon name="Square" size={11} />
                  Стоп
                </button>
              </>
            ) : (
              <>
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: selectedTeacher.accent, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                    />
                  ))}
                </div>
                <p className="text-sm flex-1" style={{ color: selectedTeacher.accent }}>
                  Распознаю речь...
                </p>
              </>
            )}
          </div>
        )}

        {/* Input */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading || isTranscribing}
            title={isRecording ? "Остановить запись" : "Записать голосовой вопрос"}
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30 border"
            style={{
              background: isRecording ? "rgba(239, 68, 68, 0.2)" : "rgba(255,255,255,0.05)",
              borderColor: isRecording ? "rgba(239, 68, 68, 0.6)" : "rgba(255,255,255,0.1)",
            }}
          >
            {isRecording ? (
              <Icon name="MicOff" size={18} className="text-red-400" />
            ) : (
              <Icon name="Mic" size={18} className="text-white/70" />
            )}
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              disabled={isLoading || isRecording}
              placeholder={isRecording ? "🎙 Запись..." : "Задай вопрос текстом или голосом..."}
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
  );
}