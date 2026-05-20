import { Teacher, Emotion } from "./teachersData";

interface AvatarDisplayProps {
  teacher: Teacher;
  isSpeaking: boolean;
  emotion: Emotion;
  size?: "sm" | "md" | "lg";
}

export default function AvatarDisplay({ teacher, isSpeaking, emotion, size = "md" }: AvatarDisplayProps) {
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
