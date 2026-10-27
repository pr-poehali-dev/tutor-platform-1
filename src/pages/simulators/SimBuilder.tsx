import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SimHeader from "@/components/simulators/SimHeader";
import Scene3D from "@/components/simulators/Scene3DClient";
import Player from "@/components/simulators/Player";
import ObjectsPanel from "@/components/simulators/builder/ObjectsPanel";
import StepsPanel from "@/components/simulators/builder/StepsPanel";
import StatsPanel from "@/components/simulators/builder/StatsPanel";
import { TEMPLATES, findTemplate } from "@/components/simulators/templates";
import { mySims, simApi } from "@/components/simulators/api";
import { AUDIENCE_LABEL, Audience, CATEGORY_LABEL, Category, Simulator } from "@/components/simulators/types";

const DRAFT_KEY = "uchispro_sim_draft_v1";

const EMPTY: Simulator = {
  title: "Новый тренажёр",
  description: "",
  category: "other",
  audience: ["school"],
  grade: "",
  location: "lab",
  passScore: 70,
  objects: [{ id: "table", kind: "table", label: "Стол", pos: [0, 0, 0] }],
  steps: [],
};

const IDEAS = [
  "Оператор станка: безопасный пуск и аварийная остановка, колледж",
  "Действия при пожаре в школьном классе, 5 класс",
  "Строение клетки под микроскопом, 6 класс",
  "Сварщик: подготовка рабочего места и СИЗ",
];

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

