import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useYookassa } from "@/components/extensions/yookassa/useYookassa";
import { Helper, HelperTemplate, PlanLimits, helperApi, helperLink } from "@/components/ai-helper/api";
import HelperEditor from "@/components/ai-helper/HelperEditor";
import HelperChat from "@/components/ai-helper/HelperChat";
import HelperReportPanel from "@/components/ai-helper/HelperReportPanel";
import HelperLanding from "@/components/ai-helper/HelperLanding";
import func2url from "../../backend/func2url.json";

const YOOKASSA_URL = (func2url as Record<string, string>)["yookassa-yookassa"];
const SITE = "https://учисьпро.рф";

function starter(templates: HelperTemplate[]): Partial<Helper> {
  const t = templates.find((x) => x.id === "clients");
  return t ? { template: t.id, role: t.role, greeting: t.greeting, instructions: t.instructions, knowledge: t.knowledge } : { template: "clients" };
}
type Tab = "test" | "edit" | "report" | "share";

export default function AiHelperStudio() {
  const { isAuthenticated, user, openLogin, loading: authLoading } = useAuth();
  const [params] = useSearchParams();
  const [templates, setTemplates] = useState<HelperTemplate[]>([]);
  const [limits, setLimits] = useState<Record<"free" | "pro", PlanLimits> | null>(null);
  const [price, setPrice] = useState(490);
  const [items, setItems] = useState<Helper[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [tab, setTab] = useState<Tab>("test");
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const { createPayment, isLoading: paying } = useYookassa({ apiUrl: YOOKASSA_URL });

  useEffect(() => {
    helperApi.templates().then((r) => {
      if (r.ok && r.data) {
        setTemplates(r.data.templates);
        setLimits(r.data.limits);
        setPrice(r.data.pro_price);
      }
    });
  }, []);

  const loadMine = useCallback(async () => {
    const r = await helperApi.my();
    setLoaded(true);
    if (r.ok && r.data) {
      setItems(r.data.items);
      setActiveId((cur) => cur ?? r.data!.items[0]?.id ?? null);
      if (!r.data.items.length) setCreating(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadMine();
  }, [isAuthenticated, loadMine]);

  const active = items.find((i) => i.id === activeId) || null;
  const planLimits = limits ? (active?.is_pro ? limits.pro : limits.free) : null;
  const paidReturn = params.get("paid") === "1";

  const upgrade = async () => {
    if (!active || !user?.email) return;
    const o = await helperApi.proOrder(active.id);
    if (!o.ok || !o.data) return alert(o.error || "Не удалось создать заказ");
    const res = await createPayment({
      amount: o.data.amount,
      userEmail: user.email,
      userName: user.name || "",
      description: `ИИ-помощник PRO на 30 дней: ${active.name}`,
      returnUrl: `${window.location.origin}/ai-helper?paid=1`,
      cartItems: [{ id: `ai_helper_pro_${active.id}`, name: "ИИ-помощник PRO — 30 дней", price: o.data.amount, quantity: 1 }],
      metadata: { kind: "ai_helper_pro", pay_id: String(o.data.pay_id), helper_id: String(active.id) },
    });
    if (res?.payment_url && /^https:\/\//.test(res.payment_url)) window.location.href = res.payment_url;
  };

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const seo = (
    <Seo
      title="Свой ИИ-помощник за вечер — без программирования | УЧИСЬПРО"
      description="Создайте ИИ-помощника, который отвечает вашим клиентам, сотрудникам или родителям 24/7 по вашей базе знаний. Без кода, за 10 минут. Бесплатно — 1 помощник и 100 ответов в месяц."
      canonical={`${SITE}/ai-helper`}
      keywords="свой ии помощник, ии ассистент для бизнеса, чат-бот без программирования, ии консультант для сайта, нейросеть отвечает клиентам"
    />
  );

  if (!isAuthenticated) {
    return (
      <>
        {seo}
        <HelperLanding onStart={openLogin} loading={authLoading} limits={limits} price={price} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white">
      {seo}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
          <div>
            <Link to="/cabinet" className="text-white/50 hover:text-white text-sm inline-flex items-center gap-1.5 mb-1">
              <Icon name="ChevronLeft" size={15} /> Кабинет
            </Link>
            <h1 className="font-montserrat font-black text-2xl md:text-3xl">Мои ИИ-помощники</h1>
          </div>
          {!creating && (
            <Button onClick={() => { setCreating(true); setActiveId(null); }} variant="outline">
              <Icon name="Plus" size={16} className="mr-1.5" /> Новый помощник
            </Button>
          )}
        </div>

        {paidReturn && (
          <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm flex items-center gap-2">
            <Icon name="CheckCircle2" size={16} className="text-emerald-300" /> Спасибо! PRO подключится в течение минуты после подтверждения оплаты.
          </div>
        )}

        {items.length > 1 && !creating && (
          <div className="flex gap-2 flex-wrap mb-4">
            {items.map((i) => (
              <button
                key={i.id}
                onClick={() => setActiveId(i.id)}
                className={`px-3 py-1.5 rounded-lg text-sm border ${i.id === activeId ? "border-violet-400 bg-violet-500/20" : "border-white/10 text-white/60"}`}
              >
                {i.name}
              </button>
            ))}
          </div>
        )}

        {!loaded || !limits ? (
          <div className="py-16 text-center"><Icon name="Loader2" size={24} className="animate-spin mx-auto text-white/40" /></div>
        ) : creating ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 md:p-7">
            <HelperEditor
              initial={starter(templates)}
              templates={templates}
              limits={limits.free}
              onSaved={(h) => { setItems((p) => [h, ...p]); setActiveId(h.id); setCreating(false); setTab("test"); }}
              onCancel={items.length ? () => { setCreating(false); setActiveId(items[0].id); } : undefined}
            />
          </div>
        ) : active && planLimits ? (
          <div className="grid lg:grid-cols-[1fr_400px] gap-5">
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 md:p-6 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${active.is_pro ? "bg-amber-400/20 text-amber-200" : "bg-white/10 text-white/60"}`}>
                  {active.is_pro ? "PRO" : "Бесплатно"}
                </span>
                <span className="text-xs text-white/50">
                  Ответов в этом месяце: {active.month_answers ?? 0} из {planLimits.answers_month}
                </span>
              </div>
              <div className="flex gap-1 mb-5 border-b border-white/10 overflow-x-auto">
                {([["test", "Проверить", "MessageCircle"], ["share", "Поделиться", "Share2"], ["edit", "Настроить", "Settings"], ["report", "Отчёт", "BarChart3"]] as [Tab, string, string][]).map(([id, label, icon]) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`px-3 py-2 text-sm font-semibold inline-flex items-center gap-1.5 border-b-2 -mb-px whitespace-nowrap ${tab === id ? "border-violet-400 text-white" : "border-transparent text-white/50"}`}
                  >
                    <Icon name={icon} size={15} /> {label}
                  </button>
                ))}
              </div>

              {tab === "test" && (
                <div className="space-y-3 text-sm text-white/70">
                  <p>Задайте помощнику вопросы, которые обычно задают ваши клиенты. Ваши проверочные вопросы не тратят лимит.</p>
                  <ul className="space-y-1.5">
                    {["Сколько стоит?", "Как к вам записаться?", "Где вы находитесь?", "Есть ли скидки?"].map((q) => (
                      <li key={q} className="flex items-center gap-2"><Icon name="CornerDownRight" size={14} className="text-white/35" /> {q}</li>
                    ))}
                  </ul>
                  <p className="text-white/50">Если помощник отвечает «не знаю» — допишите ответ в базу знаний во вкладке «Настроить».</p>
                </div>
              )}

              {tab === "share" && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-white/60 mb-1.5">Ссылка на помощника — отправьте клиентам, поставьте в шапку профиля, на визитку или в рассылку:</p>
                    <div className="flex gap-2">
                      <input readOnly value={helperLink(active.slug)} className="flex-1 h-11 rounded-xl bg-white/[0.06] border border-white/10 px-3 text-sm" />
                      <Button onClick={() => copy(helperLink(active.slug))} className="bg-violet-600 hover:bg-violet-700">
                        <Icon name={copied ? "Check" : "Copy"} size={16} />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-1.5">Кнопка для вашего сайта — вставьте этот код в любое место страницы:</p>
                    <textarea
                      readOnly
                      className="w-full h-24 rounded-xl bg-white/[0.06] border border-white/10 p-3 text-xs font-mono"
                      value={`<a href="${helperLink(active.slug)}" target="_blank" rel="noopener" style="display:inline-block;padding:12px 20px;border-radius:12px;background:${active.color};color:#fff;font:600 15px sans-serif;text-decoration:none">Задать вопрос помощнику</a>`}
                    />
                  </div>
                  <a href={helperLink(active.slug)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-violet-300 hover:underline">
                    <Icon name="ExternalLink" size={14} /> Открыть как клиент
                  </a>
                </div>
              )}

              {tab === "edit" && (
                <HelperEditor
                  key={active.id}
                  initial={active}
                  templates={templates}
                  limits={planLimits}
                  onSaved={(h) => { setItems((p) => p.map((x) => (x.id === h.id ? { ...x, ...h } : x))); setTab("test"); }}
                />
              )}

              {tab === "report" && <HelperReportPanel id={active.id} onUpgrade={upgrade} price={price} />}

              {!active.is_pro && tab !== "report" && (
                <div className="mt-6 rounded-2xl border border-violet-400/25 bg-violet-500/[0.07] p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm">
                    <p className="font-bold">PRO — {price} ₽ за 30 дней</p>
                    <p className="text-white/60">{limits.pro.answers_month.toLocaleString("ru-RU")} ответов, база до {limits.pro.knowledge.toLocaleString("ru-RU")} символов, до {limits.pro.helpers} помощников и полный отчёт по вопросам клиентов</p>
                  </div>
                  <Button onClick={upgrade} disabled={paying} className="bg-violet-600 hover:bg-violet-700">
                    {paying ? <Icon name="Loader2" size={16} className="animate-spin" /> : "Подключить PRO"}
                  </Button>
                </div>
              )}
            </div>

            <div className="lg:sticky lg:top-4 self-start">
              <HelperChat key={`${active.id}-${active.greeting}`} slug={active.slug} name={active.name} greeting={active.greeting} color={active.color} compact />
            </div>
          </div>
        ) : null}
      </div>
      <SiteFooter />
    </div>
  );
}
