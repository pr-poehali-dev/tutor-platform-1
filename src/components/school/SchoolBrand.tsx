import { useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { uploadSchoolLogo, updateSchool, type School } from "./api";

interface Props {
  school: School;
  onUpdated: (s: School) => void;
}

const COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#3b82f6", "#111827"];

export default function SchoolBrand({ school, onUpdated }: Props) {
  const [logo, setLogo] = useState(school.brand_logo_url);
  const [color, setColor] = useState(school.brand_color || "#8b5cf6");
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setMsg("Файл слишком большой (макс. 2 МБ)");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = String(reader.result || "");
      setUploading(true);
      setMsg(null);
      const res = await uploadSchoolLogo(base64, file.type);
      setUploading(false);
      if (res.ok && res.data) {
        setLogo(res.data.brand_logo_url);
        setMsg("Логотип обновлён");
      } else {
        setMsg(res.error || "Не удалось загрузить");
      }
    };
    reader.readAsDataURL(file);
  };

  const saveColor = async (c: string) => {
    setColor(c);
    const res = await updateSchool({ brand_color: c });
    if (res.ok && res.data) onUpdated(res.data.school);
  };

  return (
    <div className="space-y-5">
      {/* Логотип */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="font-montserrat font-bold text-white mb-1">Логотип школы</h3>
        <p className="text-white/50 text-sm mb-4">Показывается на странице курса. PNG, JPG, SVG до 2 МБ.</p>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl border border-white/12 bg-white/[0.04] flex items-center justify-center overflow-hidden flex-shrink-0">
            {logo ? (
              <img src={logo} alt="Логотип" className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-2xl font-black text-white"
                style={{ background: color }}
              >
                {school.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white border border-white/15 hover:border-violet-400/40 rounded-xl px-4 py-2.5 transition-colors disabled:opacity-60"
            >
              {uploading ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Upload" size={15} />}
              {logo ? "Заменить логотип" : "Загрузить логотип"}
            </button>
          </div>
        </div>
      </div>

      {/* Цвет */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="font-montserrat font-bold text-white mb-1">Фирменный цвет</h3>
        <p className="text-white/50 text-sm mb-4">Используется в оформлении страницы курса.</p>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => saveColor(c)}
              className={`w-9 h-9 rounded-xl border-2 transition-all ${
                color === c ? "border-white scale-110" : "border-transparent hover:scale-105"
              }`}
              style={{ background: c }}
              aria-label={`Цвет ${c}`}
            />
          ))}
        </div>
      </div>

      {msg && <p className="text-emerald-300 text-sm">{msg}</p>}
    </div>
  );
}
