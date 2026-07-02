import { useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { updateSchool, uploadSchoolLogo, type School } from "./api";

interface Props {
  school: School;
  onUpdated: (s: School) => void;
}

const COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#3b82f6", "#6366f1"];

export default function SchoolBranding({ school, onUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState(school.description || "");
  const [color, setColor] = useState(school.brand_color || "#8b5cf6");
  const [logo, setLogo] = useState(school.brand_logo_url);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const pickLogo = () => fileRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setNotice("Файл больше 3 МБ");
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = String(reader.result || "");
      const res = await uploadSchoolLogo(b64, file.type);
      setUploading(false);
      if (res.ok && res.data) {
        setLogo(res.data.url);
        onUpdated({ ...school, brand_logo_url: res.data.url });
      } else {
        setNotice(res.error || "Не удалось загрузить");
      }
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    const res = await updateSchool({ description: desc, brand_color: color });
    setSaving(false);
    if (res.ok && res.data) {
      onUpdated(res.data.school);
      setNotice("Бренд сохранён");
      setTimeout(() => setNotice(null), 1500);
      setOpen(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] mt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="inline-flex items-center gap-2 text-white/85 text-sm font-medium">
          <Icon name="Palette" size={16} className="text-violet-300" /> Бренд школы
          <span className="text-[10px] text-emerald-300/80 bg-emerald-500/10 border border-emerald-500/25 rounded px-1.5 py-0.5">
            новое
          </span>
        </span>
        <Icon name="ChevronDown" size={16} className={`text-white/50 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {/* Логотип */}
          <div>
            <p className="text-white/60 text-xs mb-2">Логотип школы</p>
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
                style={{ background: logo ? "transparent" : color }}
              >
                {logo ? (
                  <img src={logo} alt="Логотип" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-black text-white">{school.name.charAt(0)}</span>
                )}
              </div>
              <button
                onClick={pickLogo}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 text-sm text-white/75 hover:text-white border border-white/12 hover:border-violet-400/40 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-60"
              >
                <Icon name={uploading ? "Loader2" : "Upload"} size={14} className={uploading ? "animate-spin" : ""} />
                {uploading ? "Загрузка…" : "Загрузить логотип"}
              </button>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={onFile} className="hidden" />
            </div>
            <p className="text-white/35 text-[11px] mt-1.5">PNG, JPG, WEBP или SVG до 3 МБ</p>
          </div>

          {/* Цвет */}
          <div>
            <p className="text-white/60 text-xs mb-2">Фирменный цвет</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg transition-transform ${color === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#1a1530] scale-110" : ""}`}
                  style={{ background: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          {/* Описание */}
          <div>
            <p className="text-white/60 text-xs mb-2">Описание школы</p>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={2}
              placeholder="Коротко о вашей школе — увидят ученики"
              className="w-full bg-white/[0.04] border border-white/12 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/40 resize-y"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold text-sm px-4 py-2 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-60"
            >
              {saving ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Check" size={15} />}
              Сохранить бренд
            </button>
            {notice && <span className="text-xs text-emerald-300">{notice}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
