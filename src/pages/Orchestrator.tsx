import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import Icon from "@/components/ui/icon";
import { generateTrack, Track, ResourceItem } from "@/components/orchestrator/api";
import TrackView from "@/components/orchestrator/TrackView";
import LeadForm from "@/components/orchestrator/LeadForm";
import StoriesBlock from "@/components/orchestrator/StoriesBlock";
import Dashboard from "@/components/orchestrator/Dashboard";
import ResourcePlanner from "@/components/orchestrator/ResourcePlanner";
import Assistants from "@/components/orchestrator/Assistants";
import { trackGoal } from "@/components/analytics/YandexMetrika";

const SITE_URL = "https://учисьпро.рф";

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Что делает «Оркестратор»?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Вы указываете роль исполнителя и специфику проекта, а ИИ собирает трек адаптации: матрицу навыков, входной контроль, план онбординга по дням, микрозадачи с критериями «готово» и карту рисков. Дальше в рабочем дашборде вы ведёте исполнителей по задачам и следите за метриками качества.",
      },
    },
    {
      "@type": "Question",
      name: "Нужно ли платить, чтобы увидеть трек?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Нет. Генерация трека адаптации бесплатна — вы сразу видите матрицу навыков, онбординг, задачи и риски. Платный только рабочий дашборд PRO для ведения исполнителей и метрик.",
      },
    },
    {
      "@type": "Question",
      name: "Чем это отличается от таск-трекера?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "«Оркестратор» — это не просто список задач, а единая логика «онбординг → задачи → обучение → метрики». Входной контроль отсеивает слабых до старта, критерии «готово» снижают правки, а карточки качества показывают риски по каждому исполнителю заранее.",
      },
    },
  ],
};

type Stage = "intro" | "form" | "loading" | "track" | "dashboard" | "resources" | "assistants";

// Подбор подходящего ИИ-ассистента по тексту задачи (эвристика по ключевым словам)
function pickAssistant(task: string): string {
  const t = task.toLowerCase();
  const rules: [string, string[]][] = [
    ["programmer", ["код", "программ", "разработ", "верст", "react", "api", "бэкенд", "фронт", "баг", "скрипт", "python", "sql", "интеграц"]],
    ["designer", ["дизайн", "макет", "логотип", "ui", "ux", "интерфейс", "баннер", "иллюстрац", "палитр"]],
    ["smm", ["smm", "reels", "сторис", "инстаграм", "instagram", "telegram", "телеграм", "соцсет", "контент-план", "пост"]],
    ["marketer", ["маркет", "реклам", "воронк", "трафик", "продвиж", "директ", "таргет", "оффер", "seo", "стратег"]],
    ["copywriter", ["текст", "копирайт", "лендинг", "статья", "рассылк", "письмо", "заголов", "описание", "слоган"]],
    ["recruiter", ["ваканс", "найм", "рекрут", "собесед", "hr", "кандидат", "резюме"]],
    ["analyst", ["аналит", "метрик", "данны", "отчёт", "отчет", "дашборд", "выгрузк", "статистик", "ltv", "экономик"]],
    ["sales", ["продаж", "звонок", "скрипт продаж", "кп", "коммерческ", "возражени", "сделк", "клиент"]],
  ];
  for (const [id, kws] of rules) {
    if (kws.some((k) => t.includes(k))) return id;
  }
  return "copywriter";
}

