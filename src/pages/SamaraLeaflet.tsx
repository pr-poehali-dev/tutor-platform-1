import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";

const NAVY = "#0f1f3d";
const BLUE = "#1d4ed8";
const AMBER = "#f59e0b";

/** QR ведёт на учисьпро.рф/samara с меткой «листовка» — в Метрике видно,
 *  сколько учеников пришло именно с бумаги. Файл сгенерирован один раз. */
const QR_SRC = "/qr-samara.svg";

const STEPS = [
  { icon: "ScanLine", title: "Наведи камеру на QR-код", text: "или открой учисьпро.рф/samara" },
  { icon: "UserPlus", title: "Войди или зарегистрируйся", text: "по почте или через Яндекс ID" },
  { icon: "Unlock", title: "Нажми «Активировать»", text: "промокод уже подставлен" },
];

const BENEFITS = [
  "ИИ-наставник объяснит любую тему — даже ночью",
  "Помощь с домашкой по фото: разбор по шагам",
  "Подготовка к ОГЭ и ЕГЭ с разбором заданий",
  "60 курсов и предметов для 1–11 класса",
];

/** Листовка формата А5 (148×210 мм). На альбомный лист А4 помещаются две. */
function Leaflet() {
  return (
    <div
      className="relative bg-white text-slate-800 font-golos overflow-hidden flex flex-col"
      style={{ width: "148mm", height: "210mm", flexShrink: 0 }}
    >
      <div className="px-[10mm] pt-[8mm] pb-[6mm] text-white" style={{ background: NAVY }}>
        <div className="flex items-center justify-between mb-[4mm]">
          <span className="font-montserrat font-black text-[13pt] tracking-wide">УЧИСЬПРО</span>
          <span className="text-[7.5pt] uppercase tracking-[0.18em] text-blue-200 font-bold">Пилот школ Самары</span>
        </div>
        <h1 className="font-montserrat font-extrabold text-[21pt] leading-[1.1]">
          Курсы для школьников — <span style={{ color: AMBER }}>бесплатно</span> весь учебный год
        </h1>
      </div>

      <div className="px-[10mm] pt-[6mm] flex gap-[6mm] items-center">
        <div className="flex-shrink-0 rounded-[3mm] border-[0.6mm] p-[2mm]" style={{ borderColor: BLUE }}>
          <img src={QR_SRC} alt="QR-код на учисьпро.рф/samara" style={{ width: "40mm", height: "40mm" }} className="block" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[8pt] uppercase tracking-[0.16em] font-bold mb-[1.5mm]" style={{ color: BLUE }}>Твой промокод</p>
          <div className="rounded-[2.5mm] border-[0.5mm] border-dashed px-[3mm] py-[2.5mm] text-center mb-[2.5mm]" style={{ borderColor: AMBER, background: "#fffbeb" }}>
            <p className="font-montserrat font-black text-[24pt] tracking-[0.08em] leading-none" style={{ color: NAVY }}>САМАРА</p>
          </div>
          <p className="text-[8.5pt] text-slate-500 leading-snug">
            Действует до <b className="text-slate-800">31.05.2027</b>
          </p>
          <p className="text-[8.5pt] text-slate-500 leading-snug mt-[1mm]">
            Сайт: <b className="text-slate-800">учисьпро.рф/samara</b>
          </p>
        </div>
      </div>

      <div className="px-[10mm] pt-[6mm]">
        <p className="font-montserrat font-extrabold text-[11.5pt] mb-[3mm]" style={{ color: NAVY }}>Как подключиться за 2 минуты</p>
        <div className="space-y-[2.5mm]">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex items-center gap-[3mm]">
              <span
                className="w-[7mm] h-[7mm] rounded-full flex items-center justify-center text-white font-montserrat font-black text-[10pt] flex-shrink-0"
                style={{ background: BLUE }}
              >
                {i + 1}
              </span>
              <div className="leading-tight">
                <p className="font-bold text-[10pt]" style={{ color: NAVY }}>{s.title}</p>
                <p className="text-[8.5pt] text-slate-500">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-[10mm] mt-[5mm] rounded-[2.5mm] bg-slate-50 px-[5mm] py-[3.5mm]">
        <p className="font-montserrat font-extrabold text-[10.5pt] mb-[2mm]" style={{ color: NAVY }}>Что внутри</p>
        <ul className="space-y-[1.3mm]">
          {BENEFITS.map((b) => (
            <li key={b} className="flex gap-[2mm] text-[9pt] text-slate-700 leading-snug">
              <span className="font-bold flex-shrink-0" style={{ color: BLUE }}>✓</span>
              {b}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto mx-[10mm] pb-[6mm] pt-[3mm] text-[6.8pt] text-slate-400 leading-snug border-t border-slate-100">
        Промокод даёт бесплатный доступ к курсам раздела «Школьникам». Не распространяется на курсы для взрослых и раздел «Малыш». Один аккаунт — одна активация.
      </div>
    </div>
  );
}

/**
 * Печатная листовка-памятка для учеников школ-участниц пилота.
 * Лист А4 (альбомная ориентация) = две листовки А5 рядом, между ними — линия отреза.
 */
export default function SamaraLeaflet() {
  return (
    <div className="min-h-screen bg-slate-200 font-golos">
      <Seo
        title="Листовка для учеников: промокод САМАРА"
        description="Печатная памятка для учеников школ-участниц пилота УЧИСЬПРО: QR-код и промокод САМАРА."
        canonical="https://учисьпро.рф/samara/leaflet"
        noindex
      />
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          html, body { background: #fff !important; height: 210mm !important; overflow: hidden !important; }
          body * { visibility: hidden; }
          .leaflet-sheet, .leaflet-sheet * { visibility: visible; }
          .leaflet-sheet { position: fixed !important; left: 0; top: 0; }
          .leaflet-toolbar { display: none !important; }
          .leaflet-sheet { box-shadow: none !important; margin: 0 !important; }
          .leaflet-wrap { padding: 0 !important; gap: 0 !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="leaflet-toolbar sticky top-0 z-10 bg-white border-b border-slate-300">
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-bold text-slate-800 text-sm md:text-base">Листовка для учеников — промокод САМАРА</p>
            <p className="text-slate-500 text-xs md:text-sm">Лист А4 = 2 листовки. Печать: масштаб 100%, без полей, «Фон» включён.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/for-schools/presentation" className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
              <Icon name="Presentation" size={16} /> Презентация
            </Link>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 text-sm font-semibold"
            >
              <Icon name="Printer" size={16} /> Печать / PDF
            </button>
          </div>
        </div>
      </div>

      <div className="leaflet-wrap py-8 px-4 flex justify-start lg:justify-center overflow-x-auto">
        <div className="leaflet-sheet bg-white shadow-xl flex relative flex-shrink-0" style={{ width: "297mm", height: "210mm" }}>
          <Leaflet />
          <div className="relative" style={{ width: "1mm" }}>
            <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-slate-400" />
            <span className="leaflet-scissors absolute left-1/2 -translate-x-1/2 top-[3mm] bg-white text-slate-400 text-[9pt] leading-none">✂</span>
          </div>
          <Leaflet />
        </div>
      </div>
    </div>
  );
}
