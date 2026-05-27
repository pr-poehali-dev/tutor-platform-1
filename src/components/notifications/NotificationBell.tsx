import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  fetchUnreadCount, fetchNotifications, markRead, markAllRead, Notification,
} from "./api";

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  try {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return "только что";
    if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} дн назад`;
    return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
  } catch { return ""; }
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Поллинг непрочитанных каждые 60 сек
  useEffect(() => {
    fetchUnreadCount().then(setCount);
    const t = setInterval(() => fetchUnreadCount().then(setCount), 60_000);
    return () => clearInterval(t);
  }, []);

  // Подгрузка при открытии
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchNotifications().then((list) => {
      setItems(list);
      setLoading(false);
    });
  }, [open]);

  // Клик вне — закрыть
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleRead = async (n: Notification) => {
    if (!n.is_read) {
      await markRead(n.id);
      setCount((c) => Math.max(0, c - 1));
      setItems((prev) => prev.map((x) => x.id === n.id ? { ...x, is_read: true } : x));
    }
  };

  const handleMarkAll = async () => {
    await markAllRead();
    setCount(0);
    setItems((prev) => prev.map((x) => ({ ...x, is_read: true })));
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Уведомления"
        title="Уведомления"
        className="relative flex items-center justify-center w-10 h-10 text-white/70 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-xl transition-colors"
      >
        <Icon name="Bell" size={16} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-br from-rose-500 to-pink-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-[360px] max-w-[calc(100vw-32px)] bg-background/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <p className="font-montserrat font-black text-white text-sm">Уведомления</p>
            {count > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-cyan-300 hover:text-cyan-200 text-[11px] font-bold"
              >
                Прочитать все
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {loading && (
              <div className="text-center py-6 text-white/45 text-xs">
                <Icon name="Loader2" size={18} className="animate-spin mx-auto mb-1" />
                Загружаю...
              </div>
            )}
            {!loading && items.length === 0 && (
              <div className="text-center py-10 px-4">
                <div className="text-4xl mb-2 opacity-50">🔕</div>
                <p className="text-white/55 text-sm">Уведомлений пока нет</p>
                <p className="text-white/35 text-[11px] mt-1">Когда что-то произойдёт — увидишь здесь</p>
              </div>
            )}
            {!loading && items.map((n) => {
              const content = (
                <div
                  className={`flex items-start gap-3 px-4 py-3 border-b border-white/[0.06] hover:bg-white/[0.05] transition-colors ${
                    !n.is_read ? "bg-cyan-500/[0.04]" : ""
                  }`}
                >
                  <div className={`flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 ${
                    !n.is_read ? "bg-cyan-500/15 text-cyan-300" : "bg-white/[0.05] text-white/55"
                  }`}>
                    <Icon name={n.icon || "Bell"} size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm leading-tight mb-0.5 ${!n.is_read ? "font-bold text-white" : "text-white/75"}`}>
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-white/55 text-xs leading-snug line-clamp-2">{n.body}</p>
                    )}
                    <p className="text-white/35 text-[10px] mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1 flex-shrink-0" />
                  )}
                </div>
              );
              return n.url ? (
                <Link
                  key={n.id}
                  to={n.url}
                  onClick={() => { handleRead(n); setOpen(false); }}
                  className="block text-left w-full"
                >
                  {content}
                </Link>
              ) : (
                <button
                  key={n.id}
                  onClick={() => handleRead(n)}
                  className="block text-left w-full"
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
