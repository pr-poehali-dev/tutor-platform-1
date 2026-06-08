import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import func2url from "../../backend/func2url.json";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/context/AuthContext";
import { printHomeworkPdf } from "@/lib/homeworkPdf";

const HOMEWORK_URL = (func2url as Record<string, string>).homework;
const TOKEN_KEY = "uchispro_auth_token_v1";
const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

type Mode = "solve" | "review";

const SUBJECTS = [
  { id: "math", label: "Математика", emoji: "📐" },
  { id: "physics", label: "Физика", emoji: "⚡" },
  { id: "chemistry", label: "Химия", emoji: "🧪" },
  { id: "russian", label: "Русский язык", emoji: "✍️" },
  { id: "english", label: "Английский", emoji: "🌍" },
  { id: "biology", label: "Биология", emoji: "🧬" },
  { id: "history", label: "История", emoji: "🏛️" },
  { id: "geography", label: "География", emoji: "🗺️" },
  { id: "literature", label: "Литература", emoji: "📖" },
  { id: "society", label: "Обществознание", emoji: "⚖️" },
  { id: "cs", label: "Информатика", emoji: "💻" },
];

const GRADES = [
  { id: "1-4", label: "1–4 класс" },
  { id: "5-9", label: "5–9 класс" },
  { id: "10-11", label: "10–11 класс" },
  { id: "oge", label: "ОГЭ" },
  { id: "ege", label: "ЕГЭ" },
];

interface HistoryItem {
  id: number;
  mode: Mode;
  subject: string;
  grade: string;
  image_url: string | null;
  result: string;
  is_correct: boolean | null;
  from_cache: boolean;
  created_at: string;
}

