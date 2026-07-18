import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EduInstitution,
  EduKind,
  KIND_LABELS,
  STATUS_LABELS,
  STATUS_TONE,
  listInstitutions,
  deleteInstitution,
  exportCsv,
} from "@/components/admin/eduInstitutions/api";
import EduFormModal from "@/components/admin/eduInstitutions/EduFormModal";
import EduImportModal from "@/components/admin/eduInstitutions/EduImportModal";

const PIN_KEY = "uchispro_admin_pin_v1";

export default function EduInstitutions() {
  const hasPin = !!(sessionStorage.getItem(PIN_KEY) || localStorage.getItem(PIN_KEY));

  const [items, setItems] = useState<EduInstitution[]>([]);
  const [total, setTotal] = useState(0);
  const [byKind, setByKind] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [kind, setKind] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<EduInstitution | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await listInstitutions({ kind, status, q });
    setLoading(false);
    if (!res.ok || !res.data) {
      setError(res.error || "Не удалось загрузить");
      return;
    }
    setItems(res.data.items);
    setTotal(res.data.total);
    setByKind(res.data.by_kind);
  }, [kind, status, q]);

  useEffect(() => {
    if (!hasPin) return;
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load, hasPin]);

  const remove = async (row: EduInstitution) => {
    if (!confirm(`Удалить «${row.org_name || row.contact_name || "запись"}»?`)) return;
    const res = await deleteInstitution(row.id);
    if (res.ok) load();
    else alert(res.error || "Ошибка удаления");
  };

  const doExport = async () => {
    const res = await exportCsv();
    if (!res.ok || !res.data) return alert(res.error || "Ошибка экспорта");
    const blob = new Blob([res.data.csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `edu-institutions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!hasPin) {
    return (
      <div className="min-h-screen bg-mesh text-white flex items-center justify-center p-6">
        <Card className="p-6 text-center max-w-sm">
          <Icon name="Lock" size={28} className="text-violet-300 mx-auto mb-3" />
          <p className="mb-4">Нужен доступ администратора</p>
          <Link to="/admin"><Button>Открыть кабинет</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh text-white">
      <Helmet><title>База учебных заведений — Админ</title></Helmet>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
          <div>
            <Link to="/admin" className="text-white/50 hover:text-white text-sm inline-flex items-center gap-1.5 mb-1">
              <Icon name="ChevronLeft" size={15} /> В кабинет
            </Link>
            <h1 className="font-montserrat font-black text-2xl">База учебных заведений</h1>
            <p className="text-white/55 text-sm">Онлайн-школы, колледжи и техникумы для предложений о сотрудничестве</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to="/admin/edu-outreach">
              <Button variant="outline">
                <Icon name="Mail" size={16} className="mr-1.5" /> Письмо о сотрудничестве
              </Button>
            </Link>
            <Button variant="outline" onClick={doExport}>
              <Icon name="Download" size={16} className="mr-1.5" /> Экспорт CSV
            </Button>
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Icon name="Radar" size={16} className="mr-1.5" /> Радар (импорт)
            </Button>
            <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
              <Icon name="Plus" size={16} className="mr-1.5" /> Добавить
            </Button>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <Stat label="Всего" value={total} icon="Database" />
          {(Object.keys(KIND_LABELS) as EduKind[]).map((k) => (
            <Stat key={k} label={KIND_LABELS[k]} value={byKind[k] || 0} icon="Building2" />
          ))}
        </div>

        {/* Фильтры */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск: название, ФИО, телефон, email, город" className="pl-9" />
          </div>
          <select value={kind} onChange={(e) => setKind(e.target.value)} className="h-10 rounded-lg bg-card border border-white/10 px-3 text-sm">
            <option value="">Все типы</option>
            {(Object.keys(KIND_LABELS) as EduKind[]).map((k) => <option key={k} value={k}>{KIND_LABELS[k]}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-lg bg-card border border-white/10 px-3 text-sm">
            <option value="">Все статусы</option>
            {Object.keys(STATUS_LABELS).map((s) => <option key={s} value={s}>{STATUS_LABELS[s as keyof typeof STATUS_LABELS]}</option>)}
          </select>
        </div>

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        {/* Таблица */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white/50 text-xs border-b border-white/10">
                  <th className="px-3 py-2.5 font-medium">Организация</th>
                  <th className="px-3 py-2.5 font-medium">Тип</th>
                  <th className="px-3 py-2.5 font-medium">Контакт</th>
                  <th className="px-3 py-2.5 font-medium">Телефон</th>
                  <th className="px-3 py-2.5 font-medium">Email</th>
                  <th className="px-3 py-2.5 font-medium">Статус</th>
                  <th className="px-3 py-2.5 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                    <td className="px-3 py-2.5">
                      <p className="font-semibold">{r.org_name || "—"}</p>
                      {r.city && <p className="text-white/45 text-xs">{r.city}</p>}
                    </td>
                    <td className="px-3 py-2.5 text-white/70">{KIND_LABELS[r.kind]}</td>
                    <td className="px-3 py-2.5 text-white/70">{r.contact_name || "—"}</td>
                    <td className="px-3 py-2.5">
                      {r.phone ? <a href={`tel:${r.phone}`} className="text-violet-300 hover:underline">{r.phone}</a> : "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      {r.email ? <a href={`mailto:${r.email}`} className="text-cyan-300 hover:underline">{r.email}</a> : "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: `${STATUS_TONE[r.status]}22`, color: STATUS_TONE[r.status] }}>
                        {STATUS_LABELS[r.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => { setEditing(r); setModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white">
                          <Icon name="Pencil" size={15} />
                        </button>
                        <button onClick={() => remove(r)} className="p-1.5 rounded-lg hover:bg-red-500/15 text-white/60 hover:text-red-400">
                          <Icon name="Trash2" size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {loading && <div className="py-8 text-center text-white/50 text-sm"><Icon name="Loader2" size={20} className="animate-spin mx-auto" /></div>}
          {!loading && items.length === 0 && (
            <div className="py-12 text-center text-white/45 text-sm">
              <Icon name="Inbox" size={28} className="mx-auto mb-2 opacity-50" />
              Пока пусто. Нажмите «Добавить», чтобы внести первое учреждение.
            </div>
          )}
        </Card>
      </div>

      {modalOpen && (
        <EduFormModal
          editing={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); load(); }}
        />
      )}

      {importOpen && (
        <EduImportModal
          onClose={() => setImportOpen(false)}
          onImported={() => { setImportOpen(false); load(); }}
        />
      )}
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
        <Icon name={icon} size={13} /> {label}
      </div>
      <p className="font-montserrat font-black text-xl">{value}</p>
    </Card>
  );
}