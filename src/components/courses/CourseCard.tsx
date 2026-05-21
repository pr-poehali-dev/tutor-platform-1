import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Course, GRADES, FORMAT_CONFIG, getCoursePrice } from "./coursesData";
import CourseVoiceDialog from "./CourseVoiceDialog";

interface CourseCardProps {
  course: Course;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onOpenDetail?: () => void;
}

const SUBJECT_ACCENTS: Record<string, string> = {
  math: "#a855f7",
  physics: "#06b6d4",
  english: "#ec4899",
  russian: "#f59e0b",
  chemistry: "#10b981",
  biology: "#84cc16",
  cs: "#6366f1",
  literature: "#f43f5e",
  history: "#eab308",
  geography: "#0ea5e9",
  society: "#8b5cf6",
};

export default function CourseCard({ course, isExpanded, onToggleExpand, onOpenDetail }: CourseCardProps) {
  const fmt = FORMAT_CONFIG[course.format];
  const realPrice = getCoursePrice(course);
  const oldPrice = Math.round(realPrice * 1.6);
  const [dialogOpen, setDialogOpen] = useState(false);
  const accent = SUBJECT_ACCENTS[course.subject] || "#a855f7";

  return (
    <div
      onClick={onOpenDetail}
      className={`bg-card/60 border rounded-2xl overflow-hidden card-hover transition-all duration-300 flex flex-col cursor-pointer ${
        isExpanded ? "border-purple-500/50 glow-purple" : "border-white/8 hover:border-white/20"
      }`}
    >
      {/* Top gradient bar */}
      <div className={`h-1 bg-gradient-to-r ${course.color}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Badges row */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {course.isHit && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/20">🔥 Хит</span>
          )}
          {course.isNew && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/20">✨ Новый</span>
          )}
          {course.isSale && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/20">−{course.salePercent}%</span>
          )}
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ml-auto ${fmt.color}`}>
            {fmt.label}
          </span>
        </div>

        {/* Title + emoji */}
        <div className="flex gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center text-2xl flex-shrink-0`}>
            {course.emoji}
          </div>
          <h3 className="font-montserrat font-black text-sm text-white leading-snug">{course.title}</h3>
        </div>

        {/* Description */}
        <p className="text-white/50 text-xs leading-relaxed mb-3">{course.description}</p>

        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          {course.tags.map(tag => (
            <span key={tag} className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-lg">{tag}</span>
          ))}
        </div>

        {/* AI Teacher badge — кликабельная, открывает голосовой диалог */}
        <button
          onClick={(e) => { e.stopPropagation(); setDialogOpen(true); }}
          aria-label="Поговорить с ИИ-репетитором"
          className="group flex items-center gap-2.5 mb-4 p-3 bg-gradient-to-r from-purple-500/15 to-cyan-500/15 hover:from-purple-500/25 hover:to-cyan-500/25 rounded-xl border border-purple-500/25 hover:border-purple-400/50 transition-all text-left w-full"
        >
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-base">
              🤖
            </div>
            {/* Микрофон-индикатор */}
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-lg ring-2 ring-card/95"
              style={{ background: accent }}
            >
              <Icon name="Mic" size={10} className="text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold">Поговорить голосом</p>
            <p className="text-purple-300 text-xs">Спроси что угодно — отвечу сразу</p>
          </div>
          <Icon
            name="ChevronRight"
            size={14}
            className="text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0"
          />
        </button>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { icon: "📚", val: course.lessons, label: "уроков" },
            { icon: "⏱️", val: course.duration, label: "длина" },
            { icon: "👥", val: course.students >= 1000 ? `${(course.students / 1000).toFixed(1)}к` : course.students, label: "учатся" },
          ].map(s => (
            <div key={s.label} className="bg-white/4 rounded-xl p-2 text-center">
              <div className="text-base">{s.icon}</div>
              <div className="text-white text-xs font-bold">{s.val}</div>
              <div className="text-white/30 text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Expanded: grade info */}
        {isExpanded && (
          <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl animate-fade-in">
            <p className="text-purple-300 text-xs font-semibold mb-1">Программа курса</p>
            <p className="text-white/60 text-xs">
              Класс/уровень: <span className="text-white font-medium">{GRADES.find(g => g.id === course.grade)?.label}</span>
            </p>
            {course.trialAvailable && (
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-green inline-block"></span>
                <span className="text-neon-green text-xs">Пробный урок бесплатно</span>
              </div>
            )}
          </div>
        )}

        {/* Price + CTA */}
        <div className="mt-auto flex items-center gap-3">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-montserrat font-black text-xl text-white">
                {realPrice.toLocaleString("ru-RU")}
              </span>
              <span className="text-white text-sm">₽</span>
            </div>
            <span className="text-white/30 text-xs line-through">{oldPrice.toLocaleString("ru-RU")} ₽</span>
            <div className="text-white/40 text-xs">за полный курс</div>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={e => { e.stopPropagation(); onToggleExpand(); }}
              className="p-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all"
              title="Свернуть/развернуть"
            >
              <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={14} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); onOpenDetail?.(); }}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Подробнее
            </button>
          </div>
        </div>
      </div>

      <CourseVoiceDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        courseTitle={course.title}
        courseEmoji={course.emoji}
        subject={course.subject}
        grade={course.grade}
        accent={accent}
      />
    </div>
  );
}