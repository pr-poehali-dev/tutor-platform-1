import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { importInstitutions, ImportRow } from "./api";

interface Props {
  onClose: () => void;
  onImported: () => void;
}

// Открытые источники для сбора контактов образовательных организаций по всей стране
const RADAR_SOURCES = [
  { name: "Реестр лицензий Рособрнадзора", url: "https://islod.obrnadzor.gov.ru/rlic/", note: "Официальный реестр всех лицензированных образовательных организаций РФ" },
  { name: "Реестр аккредитаций Рособрнадзора", url: "https://isga.obrnadzor.gov.ru/", note: "Аккредитованные колледжи и техникумы" },
  { name: "2ГИС", url: "https://2gis.ru/", note: "Экспорт организаций по категории «Колледжи», «Техникумы», «Онлайн-школы» по городам" },
  { name: "Яндекс.Карты / Справочник", url: "https://yandex.ru/maps/", note: "Поиск учебных заведений с контактами по регионам" },
  { name: "Каталог СПО (техникумы и колледжи)", url: "https://spo.gospod.ru/", note: "Справочник среднего профессионального образования" },
];

// Простой парсер CSV (разделитель ; или ,) с учётом кавычек
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  const delimiter = text.includes(";") ? ";" : ",";
  const src = text.replace(/^\ufeff/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === delimiter) { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c === "\r") { /* skip */ }
    else field += c;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim()));
}

// Распознаём колонки по заголовку
const FIELD_MAP: Record<string, keyof ImportRow> = {
  "название": "org_name", "организация": "org_name", "наименование": "org_name", "name": "org_name",
  "тип": "kind", "kind": "kind",
  "фио": "contact_name", "контакт": "contact_name", "контактное лицо": "contact_name", "имя": "contact_name",
  "телефон": "phone", "тел": "phone", "phone": "phone",
  "email": "email", "почта": "email", "e-mail": "email", "эл. адрес": "email", "электронный адрес": "email",
  "город": "city", "city": "city",
  "сайт": "website", "website": "website", "url": "website",
  "заметка": "note", "комментарий": "note", "note": "note",
};

function rowsToImport(matrix: string[][]): ImportRow[] {
  if (matrix.length === 0) return [];
  const header = matrix[0].map((h) => h.trim().toLowerCase());
  const hasHeader = header.some((h) => FIELD_MAP[h]);
  const keys: (keyof ImportRow | null)[] = hasHeader
    ? header.map((h) => FIELD_MAP[h] || null)
    : ["org_name", "kind", "contact_name", "phone", "email", "city", "website", "note"];
  const dataRows = hasHeader ? matrix.slice(1) : matrix;
  return dataRows.map((cells) => {
    const obj: ImportRow = {};
    keys.forEach((k, idx) => {
      if (k && cells[idx] != null) obj[k] = cells[idx].trim();
    });
    return obj;
  });
}

export default function EduImportModal({ onClose, onImported }: Props) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ inserted: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportRow[]>([]);

  const onFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const t = String(reader.result || "");
      setText(t);
      setPreview(rowsToImport(parseCsv(t)));
    };
    reader.readAsText(f, "utf-8");
  };

  const onPaste = (val: string) => {
    setText(val);
    setPreview(rowsToImport(parseCsv(val)));
  };

  const doImport = async () => {
    const rows = rowsToImport(parseCsv(text));
    if (rows.length === 0) { setError("Нет данных. Вставьте CSV или загрузите файл."); return; }
    setBusy(true);
    setError(null);
    const res = await importInstitutions(rows);
    setBusy(false);
    if (!res.ok || !res.data) { setError(res.error || "Ошибка импорта"); return; }
    setResult({ inserted: res.data.inserted, skipped: res.data.skipped });
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-2xl bg-card border border-white/10 rounded-2xl p-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-montserrat font-black text-lg flex items-center gap-2">
            <Icon name="Radar" size={20} className="text-violet-300" /> Радар: сбор из открытых источников
          </h3>
          <button onClick={onClose} className="text-white/50 hover:text-white"><Icon name="X" size={20} /></button>
        </div>

        {result ? (
          <div className="text-center py-6">
            <Icon name="CheckCircle2" size={36} className="text-emerald-400 mx-auto mb-3" />
            <p className="font-bold text-lg mb-1">Импорт завершён</p>
            <p className="text-white/70 text-sm">Добавлено: <b className="text-emerald-300">{result.inserted}</b> · Пропущено дублей: {result.skipped}</p>
            <Button className="mt-5" onClick={onImported}>Готово</Button>
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 mb-4">
              <p className="text-xs text-white/55 mb-2">
                Автопарсинг чужих сайтов незаконен и ненадёжен. Легальный способ собрать базу по всей стране — выгрузить списки из официальных открытых реестров и справочников и загрузить их сюда файлом или вставкой.
              </p>
              <div className="space-y-1.5">
                {RADAR_SOURCES.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer"
                     className="flex items-start gap-2 text-sm text-violet-300 hover:text-violet-200 group">
                    <Icon name="ExternalLink" size={14} className="mt-0.5 flex-shrink-0" />
                    <span><b>{s.name}</b> <span className="text-white/45 group-hover:text-white/60">— {s.note}</span></span>
                  </a>
                ))}
              </div>
            </div>

            <label className="block mb-3">
              <span className="block text-xs text-white/55 mb-1.5">Загрузите CSV-файл</span>
              <input type="file" accept=".csv,.txt" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
                     className="block w-full text-sm text-white/70 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-violet-500/20 file:text-violet-200 file:font-bold hover:file:bg-violet-500/30" />
            </label>

            <label className="block mb-2">
              <span className="block text-xs text-white/55 mb-1.5">…или вставьте таблицу (столбцы: название; тип; ФИО; телефон; email; город; сайт)</span>
              <textarea value={text} onChange={(e) => onPaste(e.target.value)} rows={4}
                        className="w-full rounded-lg bg-background border border-white/10 px-3 py-2 text-sm font-mono resize-none"
                        placeholder={"Название;Тип;ФИО;Телефон;Email;Город;Сайт\nОнлайн-школа «Знание»;онлайн-школа;Иванова М.П.;+7 900 000-00-00;info@znanie.ru;Москва;znanie.ru"} />
            </label>

            {preview.length > 0 && (
              <p className="text-xs text-emerald-300 mb-3">Распознано строк: {preview.length}</p>
            )}
            {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

            <div className="flex gap-2">
              <Button onClick={doImport} disabled={busy || preview.length === 0} className="flex-1">
                {busy ? <Icon name="Loader2" size={16} className="animate-spin" /> : `Импортировать ${preview.length || ""}`}
              </Button>
              <Button variant="outline" onClick={onClose}>Отмена</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
