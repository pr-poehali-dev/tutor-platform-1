import { useEffect, useState } from "react";
import { Link, useParams } from "@/lib/router-compat";
import { QRCodeSVG } from "qrcode.react";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { PilotSchool, pilotApi } from "@/components/pilot/api";

const NAVY = "#0f1f3d";
const BLUE = "#1d4ed8";

const STEPS = [
  ["ScanLine", "Наведи камеру на QR-код", "или открой ссылку под ним"],
  ["MousePointerClick", "Выбери свой класс", "и нажми «Получить доступ»"],
  ["UserPlus", "Войди по почте или Яндекс ID", "доступ откроется сразу"],
];

const BENEFITS = [
  "ИИ-наставник объяснит любую тему — даже ночью",
  "Помощь с домашкой по фото: разбор по шагам",
  "Подготовка к ОГЭ и ЕГЭ с разбором заданий",
  "Курсы для 1–11 класса",
];

/** Листовка А5 со ссылкой и QR-кодом конкретной школы. На лист А4 помещаются две. */
function Leaflet({ s }: { s: PilotSchool }) {
  return (
    <div className="flex flex-col overflow-hidden bg-white font-golos text-slate-800" style={{ width: "148mm", height: "210mm", flexShrink: 0 }}>
      <div className="px-[10mm] pb-[6mm] pt-[8mm] text-white" style={{ background: NAVY }}>
        <div className="mb-[3mm] flex items-center justify-between">
          <span className="font-montserrat text-[13pt] font-black tracking-wide">УЧИСЬПРО</span>
          <span className="text-[7.5pt] font-bold uppercase tracking-[0.14em] text-blue-200">Пилотный проект · 2026/27</span>
        </div>
        <p className="text-[9pt] text-blue-100">{s.school_name}</p>
        <p className="mt-[1mm] font-montserrat text-[21pt] font-extrabold leading-[1.1]">
          Курсы и ИИ-наставник — <span style={{ color: "#f59e0b" }}>бесплатно</span> весь учебный год
        </p>
      </div>
      <div className="flex items-center gap-[6mm] px-[10mm] pt-[7mm]">
        <div className="shrink-0 rounded-[3mm] border-[0.6mm] p-[2mm]" style={{ borderColor: BLUE }}>
          <QRCodeSVG value={`${s.student_url}?utm_source=leaflet`} size={150} level="M" style={{ width: "42mm", height: "42mm", display: "block" }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-[1.5mm] text-[8pt] font-bold uppercase tracking-[0.16em]" style={{ color: BLUE }}>
            Ссылка твоей школы
          </p>
          <p className="break-all font-montserrat text-[15pt] font-black leading-tight" style={{ color: NAVY }}>
            {s.student_label}
          </p>
          <p className="mt-[2mm] text-[8.5pt] leading-snug text-slate-500">
            Действует до <b className="text-slate-800">31.05.2027</b>. Оплата и карта не нужны.
          </p>
        </div>
      </div>
      <div className="px-[10mm] pt-[7mm]">
        {STEPS.map(([icon, title, text], i) => (
          <div key={title} className="mb-[3.5mm] flex items-center gap-[3.5mm]">
            <span className="flex h-[8mm] w-[8mm] shrink-0 items-center justify-center rounded-full text-[10pt] font-bold text-white" style={{ background: BLUE }}>
              {i + 1}
            </span>
            <Icon name={icon} size={18} style={{ color: BLUE }} />
            <div>
              <p className="text-[10.5pt] font-bold leading-tight" style={{ color: NAVY }}>
                {title}
              </p>
              <p className="text-[8.5pt] text-slate-500">{text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mx-[10mm] mt-auto mb-[9mm] rounded-[3mm] bg-blue-50 px-[5mm] py-[4mm]">
        {BENEFITS.map((b) => (
          <p key={b} className="flex items-center gap-[2mm] text-[9pt] leading-[1.7]" style={{ color: NAVY }}>
            <span style={{ color: BLUE }}>✓</span> {b}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function PilotSchoolLeaflet() {
  const { code = "" } = useParams();
  const [s, setS] = useState<PilotSchool | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    pilotApi.school(code).then((r) => (r.ok ? setS(r.school) : setMissing(true)));
  }, [code]);

  return (
    <div className="min-h-screen bg-slate-200 font-golos">
      <Seo title="Памятка для учеников — печать" description="Памятка А5 со ссылкой и QR-кодом школы" noindex />
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          html, body { background: #fff !important; }
          .no-print { display: none !important; }
          .sheet { padding: 0 !important; gap: 0 !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
      <div className="no-print sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 bg-white px-4 py-3">
        <Link to={`/s/${code}`} className="text-sm text-slate-600 hover:text-slate-900">
          ← Страница для учеников
        </Link>
        <p className="hidden text-sm text-slate-500 md:block">Печать: А4, альбомная ориентация — две памятки на листе</p>
        <button onClick={() => window.print()} disabled={!s} className="flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
          <Icon name="Printer" size={15} /> Распечатать / PDF
        </button>
      </div>
      {missing ? (
        <p className="p-10 text-center text-slate-600">Школа не найдена — проверьте ссылку.</p>
      ) : !s ? (
        <p className="p-10 text-center text-slate-500">Загружаем…</p>
      ) : (
        <div className="sheet flex flex-wrap justify-center gap-6 p-6">
          <Leaflet s={s} />
          <Leaflet s={s} />
        </div>
      )}
    </div>
  );
}
