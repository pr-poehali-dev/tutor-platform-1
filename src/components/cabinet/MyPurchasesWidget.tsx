import { useEffect, useState } from "react";
import { Link } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";
import { COURSES } from "@/components/courses/coursesData";
import { courseUrl } from "@/components/courses/courseSlug";
import { saveAccess } from "@/components/intensive/api";
import func2url from "../../../backend/func2url.json";

const ACCESS_URL = (func2url as Record<string, string>).access;

/** Отдельные продукты, которые оплачиваются не как курс каталога. */
const PRODUCTS: Record<string, { title: string; href: string; icon: string; note: string }> = {
  "ai-assistant": { title: "ИИ-ассистент для работы", href: "/ai-assistant#lessons", icon: "Bot", note: "Курс · 5 дней с ИИ-наставником" },
  automation: { title: "Твой первый автопилот", href: "/intensive", icon: "Workflow", note: "Интенсив по автоматизации · 7 дней" },
  "spy-language": { title: "Язык за 30 дней: ядро 1000 слов", href: "/yazyk-za-30-dney", icon: "Globe", note: "Интенсив · 30 дней, 8 языков" },
  bizreport: { title: "Разбор бизнес-идеи", href: "/biz-report", icon: "FileText", note: "PDF-разбор от Бизнес-лаборатории" },
};

interface Item {
  key: string;
  title: string;
  note: string;
  href: string;
  icon: string;
  emoji?: string;
  paidAt: string | null;
}

interface Purchases {
  courses: { course_id: number; paid_at: string | null }[];
  products: { track: string; token: string; email: string; paid_at: string | null }[];
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

/** «Мои покупки»: всё оплаченное — курсы каталога, интенсивы и отдельные продукты. */
export default function MyPurchasesWidget() {
  const { token } = useAuth();
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetch(`${ACCESS_URL}?action=my_purchases`, { headers: { "X-Auth-Token": token } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Purchases | null) => {
        if (cancelled) return;
        if (!data) { setItems([]); return; }
        const list: Item[] = [];
        // Доступ к отдельным продуктам привязан к email — сохраняем его на этом устройстве,
        // чтобы уроки открылись сразу, без повторной проверки по почте.
        data.products.forEach((p) => {
          if (p.token && p.email) saveAccess(p.email, p.token, p.track);
          const meta = PRODUCTS[p.track];
          if (meta) list.push({ key: p.track, ...meta, paidAt: p.paid_at });
        });
        data.courses.forEach((c) => {
          const course = COURSES.find((x) => x.id === c.course_id);
          if (!course) return;
          list.push({
            key: `course-${course.id}`,
            title: course.title,
            note: "Курс · доступ навсегда",
            href: courseUrl(course),
            icon: "GraduationCap",
            emoji: course.tutorAvatar,
            paidAt: c.paid_at,
          });
        });
        setItems(list);
      })
      .catch(() => !cancelled && setItems([]));
    return () => { cancelled = true; };
  }, [token]);

  if (items === null) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 mb-6 flex items-center gap-3 text-white/60 text-sm">
        <Icon name="Loader2" size={18} className="animate-spin text-purple-300" />
        Загружаем ваши покупки…
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 p-6 md:p-7 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <Icon name="ShoppingBag" size={18} className="text-emerald-300" />
        <h2 className="font-montserrat font-black text-xl text-white">Мои покупки</h2>
      </div>
      <p className="text-white/55 text-sm mb-5">Всё оплаченное открыто навсегда — нажмите, чтобы продолжить обучение.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((it) => (
          <Link
            key={it.key}
            to={it.href}
            className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-emerald-400/40 p-4 transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-400/25 flex items-center justify-center flex-shrink-0 text-xl">
              {it.emoji ? it.emoji : <Icon name={it.icon} size={20} className="text-emerald-300" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white font-bold text-sm leading-snug line-clamp-2">{it.title}</p>
              <p className="text-white/50 text-xs mt-0.5">
                {it.note}{it.paidAt ? ` · оплачено ${formatDate(it.paidAt)}` : ""}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-emerald-300 text-xs font-bold flex-shrink-0">
              Открыть
              <Icon name="ArrowRight" size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
