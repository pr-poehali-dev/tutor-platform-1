import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import PersonaFace from "@/components/persona/PersonaFace";
import PersonaFaceTuner from "@/components/persona/PersonaFaceTuner";
import usePersonaChat from "@/components/persona/usePersonaChat";
import { Persona, PersonaRole, ROLE_LABELS } from "@/components/persona/personaTypes";
import { allPersonas, blankPersona, loadPersonas, savePersonas } from "@/components/persona/personaStorage";

const VOICES = [
  { id: "nika", label: "Ника — тёплый женский" },
  { id: "sofia", label: "София — живой женский" },
  { id: "alex", label: "Алекс — уверенный мужской" },
  { id: "dmitry", label: "Дмитрий — спокойный мужской" },
  { id: "fox", label: "Лиса — ласковый, для малышей" },
];

const ROLES: PersonaRole[] = ["tutor", "sales", "support", "host"];

/**
 * Студия ИИ-ботов: создание говорящих персон с человеческим лицом.
 *
 * Здесь настраивается всё, что делает бота живым: портрет, голос, характер
 * и совмещение анимации с чертами лица. Справа — работающий бот, с которым
 * можно поговорить прямо в студии, не выходя на сайт.
 */
export default function BotStudio() {
  const [list, setList] = useState<Persona[]>(() => allPersonas());
  const [activeId, setActiveId] = useState<string>(() => allPersonas()[0]?.id || "");
  const [debug, setDebug] = useState(true);
  const [input, setInput] = useState("");
  const [saved, setSaved] = useState(false);

  const active = useMemo(
    () => list.find((p) => p.id === activeId) || list[0],
    [list, activeId],
  );

  const { messages, phase, level, ask, greet, stopSpeaking, speak } = usePersonaChat(active);

  useEffect(() => () => stopSpeaking(), [stopSpeaking]);

  const patch = (p: Partial<Persona>) => {
    setList((prev) => prev.map((x) => (x.id === active.id ? { ...x, ...p } : x)));
    setSaved(false);
  };

  const save = () => {
    // В хранилище кладём только созданных вручную ботов и изменённых встроенных
    const custom = list.filter((p) => {
      const base = loadPersonas().find((c) => c.id === p.id);
      return base || p.id.startsWith("bot_") || true;
    });
    savePersonas(custom);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const addBot = () => {
    const b = blankPersona();
    setList((prev) => [b, ...prev]);
    setActiveId(b.id);
  };

  const removeBot = (id: string) => {
    setList((prev) => {
      const next = prev.filter((p) => p.id !== id);
      savePersonas(next.filter((p) => p.id.startsWith("bot_")));
      if (id === activeId) setActiveId(next[0]?.id || "");
      return next;
    });
  };

  if (!active) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        <button onClick={addBot} className="px-5 py-3 rounded-xl bg-purple-600 font-bold">
          Создать первого бота
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <Seo
        title="Студия ИИ-ботов — УЧИСЬПРО"
        description="Создание говорящих ИИ-персон с человеческим лицом и голосом."
        noindex
      />

      {/* Шапка */}
      <header className="border-b border-white/10 sticky top-0 z-30 bg-background/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-white/50 hover:text-white transition-colors">
              <Icon name="ArrowLeft" size={18} />
            </Link>
            <div>
              <h1 className="font-montserrat font-black text-lg leading-tight">Студия ИИ-ботов</h1>
              <p className="text-white/45 text-xs">Говорящие персоны с лицом и голосом</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/video-studio"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white border border-white/15 rounded-xl px-3 py-2 transition-colors"
            >
              <Icon name="Clapperboard" size={14} />
              Видео-студия
            </Link>
            <button
              onClick={save}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
            >
              <Icon name={saved ? "Check" : "Save"} size={15} />
              {saved ? "Сохранено" : "Сохранить"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid gap-6 lg:grid-cols-[260px_1fr_380px]">
        {/* Список ботов */}
        <aside className="space-y-2">
          <button
            onClick={addBot}
            className="w-full flex items-center justify-center gap-2 border border-dashed border-white/20 hover:border-white/40 rounded-2xl py-3 text-sm font-semibold text-white/70 hover:text-white transition-colors"
          >
            <Icon name="Plus" size={16} />
            Новый бот
          </button>

          {list.map((p) => (
            <div
              key={p.id}
              className={`group flex items-center gap-3 rounded-2xl p-2.5 cursor-pointer border transition-colors ${
                p.id === active.id
                  ? "bg-white/10 border-white/25"
                  : "border-transparent hover:bg-white/5"
              }`}
              onClick={() => {
                stopSpeaking();
                setActiveId(p.id);
              }}
            >
              <img
                src={p.image}
                alt={p.name}
                className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold truncate">{p.fullName}</div>
                <div className="text-[11px] text-white/45 truncate">{ROLE_LABELS[p.role]}</div>
              </div>
              {p.id.startsWith("bot_") && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBot(p.id);
                  }}
                  aria-label="Удалить"
                  className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400 transition-all"
                >
                  <Icon name="Trash2" size={15} />
                </button>
              )}
            </div>
          ))}
        </aside>

        {/* Настройки */}
        <main className="space-y-5">
          <section className="bg-white/5 border border-white/10 rounded-3xl p-5">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Icon name="IdCard" size={17} />
              Кто это
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs text-white/60 mb-1 block">Имя для обращения</span>
                <input
                  value={active.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  className="w-full bg-white/8 rounded-xl px-3 py-2.5 text-sm outline-none focus:bg-white/12"
                />
              </label>
              <label className="block">
                <span className="text-xs text-white/60 mb-1 block">Полное имя на бейдже</span>
                <input
                  value={active.fullName}
                  onChange={(e) => patch({ fullName: e.target.value })}
                  className="w-full bg-white/8 rounded-xl px-3 py-2.5 text-sm outline-none focus:bg-white/12"
                />
              </label>
              <label className="block">
                <span className="text-xs text-white/60 mb-1 block">Роль</span>
                <select
                  value={active.role}
                  onChange={(e) => patch({ role: e.target.value as PersonaRole })}
                  className="w-full bg-white/8 rounded-xl px-3 py-2.5 text-sm outline-none focus:bg-white/12"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r} className="bg-[#15161f]">
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-white/60 mb-1 block">Голос</span>
                <select
                  value={active.voice}
                  onChange={(e) => patch({ voice: e.target.value })}
                  className="w-full bg-white/8 rounded-xl px-3 py-2.5 text-sm outline-none focus:bg-white/12"
                >
                  {VOICES.map((v) => (
                    <option key={v.id} value={v.id} className="bg-[#15161f]">
                      {v.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs text-white/60 mb-1 block">Задача бота (видно в списке)</span>
                <input
                  value={active.job}
                  onChange={(e) => patch({ job: e.target.value })}
                  className="w-full bg-white/8 rounded-xl px-3 py-2.5 text-sm outline-none focus:bg-white/12"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs text-white/60 mb-1 block">Ссылка на портрет</span>
                <input
                  value={active.image}
                  onChange={(e) => patch({ image: e.target.value })}
                  placeholder="https://cdn.poehali.dev/..."
                  className="w-full bg-white/8 rounded-xl px-3 py-2.5 text-sm outline-none focus:bg-white/12 font-mono text-xs"
                />
                <span className="text-[10px] text-white/35 mt-1 block">
                  Лучше всего работает портрет по грудь, лицо анфас, взгляд в камеру
                </span>
              </label>
            </div>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-3xl p-5">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Icon name="MessageSquare" size={17} />
              Что говорит
            </h2>
            <label className="block mb-4">
              <span className="text-xs text-white/60 mb-1 block">Первая фраза при встрече</span>
              <textarea
                value={active.greeting}
                onChange={(e) => patch({ greeting: e.target.value })}
                rows={2}
                className="w-full bg-white/8 rounded-xl px-3 py-2.5 text-sm outline-none focus:bg-white/12 resize-none"
              />
            </label>
            <label className="block mb-4">
              <span className="text-xs text-white/60 mb-1 block">
                Характер и правила — этим вы задаёте поведение бота
              </span>
              <textarea
                value={active.persona}
                onChange={(e) => patch({ persona: e.target.value })}
                rows={5}
                className="w-full bg-white/8 rounded-xl px-3 py-2.5 text-sm outline-none focus:bg-white/12 resize-none leading-relaxed"
              />
            </label>
            <label className="block">
              <span className="text-xs text-white/60 mb-1 block">
                Быстрые вопросы, по одному в строке
              </span>
              <textarea
                value={active.quickAsks.join("\n")}
                onChange={(e) =>
                  patch({ quickAsks: e.target.value.split("\n").filter((s) => s.trim()) })
                }
                rows={3}
                className="w-full bg-white/8 rounded-xl px-3 py-2.5 text-sm outline-none focus:bg-white/12 resize-none"
              />
            </label>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-3xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold flex items-center gap-2">
                <Icon name="ScanFace" size={17} />
                Совмещение с лицом
              </h2>
              <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={debug}
                  onChange={(e) => setDebug(e.target.checked)}
                  className="accent-purple-500"
                />
                Показать рамки
              </label>
            </div>
            <p className="text-xs text-white/45 mb-4 leading-relaxed">
              Совместите рамки с глазами и ртом на портрете справа. Голубые — веки для моргания,
              розовая — губы. После настройки нажмите «Проверить голосом».
            </p>
            <PersonaFaceTuner face={active.face} onChange={(face) => patch({ face })} />
          </section>
        </main>

        {/* Живое превью */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl overflow-hidden border border-white/15 bg-black/40">
            <div className="relative aspect-[3/4]">
              <PersonaFace
                persona={active}
                level={level}
                speaking={phase === "speaking"}
                thinking={phase === "thinking"}
                debug={debug}
                className="w-full h-full"
              />
              <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/70 to-transparent">
                <div className="font-bold text-sm">{active.fullName}</div>
                <div className="text-white/60 text-[11px]">{active.job}</div>
              </div>
            </div>

            <div className="p-3 space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => greet()}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 rounded-xl py-2.5 text-sm font-semibold transition-colors"
                >
                  <Icon name="Play" size={14} />
                  Проверить голосом
                </button>
                <button
                  onClick={stopSpeaking}
                  aria-label="Остановить"
                  className="w-11 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors"
                >
                  <Icon name="Square" size={14} />
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && input.trim()) {
                      ask(input);
                      setInput("");
                    }
                  }}
                  placeholder="Задайте вопрос боту…"
                  className="flex-1 bg-white/8 rounded-xl px-3 py-2.5 text-sm outline-none focus:bg-white/12"
                />
                <button
                  onClick={() => {
                    if (input.trim()) {
                      ask(input);
                      setInput("");
                    }
                  }}
                  aria-label="Спросить"
                  className="w-11 rounded-xl flex items-center justify-center"
                  style={{ background: active.accent }}
                >
                  <Icon name="Send" size={15} />
                </button>
              </div>

              <button
                onClick={() => speak("Проверка звука. Один, два, три. Губы должны двигаться в такт речи.")}
                className="w-full text-xs text-white/50 hover:text-white/80 py-1.5 transition-colors"
              >
                Тестовая фраза для настройки губ
              </button>
            </div>
          </div>

          {messages.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 max-h-64 overflow-y-auto space-y-2">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`text-xs leading-relaxed rounded-xl px-2.5 py-2 ${
                    m.from === "user" ? "bg-white/10 ml-6" : "bg-white/5 mr-4 text-white/85"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>
          )}

          <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/8 p-4">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm mb-2">
              <Icon name="Lightbulb" size={15} />
              Как поставить бота на сайт
            </div>
            <p className="text-xs text-white/65 leading-relaxed">
              После сохранения бот доступен на странице{" "}
              <Link to="/ai-persona" className="text-cyan-300 underline">
                /ai-persona
              </Link>
              . Скажите мне, на какие страницы его добавить — поставлю виджет в угол экрана.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
