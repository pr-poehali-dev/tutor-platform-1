import Icon from "@/components/ui/icon";
import AvatarDisplay from "./AvatarDisplay";
import { Teacher, TEACHERS } from "./teachersData";

interface TeacherPickerProps {
  selectedTeacher: Teacher;
  setSelectedTeacher: (t: Teacher) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (v: boolean) => void;
  startDemo: (t: Teacher) => void;
}

export default function TeacherPicker({
  selectedTeacher,
  setSelectedTeacher,
  voiceEnabled,
  setVoiceEnabled,
  startDemo,
}: TeacherPickerProps) {
  return (
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
  );
}
