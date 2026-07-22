import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import Icon from "@/components/ui/icon";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SchoolProspectCard from "@/components/edtech/SchoolProspectCard";
import {
  fetchProspects,
  updateProspect,
  createProspect,
  SchoolProspect,
  ProspectStatus,
  STATUS_META,
  STATUS_ORDER,
  SEGMENT_META,
} from "@/components/edtech/schoolCrmApi";

export default function EdTechJobsPage() {
  const [items, setItems] = useState<SchoolProspect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProspectStatus | "all">("all");
  const [segFilter, setSegFilter] = useState<string>("all");

  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newContact, setNewContact] = useState("");

  const load = () => {
    setLoading(true);
    fetchProspects()
      .then((data) => setItems(data.items))
      .catch(() => setError("Не удалось загрузить базу школ"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const stats = useMemo(() => {
    const s: Record<string, number> = {};
    for (const st of STATUS_ORDER) s[st] = 0;
    for (const it of items) s[it.status] = (s[it.status] || 0) + 1;
    return s;
  }, [items]);

  const segments = useMemo(() => {
    const set = new Set(items.map((i) => i.segment));
    return Array.from(set);
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (segFilter !== "all" && s.segment !== segFilter) return false;
      if (q) {
        const blob = [s.name, s.city, s.fit_reason, ...s.subjects].join(" ").toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [items, query, statusFilter, segFilter]);

  const patchLocal = (id: number, patch: Partial<SchoolProspect>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const handleStatus = async (id: number, status: ProspectStatus) => {
    patchLocal(id, { status });
    setSavingId(id);
    try {
      await updateProspect(id, { status });
    } catch {
      load();
    } finally {
      setSavingId(null);
    }
  };

  const handleNote = async (id: number, note: string) => {
    patchLocal(id, { note });
    setSavingId(id);
    try {
      await updateProspect(id, { note });
    } catch {
      load();
    } finally {
      setSavingId(null);
    }
  };

  const handleServices = async (id: number, services_offered: string[]) => {
    patchLocal(id, { services_offered });
    setSavingId(id);
    try {
      await updateProspect(id, { services_offered });
    } catch {
      load();
    } finally {
      setSavingId(null);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      const created = await createProspect({
        name: newName.trim(),
        city: newCity.trim(),
        contact_hint: newContact.trim(),
      });
      setItems((prev) => [created, ...prev]);
      setNewName("");
      setNewCity("");
      setNewContact("");
      setAddOpen(false);
    } catch {
      setError("Не удалось добавить школу");
    }
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="CRM маленьких школ — база клиентов для услуг платформы | УЧИСЬПРО"
        description="Рабочая CRM-база небольших онлайн-школ и репетиторских центров: воронка продаж, статусы сделок, заметки и отметки о предложенных услугах платформы."
        canonical="https://xn--h1agdcde2c.xn--p1ai/edtech-jobs"
        noindex
      />

      {/* Header bar */}
      <header className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4" aria-label="Шапка сайта">
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="На главную УЧИСЬПРО">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg" aria-hidden="true">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "CRM маленьких школ" }]} />
          </div>
        </nav>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-5 md:px-8 pt-8 md:pt-12 pb-4">
          <Link to="/" className="inline-flex items-center gap-2 text-white/55 hover:text-white text-sm mb-5 transition-colors">
            <Icon name="ArrowLeft" size={14} />
            На главную
          </Link>

          <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/25 rounded-full px-3.5 py-1 mb-4">
            <Icon name="Target" size={13} className="text-purple-300" />
            <span className="text-xs text-purple-300 font-semibold uppercase tracking-wider">Инструмент продаж</span>
          </div>

          <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white mb-3 leading-tight">
            Маленькие школы — <span className="gradient-text-purple">ваши клиенты</span>
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mb-6">
            Небольшие онлайн-школы и репетиторские центры без своей платформы — идеальные
            клиенты для наших услуг. Ведите их по воронке: отмечайте статус, что предложили
            и договорённости. Всё сохраняется автоматически.
          </p>

          {/* Воронка */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {STATUS_ORDER.map((st) => {
              const meta = STATUS_META[st];
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(statusFilter === st ? "all" : st)}
                  className={`text-left bg-card border rounded-2xl p-4 transition-all ${
                    statusFilter === st ? "border-white/40" : "border-white/10 hover:border-white/25"
                  }`}
                >
                  <span className={`inline-block w-2 h-2 rounded-full ${meta.dot} mb-2`} />
                  <p className="font-montserrat font-black text-2xl text-white leading-none">{stats[st] || 0}</p>
                  <p className="text-white/50 text-xs mt-1">{meta.label}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Панель управления */}
        <section className="max-w-7xl mx-auto px-5 md:px-8 pb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск: название, город, предмет…"
                className="w-full bg-card border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>
            <button
              onClick={() => setAddOpen((v) => !v)}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold px-5 py-3 rounded-2xl hover:opacity-90 transition-opacity"
            >
              <Icon name="Plus" size={16} />
              Добавить школу
            </button>
          </div>

          {addOpen && (
            <div className="bg-card border border-white/15 rounded-2xl p-4 grid md:grid-cols-4 gap-3">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Название школы *"
                className="md:col-span-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-purple-500/40"
              />
              <input
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="Город / Онлайн"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-purple-500/40"
              />
              <input
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                placeholder="Где найти контакт"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-purple-500/40"
              />
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="md:col-span-4 inline-flex items-center justify-center gap-2 bg-purple-500/20 border border-purple-400/40 text-purple-100 font-bold px-4 py-2.5 rounded-xl hover:bg-purple-500/30 transition-colors disabled:opacity-50"
              >
                <Icon name="Check" size={15} />
                Добавить в воронку
              </button>
            </div>
          )}

          {/* Фильтр по сегменту */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSegFilter("all")}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                segFilter === "all" ? "bg-purple-500/25 border-purple-400/50 text-white" : "bg-white/5 border-white/10 text-white/55 hover:text-white"
              }`}
            >
              🎯 Все направления
            </button>
            {segments.map((sg) => {
              const meta = SEGMENT_META[sg] || SEGMENT_META.other;
              return (
                <button
                  key={sg}
                  onClick={() => setSegFilter(segFilter === sg ? "all" : sg)}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                    segFilter === sg ? "bg-purple-500/25 border-purple-400/50 text-white" : "bg-white/5 border-white/10 text-white/55 hover:text-white"
                  }`}
                >
                  <span>{meta.emoji}</span>
                  {meta.label}
                </button>
              );
            })}
          </div>

          <p className="text-white/50 text-sm">
            Школ в списке: <span className="text-white font-bold">{filtered.length}</span>
          </p>
        </section>

        {/* Сетка карточек */}
        <section className="max-w-7xl mx-auto px-5 md:px-8 pb-12">
          {loading ? (
            <div className="text-center py-16 text-white/50">Загружаем базу…</div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-rose-300 mb-4">{error}</p>
              <button onClick={load} className="bg-purple-500/15 border border-purple-500/30 text-purple-200 text-sm font-bold px-4 py-2 rounded-xl">
                Повторить
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-white/60">Ничего не найдено. Измените фильтры или добавьте школу.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {filtered.map((school) => (
                <SchoolProspectCard
                  key={school.id}
                  school={school}
                  saving={savingId === school.id}
                  onStatusChange={handleStatus}
                  onNoteSave={handleNote}
                  onServicesChange={handleServices}
                />
              ))}
            </div>
          )}
        </section>

        {/* Пояснение */}
        <section className="max-w-7xl mx-auto px-5 md:px-8 pb-16">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex items-start gap-3">
            <Icon name="Info" size={18} className="text-white/50 mt-0.5 flex-shrink-0" />
            <p className="text-white/50 text-xs leading-relaxed">
              В базе — примеры типичных небольших школ (архетипы целевых клиентов) плюс те, что
              вы добавите сами. Статусы, заметки и отметки об услугах сохраняются в базе и видны
              всей команде. Это внутренний инструмент продаж — страница закрыта от поисковиков.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