function getToken(tokenFromCtx: string | null): string {
  if (tokenFromCtx) return tokenFromCtx;
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export default function Homework() {
  const { isAuthenticated, loading, openLogin, token } = useAuth();

  const [mode, setMode] = useState<Mode>("solve");
  const [subject, setSubject] = useState("math");
  const [grade, setGrade] = useState("5-9");
  const [photos, setPhotos] = useState<{ preview: string; b64: string; type: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ text: string; isCorrect: boolean | null; fromCache: boolean } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) openLogin();
  }, [loading, isAuthenticated, openLogin]);

  const loadHistory = useCallback(async () => {
    const t = getToken(token);
    if (!t) return;
    try {
      const res = await fetch(`${HOMEWORK_URL}?action=history`, {
        headers: { "X-Auth-Token": t },
      });
      const data = await res.json();
      if (Array.isArray(data.items)) setHistory(data.items);
    } catch {
      /* тихо */
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) loadHistory();
  }, [isAuthenticated, loadHistory]);

  const MAX_PHOTOS = 5;

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError(null);
    setResult(null);

    const slotsLeft = MAX_PHOTOS - photos.length;
    if (slotsLeft <= 0) {
      setError(`Можно загрузить не больше ${MAX_PHOTOS} фото.`);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    const toAdd = files.slice(0, slotsLeft);

    toAdd.forEach((file) => {
      if (file.size > 8 * 1024 * 1024) {
        setError("Одно из фото больше 8 МБ. Сними поближе или сожми.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const b64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
        setPhotos((prev) =>
          prev.length >= MAX_PHOTOS
            ? prev
            : [...prev, { preview: dataUrl, b64, type: file.type || "image/jpeg" }]
        );
      };
      reader.readAsDataURL(file);
    });

    if (files.length > slotsLeft) {
      setError(`Добавлены первые ${slotsLeft} фото — лимит ${MAX_PHOTOS}.`);
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    setResult(null);
  };

  const reset = () => {
    setPhotos([]);
    setResult(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async () => {
    if (photos.length === 0) {
      setError("Сначала загрузи фото задания.");
      return;
    }
    const t = getToken(token);
    if (!t) {
      openLogin();
      return;
    }
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${HOMEWORK_URL}?action=check`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": t },
        body: JSON.stringify({
          action: "check",
          images_base64: photos.map((p) => p.b64),
          content_types: photos.map((p) => p.type),
          mode,
          subject,
          grade,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Не удалось обработать фото. Попробуй ещё раз.");
        return;
      }
      setResult({ text: data.result, isCorrect: data.is_correct, fromCache: data.from_cache });
      loadHistory();
    } catch {
      setError("Ошибка сети. Проверь соединение и попробуй снова.");
    } finally {
      setBusy(false);
    }
  };

  const savePdf = () => {
    if (!result) return;
    const subjLabel = SUBJECTS.find((s) => s.id === subject)?.label || subject;
    const gradeLabel = GRADES.find((g) => g.id === grade)?.label || grade;
    printHomeworkPdf({
      title: mode === "review" ? "Проверка решения" : "Разбор задачи",
      subjectLabel: subjLabel,
      gradeLabel,
      modeLabel: mode === "review" ? "Проверка решения" : "Решение задачи",
      verdict: result.isCorrect === true ? "correct" : result.isCorrect === false ? "errors" : "review",
      resultText: result.text,
      images: photos.map((p) => p.preview),
    });
  };

  if (!loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-mesh font-golos text-white flex flex-col items-center justify-center px-6 text-center">
        <Seo title="Домашка — проверка задач по фото | УЧИСЬПРО" description="Сфотографируй задачу или своё решение в тетради — ИИ проверит и объяснит." canonical={`${SITE_URL}/homework`} />
        <div className="text-6xl mb-4">📸</div>
        <h1 className="font-montserrat font-black text-2xl md:text-3xl mb-3">Домашка</h1>
        <p className="text-white/60 max-w-md mb-6">Сфотографируй задачу или своё решение в тетради — ИИ проверит и подробно объяснит. Нужен вход в аккаунт.</p>
        <button onClick={openLogin} className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold px-6 py-3.5 rounded-2xl hover:opacity-90 transition-opacity">
          <Icon name="LogIn" size={18} />
          Войти / Зарегистрироваться
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Домашка — реши задачу по фото и проверь решение | УЧИСЬПРО"
        description="Сфотографируй задачу с телефона или своё решение в тетради. ИИ распознает и решит задание пошагово или проверит твою работу, найдёт ошибки и объяснит как правильно."
        canonical={`${SITE_URL}/homework`}
        keywords="решить задачу по фото, проверка домашнего задания, гдз по фото, реши пример с фото, проверить решение, домашка онлайн, помощь с уроками"
      />

      {/* Top bar */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Домашка" }]} />
          </div>
          <Link to="/" className="hidden md:inline-flex items-center gap-1.5 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            <Icon name="ArrowLeft" size={14} />
            На главную
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 pt-10 pb-6">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-full px-4 py-1.5 mb-5">
          <Icon name="Camera" size={14} className="text-cyan-300" />
          <span className="text-sm text-cyan-100 font-bold uppercase tracking-wider">Домашка по фото</span>
        </div>
        <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white mb-3 leading-tight">
          Сфотографируй — <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">ИИ разберёт</span>
        </h1>
        <p className="text-white/65 text-base md:text-lg max-w-2xl">
          Сними задачу из учебника или своё решение в тетради. ИИ <b className="text-white">решит пошагово</b> или <b className="text-white">проверит твою работу</b>, найдёт ошибки и объяснит как правильно.
        </p>
      </section>

      {/* Форма */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 pb-10">
        <div className="bg-card border border-white/10 rounded-3xl p-5 md:p-7">
          {/* Режим */}
          <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-2">Что сделать</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <button
              onClick={() => setMode("solve")}
              className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${mode === "solve" ? "bg-purple-500/15 border-purple-500/45" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
            >
              <div className="text-2xl">🧮</div>
              <div>
                <p className="font-bold text-white text-sm">Реши задачу</p>
                <p className="text-white/55 text-xs mt-0.5">Фото задания из учебника — пошаговое решение с объяснением</p>
              </div>
            </button>
            <button
              onClick={() => setMode("review")}
              className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${mode === "review" ? "bg-cyan-500/15 border-cyan-500/45" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
            >
              <div className="text-2xl">📝</div>
              <div>
                <p className="font-bold text-white text-sm">Проверь моё решение</p>
                <p className="text-white/55 text-xs mt-0.5">Фото твоей работы в тетради — проверка ошибок и подсказки</p>
              </div>
            </button>
          </div>

          {/* Предмет */}
          <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-2">Предмет</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {SUBJECTS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSubject(s.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${subject === s.id ? "bg-purple-500/25 border border-purple-500/45 text-white" : "bg-white/5 border border-white/10 text-white/65 hover:bg-white/10"}`}
              >
                <span>{s.emoji}</span>
                {s.label}
              </button>
            ))}
          </div>

          {/* Класс */}
          <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-2">Класс</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {GRADES.map((g) => (
              <button
                key={g.id}
                onClick={() => setGrade(g.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${grade === g.id ? "bg-cyan-500/25 border border-cyan-500/45 text-white" : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"}`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Загрузка фото */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={onPickFile}
            className="hidden"
          />
          {photos.length === 0 ? (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-white/15 hover:border-purple-500/50 rounded-2xl py-10 flex flex-col items-center gap-3 transition-colors group"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Icon name="Camera" size={26} className="text-white" />
              </div>
              <p className="text-white font-bold">Сфотографировать или выбрать фото</p>
              <p className="text-white/45 text-xs">JPG, PNG до 8 МБ · до {MAX_PHOTOS} фото · можно с камеры телефона</p>
            </button>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold">
                  Фото задания · {photos.length}/{MAX_PHOTOS}
                </p>
                <button onClick={reset} className="text-white/50 hover:text-white text-xs inline-flex items-center gap-1 transition-colors">
                  <Icon name="Trash2" size={12} /> Очистить всё
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative aspect-square group">
                    <img src={p.preview} alt={`Фото ${i + 1}`} className="w-full h-full object-cover rounded-xl border border-white/10 bg-black/30" />
                    <span className="absolute bottom-1 left-1 bg-black/65 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">{i + 1}</span>
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/65 hover:bg-rose-500/90 flex items-center justify-center text-white transition-colors"
                    >
                      <Icon name="X" size={12} />
                    </button>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-white/15 hover:border-purple-500/50 flex flex-col items-center justify-center gap-1 text-white/55 hover:text-white transition-colors"
                  >
                    <Icon name="Plus" size={20} />
                    <span className="text-[10px] font-semibold">Ещё фото</span>
                  </button>
                )}
              </div>
              <p className="text-white/35 text-[11px] mt-2">
                💡 Несколько фото = одно задание целиком (например, разворот тетради или длинное решение).
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl px-4 py-3 flex items-start gap-2">
              <Icon name="TriangleAlert" size={16} className="text-rose-300 flex-shrink-0 mt-0.5" />
              <p className="text-rose-100 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={submit}
            disabled={busy || photos.length === 0}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold px-6 py-4 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed text-lg"
          >
            {busy ? (
              <>
                <Icon name="Loader2" size={20} className="animate-spin" />
                ИИ разбирает фото…
              </>
            ) : (
              <>
                <Icon name="Sparkles" size={20} />
                {mode === "solve" ? "Решить задачу" : "Проверить решение"}
              </>
            )}
          </button>
        </div>

        {/* Результат */}
        {result && (
          <div className="mt-5 bg-card border border-white/10 rounded-3xl p-5 md:p-7 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              {result.isCorrect === true && <span className="inline-flex items-center gap-1.5 text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-3 py-1 text-sm font-bold"><Icon name="CircleCheck" size={14} /> Решение верное</span>}
              {result.isCorrect === false && <span className="inline-flex items-center gap-1.5 text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded-full px-3 py-1 text-sm font-bold"><Icon name="CircleAlert" size={14} /> Есть ошибки</span>}
              {result.isCorrect === null && <span className="inline-flex items-center gap-1.5 text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 rounded-full px-3 py-1 text-sm font-bold"><Icon name="BookOpen" size={14} /> Разбор задачи</span>}
              {result.fromCache && <span className="text-white/35 text-[11px]">· мгновенно из кэша</span>}
              <button
                onClick={savePdf}
                className="ml-auto inline-flex items-center gap-1.5 bg-white/8 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
              >
                <Icon name="FileDown" size={14} />
                Сохранить в PDF
              </button>
            </div>
            <div className="text-white/85 text-sm md:text-base leading-relaxed whitespace-pre-wrap">{result.text}</div>
          </div>
        )}

        {/* История */}
        {history.length > 0 && (
          <div className="mt-8">
            <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold mb-3">История проверок</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {history.map((h) => (
                <div key={h.id} className="bg-card border border-white/10 rounded-2xl p-4 flex gap-3">
                  {h.image_url ? (
                    <img src={h.image_url} alt="" className="w-16 h-16 rounded-xl object-cover border border-white/10 flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 text-2xl">📄</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-white/70">{h.mode === "review" ? "Проверка" : "Решение"}</span>
                      {h.is_correct === true && <Icon name="CircleCheck" size={13} className="text-emerald-400" />}
                      {h.is_correct === false && <Icon name="CircleAlert" size={13} className="text-amber-400" />}
                    </div>
                    <p className="text-white/55 text-xs line-clamp-3">{h.result}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Юр. плашка */}
        <div className="mt-8 p-4 bg-white/[0.03] border border-white/10 rounded-2xl flex items-start gap-3">
          <Icon name="ShieldCheck" size={16} className="text-emerald-300 mt-0.5 flex-shrink-0" />
          <p className="text-white/55 text-[11px] leading-relaxed">
            «Домашка» помогает разобраться и научиться, а не списать. Разбор носит образовательный характер и может содержать неточности — проверяй важное. Загружай только учебные задания. Соблюдаем 152-ФЗ «О персональных данных».
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}