/** Конструктор тренажёров: ИИ-черновик → правка блоков → предпросмотр → ссылка ученикам. */
export default function SimBuilder() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const editSlug = params.get("edit") || "";
  const fromTpl = params.get("from") || "";

  const [sim, setSim] = useState<Simulator>(() => {
    const tpl = fromTpl ? findTemplate(fromTpl) : null;
    if (tpl) {
      const { slug: _s, minutes: _m, ...rest } = clone(tpl);
      return { ...rest, title: `${rest.title} (моя версия)` };
    }
    if (!editSlug) {
      try {
        const d = localStorage.getItem(DRAFT_KEY);
        if (d) return JSON.parse(d);
      } catch {
        /* битый черновик — начинаем с пустого */
      }
    }
    return clone(EMPTY);
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [pickMode, setPickMode] = useState<{ step: number; field: "target" | "trap" } | null>(null);
  const [tab, setTab] = useState(sim.steps.length ? "steps" : "ai");
  const [preview, setPreview] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [aud, setAud] = useState<Audience>("school");
  const [busy, setBusy] = useState<"" | "ai" | "save" | "load">(editSlug ? "load" : "");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [saved, setSaved] = useState<{ slug: string; key: string } | null>(() => {
    const key = editSlug ? mySims.key(editSlug) : undefined;
    return editSlug && key ? { slug: editSlug, key } : null;
  });

  useEffect(() => {
    if (!editSlug) return;
    simApi.get(editSlug).then((r) => {
      setBusy("");
      if (r.ok) {
        setSim(r.trainer);
        setTab("steps");
      } else setMsg({ kind: "err", text: r.error || "Тренажёр не найден" });
    });
  }, [editSlug]);

  useEffect(() => {
    if (!saved && !editSlug) localStorage.setItem(DRAFT_KEY, JSON.stringify(sim));
  }, [sim, saved, editSlug]);

  const patch = (p: Partial<Simulator>) => setSim((s) => ({ ...s, ...p }));

  const onScenePick = (id: string) => {
    if (pickMode) {
      const s = sim.steps[pickMode.step];
      if (s && id !== "table") {
        patch({ steps: sim.steps.map((x, i) => (i === pickMode.step ? { ...x, target: id } : x)) });
        setMsg({ kind: "ok", text: `Шаг ${pickMode.step + 1}: правильный объект — «${sim.objects.find((o) => o.id === id)?.label}»` });
      }
      setPickMode(null);
      return;
    }
    setSelected(id);
    setTab("scene");
  };

  const generate = async () => {
    setBusy("ai");
    setMsg(null);
    const r = await simApi.generate(prompt, aud);
    setBusy("");
    if (!r.ok) {
      setMsg({ kind: "err", text: r.error || "Не получилось" });
      return;
    }
    setSim(r.trainer);
    setSaved(null);
    setTab("steps");
    setMsg({ kind: "ok", text: `Готово: ${r.trainer.steps.length} шагов, ${r.trainer.objects.length} объектов. Проверьте шаги и запустите предпросмотр.` });
  };

  const problems = [
    !sim.title.trim() && "нет названия",
    sim.steps.length === 0 && "нет ни одного шага",
    sim.steps.some((s) => !s.instruction.trim()) && "есть шаги без задания",
    sim.steps.some((s) => !sim.objects.some((o) => o.id === s.target)) && "есть шаги без правильного объекта",
  ].filter(Boolean) as string[];

  const save = async () => {
    if (problems.length) {
      setMsg({ kind: "err", text: `Сначала доделайте: ${problems.join(", ")}` });
      return;
    }
    setBusy("save");
    const r = await simApi.save(sim, saved?.slug, saved?.key);
    setBusy("");
    if (!r.ok) {
      setMsg({ kind: "err", text: r.error || "Не сохранилось" });
      return;
    }
    mySims.put({ slug: r.slug, key: r.edit_key, title: sim.title });
    localStorage.removeItem(DRAFT_KEY);
    setSaved({ slug: r.slug, key: r.edit_key });
    if (!editSlug) navigate(`/trenazhery/konstruktor?edit=${r.slug}`, { replace: true });
    setMsg({ kind: "ok", text: "Сохранено. Отправьте ученикам ссылку ниже." });
  };

  const shareUrl = saved ? `${window.location.origin}/trenazhery/p/${saved.slug}` : "";

  const reset = () => {
    if (!confirm("Начать с чистого листа? Несохранённые изменения пропадут.")) return;
    localStorage.removeItem(DRAFT_KEY);
    setSim(clone(EMPTY));
    setSaved(null);
    setSelected(null);
    setTab("ai");
    navigate("/trenazhery/konstruktor", { replace: true });
  };

  if (busy === "load")
    return (
      <div className="min-h-screen bg-mesh font-golos text-white">
        <SimHeader />
        <div className="flex h-[70vh] items-center justify-center text-white/60">
          <Icon name="Loader2" size={26} className="mr-2 animate-spin" /> Загружаем тренажёр…
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo title="Конструктор 3D/VR-тренажёров с ИИ — без программирования" description="Опишите навык словами — ИИ соберёт 3D-тренажёр. Поправьте шаги, ошибки и подсказки и отправьте ссылку ученикам." />
      <SimHeader />

      <main className="mx-auto max-w-[1400px] px-3 pb-10 pt-4 md:px-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Input
            value={sim.title}
            onChange={(e) => patch({ title: e.target.value })}
            className="h-10 max-w-md flex-1 border-white/10 bg-white/5 font-montserrat text-lg font-bold"
            aria-label="Название тренажёра"
          />
          <div className="ml-auto flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={reset} className="text-white/60 hover:text-white">
              <Icon name="FilePlus2" size={15} className="mr-1" /> Новый
            </Button>
            <Button
              size="sm"
              onClick={() => setPreview((p) => !p)}
              disabled={!sim.steps.length}
              className={preview ? "bg-amber-500 text-black hover:bg-amber-400" : "bg-white/10 text-white hover:bg-white/20"}
            >
              <Icon name={preview ? "PencilRuler" : "Play"} size={15} className="mr-1" />
              {preview ? "К редактированию" : "Предпросмотр"}
            </Button>
            <Button size="sm" onClick={save} disabled={busy === "save"} className="bg-gradient-to-r from-violet-500 to-cyan-500 font-bold text-white">
              <Icon name={busy === "save" ? "Loader2" : "Save"} size={15} className={`mr-1 ${busy === "save" ? "animate-spin" : ""}`} />
              {saved ? "Сохранить изменения" : "Сохранить и получить ссылку"}
            </Button>
          </div>
        </div>

        {msg && (
          <div
            className={`mb-3 flex items-start gap-2 rounded-xl px-3 py-2 text-sm ${msg.kind === "ok" ? "bg-emerald-500/15 text-emerald-100" : "bg-rose-500/15 text-rose-100"}`}
          >
            <Icon name={msg.kind === "ok" ? "CheckCircle2" : "CircleAlert"} size={16} className="mt-0.5 shrink-0" />
            <span className="flex-1">{msg.text}</span>
            <button onClick={() => setMsg(null)} className="opacity-60 hover:opacity-100" aria-label="Закрыть">
              <Icon name="X" size={14} />
            </button>
          </div>
        )}

        {saved && (
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-sm">
            <Icon name="Link" size={15} className="text-cyan-300" />
            <span className="text-white/70">Ссылка для учеников:</span>
            <code className="min-w-0 truncate rounded bg-black/30 px-2 py-0.5 text-cyan-100">{shareUrl}</code>
            <button onClick={() => navigator.clipboard?.writeText(shareUrl)} className="text-cyan-200 hover:text-white">
              Копировать
            </button>
            <Link to={`/trenazhery/p/${saved.slug}`} className="ml-auto text-cyan-200 hover:text-white">
              Открыть →
            </Link>
          </div>
        )}

        <div className="grid gap-3 lg:grid-cols-[1fr_400px]">
          <div className="order-2 lg:order-1">
            {preview ? (
              <Player key={JSON.stringify(sim.steps).length + sim.objects.length} sim={sim} />
            ) : (
              <div className="relative h-[58vh] min-h-[420px] overflow-hidden rounded-2xl border border-white/10 bg-black">
                <Scene3D location={sim.location} objects={sim.objects} states={{}} showLabels selected={selected} onPick={onScenePick} />
                <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-black/60 px-2.5 py-1 text-xs text-white/75">
                  {pickMode ? (
                    <span className="text-emerald-300">Нажмите на объект — он станет правильным для шага {pickMode.step + 1}</span>
                  ) : (
                    "Режим редактирования · нажмите на объект, чтобы его настроить"
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="order-1 lg:order-2">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-5 bg-white/5">
                <TabsTrigger value="ai" title="ИИ-сборка">
                  <Icon name="Sparkles" size={15} />
                </TabsTrigger>
                <TabsTrigger value="steps" title="Сценарий">
                  <Icon name="ListOrdered" size={15} />
                </TabsTrigger>
                <TabsTrigger value="scene" title="Сцена">
                  <Icon name="Box" size={15} />
                </TabsTrigger>
                <TabsTrigger value="info" title="Описание">
                  <Icon name="Settings2" size={15} />
                </TabsTrigger>
                <TabsTrigger value="stats" title="Результаты" disabled={!saved}>
                  <Icon name="BarChart3" size={15} />
                </TabsTrigger>
              </TabsList>

              <div className="mt-2 max-h-[calc(58vh+40px)] min-h-[380px] overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <TabsContent value="ai" className="mt-0 space-y-3">
                  <div>
                    <p className="font-bold">Соберите тренажёр с ИИ</p>
                    <p className="text-xs text-white/55">Опишите навык, который нужно отработать, и для кого. ИИ расставит объекты, шаги, ловушки и подсказки.</p>
                  </div>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    placeholder="Например: «Электрик: замена розетки с соблюдением техники безопасности, колледж»"
                    className="bg-white/5"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(AUDIENCE_LABEL) as Audience[]).map((a) => (
                      <button
                        key={a}
                        onClick={() => setAud(a)}
                        className={`rounded-full px-3 py-1 text-xs ${aud === a ? "bg-white text-slate-900" : "bg-white/5 text-white/70"}`}
                      >
                        {AUDIENCE_LABEL[a]}
                      </button>
                    ))}
                  </div>
                  <Button onClick={generate} disabled={busy === "ai" || prompt.trim().length < 10} className="w-full bg-gradient-to-r from-violet-500 to-cyan-500 font-bold text-white">
                    <Icon name={busy === "ai" ? "Loader2" : "Wand2"} size={16} className={`mr-1 ${busy === "ai" ? "animate-spin" : ""}`} />
                    {busy === "ai" ? "ИИ собирает сценарий… до минуты" : "Собрать тренажёр"}
                  </Button>
                  <div>
                    <p className="mb-1 text-xs text-white/45">Идеи:</p>
                    <div className="space-y-1">
                      {IDEAS.map((i) => (
                        <button key={i} onClick={() => setPrompt(i)} className="block w-full rounded-md bg-white/5 px-2 py-1 text-left text-xs text-white/65 hover:text-white">
                          {i}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-white/45">Или начните с шаблона:</p>
                    <div className="flex flex-wrap gap-1">
                      {TEMPLATES.map((t) => (
                        <a
                          key={t.slug}
                          href={`/trenazhery/konstruktor?from=${t.slug}`}
                          className="rounded-md border border-white/10 px-2 py-0.5 text-xs text-white/65 hover:text-white"
                        >
                          {t.title}
                        </a>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="steps" className="mt-0">
                  <StepsPanel sim={sim} onChange={patch} pickMode={pickMode} setPickMode={setPickMode} />
                </TabsContent>

                <TabsContent value="scene" className="mt-0">
                  <ObjectsPanel sim={sim} selected={selected} onSelect={setSelected} onChange={patch} />
                </TabsContent>

                <TabsContent value="info" className="mt-0 space-y-3 text-sm">
                  <label className="block space-y-1">
                    <span className="text-xs text-white/55">Описание для учеников и каталога</span>
                    <Textarea value={sim.description} onChange={(e) => patch({ description: e.target.value })} rows={3} className="bg-white/5" />
                  </label>
                  <div>
                    <p className="mb-1 text-xs text-white/55">Направление</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
                        <button
                          key={c}
                          onClick={() => patch({ category: c })}
                          className={`rounded-full px-3 py-1 text-xs ${sim.category === c ? "bg-violet-500 text-white" : "bg-white/5 text-white/70"}`}
                        >
                          {CATEGORY_LABEL[c]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-white/55">Для кого</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(Object.keys(AUDIENCE_LABEL) as Audience[]).map((a) => {
                        const on = sim.audience.includes(a);
                        return (
                          <button
                            key={a}
                            onClick={() => patch({ audience: on ? sim.audience.filter((x) => x !== a) : [...sim.audience, a] })}
                            className={`rounded-full px-3 py-1 text-xs ${on ? "bg-cyan-500 text-slate-900" : "bg-white/5 text-white/70"}`}
                          >
                            {AUDIENCE_LABEL[a]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <label className="block space-y-1">
                    <span className="text-xs text-white/55">Класс / группа / должность</span>
                    <Input value={sim.grade || ""} onChange={(e) => patch({ grade: e.target.value })} placeholder="Например: 8 класс" className="bg-white/5" />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs text-white/55">Проходной балл: {sim.passScore ?? 70}</span>
                    <input
                      type="range"
                      min={40}
                      max={100}
                      step={5}
                      value={sim.passScore ?? 70}
                      onChange={(e) => patch({ passScore: Number(e.target.value) })}
                      className="w-full accent-violet-500"
                    />
                  </label>
                  <p className="rounded-lg bg-white/5 p-2.5 text-xs text-white/55">
                    Оценка: 100 баллов, −8 за ошибку, −25 за опасную ошибку, −4 за подсказку, −3 за превышение лимита времени. Опасная ошибка — сразу «не сдано».
                  </p>
                </TabsContent>

                <TabsContent value="stats" className="mt-0">{saved && <StatsPanel slug={saved.slug} editKey={saved.key} />}</TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}