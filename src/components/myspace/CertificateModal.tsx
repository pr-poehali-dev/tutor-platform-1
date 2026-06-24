import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { Course } from "@/components/courses/coursesData";
import { MyCourse } from "@/hooks/useUserData";
import { getUserUid } from "@/lib/userUid";
import { CERTIFICATE_DISCLAIMER } from "@/lib/certificateEligibility";

interface Props {
  open: boolean;
  onClose: () => void;
  myCourse: MyCourse;
  course?: Course;
}

const NAME_KEY = "certificate_name";

function certNumber(uid: string, courseId: number): string {
  // Детерминированный номер сертификата из uid + id курса
  let h = 0;
  const src = `${uid}:${courseId}`;
  for (let i = 0; i < src.length; i++) {
    h = (h * 31 + src.charCodeAt(i)) >>> 0;
  }
  const base = h.toString(36).toUpperCase().padStart(8, "0").slice(0, 8);
  return `УП-${base.slice(0, 4)}-${base.slice(4, 8)}`;
}

function formatDate(iso: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

export default function CertificateModal({ open, onClose, myCourse, course }: Props) {
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      try {
        const saved = localStorage.getItem(NAME_KEY) || "";
        setName(saved);
        setEditing(!saved);
      } catch { /* empty */ }
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const saveName = (v: string) => {
    setName(v);
    try { localStorage.setItem(NAME_KEY, v); } catch { /* empty */ }
  };

  const number = certNumber(getUserUid(), myCourse.course_id);
  const date = formatDate(myCourse.completed_at);
  const title = course?.title || myCourse.title;
  const displayName = name.trim() || "Ученик";
  // Академические часы: ~0.5 ак. часа на урок, минимум 8.
  const hours = course?.lessons ? Math.max(8, Math.round(course.lessons * 0.5)) : 16;

  const handlePrint = () => {
    const node = certRef.current;
    if (!node) return;
    const html = node.outerHTML;
    const win = window.open("", "_blank", "width=1100,height=800");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Сертификат — ${title}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>@page{size:landscape;margin:0}body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0b0a1a;font-family:system-ui,Segoe UI,Roboto,sans-serif}</style>
      </head><body>${html}<script>window.onload=()=>{setTimeout(()=>{window.print();},400)}</script></body></html>`);
    win.document.close();
  };

  const handleShare = async () => {
    const text = `Я прошёл курс «${title}» на УЧИСЬПРО! Сертификат №${number}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Мой сертификат", text });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch { /* empty */ }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-3xl my-auto">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-montserrat font-black text-lg flex items-center gap-2">
            <Icon name="Award" size={20} className="text-amber-400" />
            Сертификат
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Certificate */}
        <div
          ref={certRef}
          className="relative w-full aspect-[1.45/1] rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg,#14122c 0%,#1c1640 55%,#221a4e 100%)" }}
        >
          {/* Decorative borders */}
          <div className="absolute inset-2.5 md:inset-4 rounded-xl border-2 border-amber-400/45" />
          <div className="absolute inset-[14px] md:inset-[22px] rounded-lg border border-white/10" />
          {/* Corner ornaments */}
          <div className="absolute top-2.5 left-2.5 md:top-4 md:left-4 w-6 h-6 md:w-9 md:h-9 border-t-2 border-l-2 border-amber-400/70 rounded-tl-xl" />
          <div className="absolute top-2.5 right-2.5 md:top-4 md:right-4 w-6 h-6 md:w-9 md:h-9 border-t-2 border-r-2 border-amber-400/70 rounded-tr-xl" />
          <div className="absolute bottom-2.5 left-2.5 md:bottom-4 md:left-4 w-6 h-6 md:w-9 md:h-9 border-b-2 border-l-2 border-amber-400/70 rounded-bl-xl" />
          <div className="absolute bottom-2.5 right-2.5 md:bottom-4 md:right-4 w-6 h-6 md:w-9 md:h-9 border-b-2 border-r-2 border-amber-400/70 rounded-br-xl" />

          {/* Glow accents */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-cyan-500/15 blur-3xl" />

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-white/[0.04] font-montserrat font-black text-[5rem] md:text-[9rem] rotate-[-18deg] tracking-tighter">
              УЧИСЬПРО
            </span>
          </div>

          <div className="relative h-full flex flex-col items-center text-center px-6 md:px-12 pt-5 md:pt-8 pb-4 md:pb-6">
            {/* Logo / brand */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-base">🚀</div>
              <span className="text-white font-montserrat font-black tracking-wide text-sm md:text-base">УЧИСЬПРО</span>
            </div>
            <p className="text-white/35 text-[7px] md:text-[9px] mt-0.5">Образовательная онлайн-платформа дополнительного развития</p>

            <p className="text-amber-300/90 uppercase tracking-[0.25em] text-[10px] md:text-xs font-bold mt-3 md:mt-4 mb-2 md:mb-3">
              Сертификат о прохождении курса
            </p>

            <p className="text-white/55 text-[11px] md:text-sm">Настоящим подтверждается, что</p>

            {/* Name */}
            <p className="my-1 md:my-1.5 text-2xl md:text-4xl font-montserrat font-black gradient-text-purple leading-tight px-2">
              {displayName}
            </p>

            <p className="text-white/55 text-[11px] md:text-sm">прошёл(ла) онлайн-курс</p>

            {/* Course title */}
            <p className="mt-1 md:mt-1.5 text-base md:text-2xl font-bold text-white max-w-xl leading-snug">
              «{title}»
            </p>

            {/* Meta line */}
            <p className="mt-1.5 md:mt-2 text-white/45 text-[9px] md:text-xs">
              Объём программы: <span className="text-white/75 font-bold">{hours} ак. часов</span>
              <span className="mx-1.5">·</span>
              Формат: онлайн
            </p>

            {/* Legal disclaimer */}
            <p className="mt-2 md:mt-3 max-w-2xl text-white/35 text-[6.5px] md:text-[9px] leading-snug px-2">
              {CERTIFICATE_DISCLAIMER}
            </p>

            {/* Footer */}
            <div className="mt-auto pt-3 md:pt-4 w-full flex items-end justify-between text-left">
              <div className="flex flex-col gap-1">
                <div>
                  <p className="text-white/40 text-[8px] md:text-[10px]">Дата выдачи</p>
                  <p className="text-white/85 text-[10px] md:text-sm font-bold">{date}</p>
                </div>
                <div>
                  <p className="text-white/40 text-[8px] md:text-[10px]">Сертификат №</p>
                  <p className="text-white/85 text-[10px] md:text-sm font-bold tabular-nums">{number}</p>
                </div>
              </div>

              {/* Stamp */}
              <div className="flex flex-col items-center">
                <div className="relative w-14 h-14 md:w-20 md:h-20 rounded-full border-2 border-amber-400/60 flex items-center justify-center">
                  <div className="absolute inset-1 rounded-full border border-amber-400/30" />
                  <Icon name="BadgeCheck" size={24} className="text-amber-400 md:hidden" />
                  <Icon name="BadgeCheck" size={34} className="text-amber-400 hidden md:block" />
                </div>
                <p className="text-amber-300/80 text-[7px] md:text-[9px] font-bold uppercase tracking-wider mt-1">Проверено методистом</p>
              </div>

              {/* Signature */}
              <div className="text-right">
                <p className="font-bold text-white/85 text-sm md:text-lg italic leading-none" style={{ fontFamily: "Georgia, serif" }}>
                  Юрьева
                </p>
                <div className="h-px bg-white/25 w-20 md:w-28 ml-auto my-1" />
                <p className="text-white/40 text-[8px] md:text-[10px]">Руководитель платформы</p>
              </div>
            </div>
          </div>
        </div>

        {/* Name editor */}
        <div className="mt-4 bg-white/[0.06] border border-white/12 rounded-2xl p-4">
          {editing ? (
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <input
                value={name}
                onChange={(e) => saveName(e.target.value)}
                autoFocus
                maxLength={60}
                placeholder="Введи имя и фамилию для сертификата"
                className="flex-1 bg-white/[0.09] border border-white/15 rounded-xl px-4 h-11 text-white text-sm placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                onKeyDown={(e) => { if (e.key === "Enter") setEditing(false); }}
              />
              <button
                onClick={() => setEditing(false)}
                className="h-11 px-5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-sm whitespace-nowrap"
              >
                Готово
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-purple-300 hover:text-purple-200 text-sm flex items-center gap-2 transition-colors"
            >
              <Icon name="Pencil" size={14} /> Изменить имя на сертификате
            </button>
          )}
        </div>

        {/* Legal note */}
        <div className="mt-3 bg-white/[0.04] border border-white/10 rounded-2xl p-3.5 flex items-start gap-2.5">
          <Icon name="Info" size={15} className="text-white/40 mt-0.5 flex-shrink-0" />
          <p className="text-white/45 text-[11px] leading-relaxed">
            Сертификат подтверждает прохождение онлайн-курса и не является документом
            об образовании или о квалификации согласно ст. 60 ФЗ № 273-ФЗ. Он не даёт
            права на ведение профессиональной деятельности.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
          >
            <Icon name="Download" size={18} /> Скачать / Печать (PDF)
          </button>
          <button
            onClick={handleShare}
            className="flex-1 h-12 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Icon name="Share2" size={18} /> Поделиться
          </button>
        </div>
      </div>
    </div>
  );
}