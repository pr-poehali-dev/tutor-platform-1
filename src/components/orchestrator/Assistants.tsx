import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/context/AccessContext";
import { assistantsList, assistantChat, Assistant, ChatMessage, PRO_COURSE_ID } from "./api";
import ChatMarkdown from "./ChatMarkdown";
import { trackGoal } from "@/components/analytics/YandexMetrika";

const PRO_PRICE = 15000;

export default function Assistants({
  onBack,
  initialAssistantId,
  initialPrompt,
}: {
  onBack: () => void;
  initialAssistantId?: string;
  initialPrompt?: string;
}) {
  const [list, setList] = useState<Assistant[]>([]);
  const [freeLimit, setFreeLimit] = useState(3);
  const [used, setUsed] = useState(0);
  const [pro, setPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Assistant | null>(null);
  const [presetPrompt, setPresetPrompt] = useState<string | undefined>(initialPrompt);

  const load = async () => {
    const res = await assistantsList();
    setList(res.assistants);
    setFreeLimit(res.free_limit);
    setUsed(res.used);
    setPro(res.pro_access);
    setLoading(false);
    if (initialAssistantId) {
      const found = res.assistants.find((a) => a.id === initialAssistantId);
      if (found) setActive(found);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-white/50">
        <Icon name="Loader2" size={28} className="animate-spin mx-auto mb-2 text-violet-300" /> Загружаем ассистентов…
      </div>
    );
  }

  if (active) {
    return (
      <ChatPanel
        assistant={active}
        pro={pro}
        freeLimit={freeLimit}
        presetPrompt={presetPrompt}
        onBack={() => { setActive(null); setPresetPrompt(undefined); load(); }}
      />
    );
  }

  const remaining = Math.max(0, freeLimit - used);

  return (
    <div>
      <button onClick={onBack} className="text-white/50 hover:text-white text-sm mb-4 inline-flex items-center gap-1">
        <Icon name="ChevronLeft" size={16} /> Назад
      </button>

      <div className="mb-5">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-violet-200 bg-violet-500/15 border border-violet-400/25 rounded-lg px-3 py-1 mb-3">
          <Icon name="Sparkles" size={13} /> ИИ-ассистенты
        </span>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-1">
          Готовые специалисты в чате
        </h2>
        <p className="text-white/55 text-sm">
          Выберите ассистента — и поставьте ему задачу прямо сейчас. Пишет код, тексты, контент-планы, вакансии,
          скрипты продаж. Часть работы можно закрыть, вообще никого не нанимая.
        </p>
      </div>

      {!pro && (
        <div className="flex items-center gap-2 text-sm text-white/70 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 mb-4">
          <Icon name="Gift" size={16} className="text-violet-300 flex-shrink-0" />
          <span>Бесплатно доступно {remaining} из {freeLimit} сообщений. Дальше — в подписке Оркестратор PRO.</span>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {list.map((a) => (
          <button
            key={a.id}
            onClick={() => { trackGoal("orchestrator_assistant_open", { assistant: a.id }); setActive(a); }}
            className="text-left rounded-2xl border border-white/10 bg-white/[0.03] hover:border-violet-400/40 hover:bg-violet-500/[0.05] transition-colors p-4 flex gap-3"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <Icon name={a.icon} size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white text-[15px]">
                {a.name} <span className="text-white/40 font-normal text-xs">· {a.role}</span>
              </div>
              <p className="text-white/55 text-xs mt-0.5">{a.tagline}</p>
            </div>
            <Icon name="ChevronRight" size={16} className="text-violet-300 flex-shrink-0 ml-auto self-center" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatPanel({
  assistant, pro, freeLimit, presetPrompt, onBack,
}: {
  assistant: Assistant;
  pro: boolean;
  freeLimit: number;
  presetPrompt?: string;
  onBack: () => void;
}) {
  const { isAuthenticated, openLogin } = useAuth();
  const { buyCourse } = useAccess();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(presetPrompt || "");
  const [sending, setSending] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(pro ? null : freeLimit);
  const [limitReached, setLimitReached] = useState(false);
  const [buying, setBuying] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const send = async (text: string) => {
    if (sending || !text.trim()) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text.trim() }];
    setMessages(next);
    setInput("");
    setSending(true);
    const res = await assistantChat(assistant.id, next);
    setSending(false);
    if (res.limitReached) {
      setLimitReached(true);
      return;
    }
    if (!res.ok) {
      setMessages([...next, { role: "assistant", content: res.message || "Извините, произошла ошибка. Попробуйте ещё раз." }]);
      return;
    }
    setMessages([...next, { role: "assistant", content: res.reply || "" }]);
    if (typeof res.remaining === "number") setRemaining(res.remaining);
    if (res.pro) setRemaining(null);
  };

  const startPay = async () => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    if (buying) return;
    setBuying(true);
    const returnUrl = `${window.location.origin}/orchestrator?pro=1`;
    const res = await buyCourse(PRO_COURSE_ID, "adult", "Оркестратор PRO — ИИ-ассистенты и дашборд", returnUrl);
    setBuying(false);
    if (res.ok && res.alreadyPurchased) {
      setLimitReached(false);
      setRemaining(null);
      return;
    }
    if (res.ok && res.paymentUrl) window.location.href = res.paymentUrl;
  };

  return (
    <div className="flex flex-col h-[70vh] min-h-[480px] rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden">
      {/* Шапка */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/[0.03]">
        <button onClick={onBack} className="text-white/50 hover:text-white flex-shrink-0" aria-label="Назад">
          <Icon name="ChevronLeft" size={20} />
        </button>
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
          <Icon name={assistant.icon} size={17} className="text-white" />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-white text-sm leading-tight">{assistant.name}</div>
          <div className="text-white/45 text-xs">{assistant.role}</div>
        </div>
        {remaining !== null && (
          <span className="ml-auto text-[11px] text-white/50 bg-white/[0.06] border border-white/10 rounded-lg px-2 py-1">
            осталось {remaining}
          </span>
        )}
      </div>

      {/* Лента */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mx-auto mb-3">
              <Icon name={assistant.icon} size={26} className="text-white" />
            </div>
            <p className="text-white/70 text-sm mb-4">
              Привет! Я {assistant.name}, ваш {assistant.role.toLowerCase()}. Чем помочь?
            </p>
            <div className="flex flex-col gap-2 max-w-sm mx-auto">
              {assistant.examples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => send(ex)}
                  className="text-left text-sm text-white/75 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 hover:border-violet-400/40 transition-colors"
                >
                  <Icon name="ArrowUpRight" size={13} className="inline mr-1 text-violet-300" /> {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-sm">
                {m.content}
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-start">
              <div className="max-w-[92%] bg-white/[0.05] border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
                <ChatMarkdown text={m.content} />
              </div>
            </div>
          ),
        )}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-white/[0.05] border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
              <Icon name="Loader2" size={16} className="animate-spin text-violet-300" />
            </div>
          </div>
        )}

        {limitReached && (
          <div className="rounded-2xl border border-violet-400/30 bg-violet-500/[0.08] p-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-cyan-400 flex items-center justify-center text-xl mx-auto mb-3">🎼</div>
            <h4 className="font-montserrat font-black text-white mb-1">Бесплатные сообщения закончились</h4>
            <p className="text-white/70 text-sm mb-4">
              Оформите Оркестратор PRO — и общайтесь со всеми ассистентами без ограничений, плюс рабочий дашборд.
            </p>
            <button
              onClick={startPay}
              disabled={buying}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-6 py-3 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-60"
            >
              {buying ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Lock" size={16} />}
              Открыть PRO — {PRO_PRICE.toLocaleString("ru-RU")} ₽
            </button>
          </div>
        )}
      </div>

      {/* Ввод */}
      {!limitReached && (
        <div className="border-t border-white/10 p-3 bg-white/[0.02]">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder={`Напишите задачу для ${assistant.name}…`}
              rows={1}
              className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500/50 resize-none max-h-32"
            />
            <button
              onClick={() => send(input)}
              disabled={sending || !input.trim()}
              className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center disabled:opacity-40 hover:scale-105 transition-transform"
              aria-label="Отправить"
            >
              <Icon name="Send" size={18} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}