export default function Orchestrator() {
  const [stage, setStage] = useState<Stage>("intro");
  const [role, setRole] = useState("");
  const [brief, setBrief] = useState("");
  const [track, setTrack] = useState<Track | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [hireNote, setHireNote] = useState("");
  const [asstInit, setAsstInit] = useState<{ id?: string; prompt?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Открыть заявку с предзаполненной задачей под подбор внешнего исполнителя
  const openHire = (item: ResourceItem) => {
    trackGoal("orchestrator_hire_click");
    const note = `Нужен подбор внешнего исполнителя под задачу: «${item.task}».` +
      (item.hiring?.profile ? `\nПрофиль: ${item.hiring.profile}` : "") +
      (item.hiring?.budget ? `\nБюджет: ${item.hiring.budget}` : "");
    setHireNote(note);
    setShowForm(true);
    setStage("track");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Открыть чат с ИИ-ассистентом под конкретную задачу (из раскладки «силами ИИ»)
  const openAskAI = (item: ResourceItem) => {
    trackGoal("orchestrator_ask_ai_click");
    setAsstInit({ id: pickAssistant(item.task), prompt: item.task });
    setStage("assistants");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Возврат после оплаты → сразу дашборд
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      if (p.get("pro") === "1") setStage("dashboard");
      if (p.get("start") === "1") setStage("form");
    } catch {
      /* ignore */
    }
  }, []);

  const generate = async () => {
    if (role.trim().length < 2) {
      setError("Укажите роль исполнителя");
      return;
    }
    setStage("loading");
    setError(null);
    const res = await generateTrack(role.trim(), brief.trim());
    if (!res.ok || !res.track) {
      setError(res.message || "Не удалось собрать трек, попробуйте ещё раз");
      setStage("form");
      return;
    }
    setTrack(res.track);
    trackGoal("orchestrator_track_ready");
    setStage("track");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = () => {
    setRole(""); setBrief(""); setTrack(null); setShowForm(false);
    setStage("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const start = () => {
    trackGoal("orchestrator_start");
    setStage("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Оркестратор — конструктор онбординга и координации удалённых команд с ИИ"
        description="Укажите роль и проект — ИИ соберёт трек адаптации фрилансера: матрицу навыков, входной контроль, онбординг по дням, микрозадачи с критериями «готово» и карту рисков. Плюс рабочий дашборд с метриками качества. Бесплатная генерация трека."
        canonical={`${SITE_URL}/orchestrator`}
        keywords="онбординг фрилансеров, координация удалённой команды, управление фрилансерами, адаптация сотрудников, контроль качества исполнителей, дашборд задач, ии для управления командой, входной контроль исполнителей"
        jsonLd={[FAQ_JSON_LD]}
      />

      <Header />

      <main className="relative z-10 max-w-3xl mx-auto px-4 md:px-6 pt-6 pb-16">
        <Breadcrumbs className="mb-6" items={[{ label: "Главная", href: "/" }, { label: "Оркестратор" }]} />

        {stage === "intro" && (
          <Intro
            onStart={start}
            onDashboard={() => setStage("dashboard")}
            onResources={() => { trackGoal("orchestrator_resources_open"); setStage("resources"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            onAssistants={() => { trackGoal("orchestrator_assistants_open"); setAsstInit(null); setStage("assistants"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          />
        )}

        {stage === "form" && (
          <FormView role={role} brief={brief} error={error} setRole={setRole} setBrief={setBrief} onGenerate={generate} onDashboard={() => setStage("dashboard")} />
        )}

        {stage === "loading" && <LoadingView />}

        {stage === "track" && track && (
          <>
            {showForm ? (
              <LeadForm roleTitle={role} brief={brief} track={track} initialMessage={hireNote} onClose={() => { setShowForm(false); setHireNote(""); }} />
            ) : (
              <TrackView
                track={track}
                onApply={() => { trackGoal("orchestrator_apply_click"); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                onRestart={restart}
                onOpenDashboard={() => { setStage("dashboard"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                onPlanResources={() => { trackGoal("orchestrator_resources_open"); setStage("resources"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              />
            )}
          </>
        )}

        {stage === "resources" && (
          <ResourcePlanner
            roleTitle={role}
            brief={brief}
            track={track}
            onBack={() => { setStage(track ? "track" : "intro"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            onHire={openHire}
            onAskAI={openAskAI}
          />
        )}

        {stage === "assistants" && (
          <Assistants
            initialAssistantId={asstInit?.id}
            initialPrompt={asstInit?.prompt}
            onBack={() => { setAsstInit(null); setStage(track ? "track" : "intro"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          />
        )}

        {stage === "dashboard" && (
          <div className="space-y-4">
            <button onClick={() => setStage(track ? "track" : "intro")} className="text-white/50 hover:text-white text-sm inline-flex items-center gap-1">
              <Icon name="ChevronLeft" size={16} /> {track ? "К треку" : "На главную раздела"}
            </button>
            <Dashboard pendingTrack={track} onTrackConsumed={() => setTrack(track)} />
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function Header() {
  return (
    <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-lg">🎼</div>
          <span className="font-montserrat font-black text-base gradient-text-purple group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
        </Link>
        <Link to="/courses" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-white border border-white/15 hover:border-violet-400/50 px-4 py-2 rounded-xl transition-colors">
          <Icon name="Library" size={15} className="text-violet-300" /> Каталог курсов
        </Link>
      </div>
    </div>
  );
}

function Intro({ onStart, onDashboard, onResources, onAssistants }: { onStart: () => void; onDashboard: () => void; onResources: () => void; onAssistants: () => void }) {
  const steps = [
    { icon: "SlidersHorizontal", title: "Опишите роль и проект", text: "Фронтендер, копирайтер, менеджер продаж — и специфику задачи." },
    { icon: "Wand2", title: "ИИ соберёт трек адаптации", text: "Навыки, входной контроль, онбординг по дням, задачи с критериями." },
    { icon: "LayoutDashboard", title: "Ведите в дашборде", text: "Задачи по статусам, оценки качества, риски по каждому исполнителю." },
  ];
  const assistants = [
    { icon: "Code2", label: "Программист" },
    { icon: "Megaphone", label: "Маркетолог" },
    { icon: "Instagram", label: "SMM" },
    { icon: "PenLine", label: "Копирайтер" },
    { icon: "Palette", label: "Дизайнер" },
    { icon: "UserSearch", label: "HR" },
    { icon: "ChartNoAxesCombined", label: "Аналитик" },
    { icon: "Handshake", label: "Продажник" },
  ];
  return (
    <div>
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-violet-200 bg-violet-500/15 border border-violet-500/25 rounded-lg px-3 py-1 mb-4">
          <Icon name="Music4" size={14} /> Оркестратор
        </span>
        <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-[1.05] mb-4">
          Ввод и контроль <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">удалённых исполнителей</span>
        </h1>
        <p className="text-white/70 text-base md:text-lg max-w-xl mx-auto">
          ИИ быстро собирает под проект персональный трек адаптации фрилансера, ведёт его по микрозадачам с чёткими
          критериями «готово» и собирает для вас прозрачные метрики качества и риски. Оркестр играет по нотам —
          без гонки за сроками и ручного тушения пожаров.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-8">
        {steps.map((s, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center mb-3">
              <Icon name={s.icon} size={20} className="text-violet-300" />
            </div>
            <h3 className="font-bold text-white mb-1">{s.title}</h3>
            <p className="text-white/55 text-sm">{s.text}</p>
          </div>
        ))}
      </div>

      {/* ИИ-ассистенты: готовые специалисты в чате */}
      <div className="rounded-3xl border border-violet-400/30 bg-gradient-to-br from-violet-600/12 to-cyan-500/8 p-6 md:p-7 mb-4">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-violet-200 bg-violet-500/15 border border-violet-400/25 rounded-lg px-3 py-1 mb-3">
          <Icon name="Sparkles" size={13} /> ИИ-ассистенты
        </span>
        <h3 className="font-montserrat font-black text-white text-xl mb-1">Готовые специалисты — прямо в чате</h3>
        <p className="text-white/60 text-sm mb-4">
          Не все задачи нужно кому-то отдавать. Программист, маркетолог, SMM-щик, копирайтер и другие ИИ-специалисты
          выполнят работу здесь и сейчас: код, тексты, контент-планы, вакансии, скрипты продаж.
        </p>
        <div className="flex flex-wrap gap-2 mb-5">
          {assistants.map((a) => (
            <span key={a.label} className="inline-flex items-center gap-1.5 text-xs text-white/80 bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-1.5">
              <Icon name={a.icon} size={13} className="text-violet-300" /> {a.label}
            </span>
          ))}
        </div>
        <button
          onClick={onAssistants}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-6 py-3.5 rounded-xl hover:scale-[1.02] transition-transform"
        >
          <Icon name="MessageSquare" size={18} /> Поставить задачу ассистенту
        </button>
      </div>

      {/* Планировщик ресурсов: сами / ИИ / внешний */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-7 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-violet-200 bg-violet-500/15 border border-violet-400/25 rounded-lg px-3 py-1 mb-2">
              <Icon name="Split" size={13} /> Планировщик ресурсов
            </span>
            <h3 className="font-montserrat font-black text-white text-xl mb-1">Что сделать самим, а кого нанять</h3>
            <p className="text-white/60 text-sm">
              Перечислите задачи проекта — ИИ честно разложит их на «своими силами», «силами ИИ» и «нужен внешний
              спец», а для внешних соберёт готовую вакансию с профилем, бюджетом и вопросами на собес.
            </p>
          </div>
          <button
            onClick={onResources}
            className="flex-shrink-0 inline-flex items-center justify-center gap-2 bg-white/[0.06] border border-violet-400/30 text-white font-bold px-6 py-3.5 rounded-xl hover:bg-violet-500/15 transition-colors"
          >
            <Icon name="Split" size={18} className="text-violet-300" /> Распределить задачи
          </button>
        </div>
      </div>

      <StoriesBlock />

      <div className="rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-600/15 to-cyan-500/10 p-6 md:p-8 text-center">
        <p className="text-white/80 mb-1">Трек адаптации под вашу роль</p>
        <div className="font-montserrat font-black text-3xl text-white mb-1">бесплатно</div>
        <p className="text-white/45 text-xs mb-5">Матрицу навыков, онбординг и задачи увидите сразу. Платный — только рабочий дашборд.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={onStart} className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-8 py-4 rounded-xl hover:scale-[1.02] transition-transform">
            <Icon name="Rocket" size={18} /> Собрать трек
          </button>
          <button onClick={onDashboard} className="inline-flex items-center justify-center gap-2 text-white font-bold px-8 py-4 rounded-xl border border-white/15 hover:border-violet-400/50 transition-colors">
            <Icon name="LayoutDashboard" size={18} /> Открыть дашборд
          </button>
        </div>
      </div>
    </div>
  );
}

function FormView({
  role, brief, error, setRole, setBrief, onGenerate, onDashboard,
}: {
  role: string;
  brief: string;
  error: string | null;
  setRole: (v: string) => void;
  setBrief: (v: string) => void;
  onGenerate: () => void;
  onDashboard: () => void;
}) {
  const inputCls = "w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500/50";
  const examples = ["Фронтенд-разработчик (React)", "Копирайтер", "Менеджер по продажам B2B", "UX/UI дизайнер", "QA-инженер", "SMM-специалист"];
  return (
    <div>
      <div className="mb-6">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-1">Опишите, кого вводите в проект</h2>
        <p className="text-white/55 text-sm">Чем конкретнее роль и специфика — тем точнее трек адаптации.</p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6 space-y-4">
        <div>
          <label className="block text-white/70 text-sm font-semibold mb-1">Роль исполнителя <span className="text-violet-300">*</span></label>
          <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Например: Фронтенд-разработчик (React)" className={inputCls} />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {examples.map((ex) => (
              <button key={ex} onClick={() => setRole(ex)} className="text-[11px] text-white/60 bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 hover:border-violet-400/40 hover:text-white transition-colors">
                {ex}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-white/70 text-sm font-semibold mb-1">Специфика проекта</label>
          <p className="text-white/40 text-[11px] mb-1.5">Стек, дедлайны, стандарты, tone of voice, CRM, SLA — что важно для этой задачи.</p>
          <textarea value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Например: финтех-стартап, разработка личного кабинета, строгие дедлайны и код-ревью" rows={3} className={`${inputCls} resize-y`} />
        </div>
      </div>

      {error && <div className="mt-4 text-rose-300 text-sm">{error}</div>}

      <button onClick={onGenerate} disabled={role.trim().length < 2} className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold py-4 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] transition-transform">
        <Icon name="Sparkles" size={18} /> Собрать трек адаптации
      </button>
      <button onClick={onDashboard} className="mt-3 block mx-auto text-white/50 hover:text-white text-sm transition-colors">
        <Icon name="LayoutDashboard" size={14} className="inline mr-1" /> Уже есть проекты — открыть дашборд
      </button>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center min-h-[300px] flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-violet-500/15 flex items-center justify-center mb-5">
        <Icon name="Loader2" size={32} className="text-violet-300 animate-spin" />
      </div>
      <h3 className="font-montserrat font-black text-xl text-white mb-2">Собираем трек адаптации…</h3>
      <p className="text-white/55 text-sm max-w-sm">
        Формируем матрицу навыков, входной контроль, онбординг по дням, задачи с критериями и карту рисков под вашу роль.
      </p>
    </div>
  );
}