import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/context/AccessContext";
import { trackGoal } from "@/components/analytics/YandexMetrika";
import { pendingJoin, pilotApi } from "./api";

/**
 * Ученик начал подключение по ссылке школы и ушёл входить через Яндекс —
 * после возврата на сайт доступ открывается сам, а ученик видит подтверждение.
 */
export default function PilotPendingJoin() {
  const { isAuthenticated, token } = useAuth();
  const { refreshAccess } = useAccess();
  const { pathname } = useLocation();
  const [done, setDone] = useState<string | null>(null);
  const running = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !token || running.current || pathname.startsWith("/s/")) return;
    const p = pendingJoin.get();
    if (!p) return;
    running.current = true;
    pilotApi.activate(token, p.code, p.classLabel).then((r) => {
      pendingJoin.clear();
      running.current = false;
      if (!r.ok) return;
      trackGoal("pilot_student_activated", { school: p.code, already: r.already, via: "return" });
      refreshAccess();
      setDone(r.school_name);
    });
  }, [isAuthenticated, token, pathname, refreshAccess]);

  if (!done) return null;
  return (
    <div className="fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4">
      <div className="flex max-w-md items-start gap-3 rounded-2xl border border-emerald-400/40 bg-slate-900/95 p-4 text-white shadow-2xl backdrop-blur">
        <Icon name="CheckCircle2" size={22} className="mt-0.5 shrink-0 text-emerald-300" />
        <div className="flex-1 text-sm">
          <p className="font-bold">Доступ открыт до 31.05.2027</p>
          <p className="text-white/70">{done} — все школьные курсы и ИИ-наставник бесплатны.</p>
          <Link to="/super-courses" onClick={() => setDone(null)} className="mt-1 inline-block font-bold text-cyan-200">
            Начать заниматься →
          </Link>
        </div>
        <button onClick={() => setDone(null)} className="text-white/50 hover:text-white" aria-label="Закрыть">
          <Icon name="X" size={16} />
        </button>
      </div>
    </div>
  );
}
