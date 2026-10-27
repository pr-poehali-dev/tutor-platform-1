import { useRef, useState } from "react";
import { Link } from "@/lib/router-compat";
import { QRCodeSVG } from "qrcode.react";
import Icon from "@/components/ui/icon";
import { PilotSchool, chatText, parentsText } from "./api";

function CopyBox({ title, text, icon }: { title: string; text: string; icon: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      /* буфер недоступен — текст можно выделить вручную */
    }
  };
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-bold">
          <Icon name={icon} size={16} className="text-cyan-300" /> {title}
        </p>
        <button onClick={copy} className="flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-bold hover:bg-white/20">
          <Icon name={done ? "Check" : "Copy"} size={13} /> {done ? "Скопировано" : "Копировать"}
        </button>
      </div>
      <p className="whitespace-pre-line text-sm text-white/70">{text}</p>
    </div>
  );
}

/** Всё, что школа получает сразу после подключения: ссылка, QR, тексты, памятка, статистика. */
export default function SchoolKit({ school, existing }: { school: PilotSchool; existing?: boolean }) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const downloadQr = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `qr-${school.code}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(school.student_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const statsPath = school.stats_url ? school.stats_url.replace(/^https?:\/\/[^/]+/, "") : "";

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20">
          <Icon name="CheckCircle2" size={26} className="text-emerald-300" />
        </div>
        <h2 className="font-montserrat text-2xl font-black">{existing ? "Школа уже подключена" : "Школа подключена!"}</h2>
        <p className="mt-1 text-white/70">
          {school.school_name} · {school.city_name}. Бесплатный доступ для учеников — до 31 мая 2027 года.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-white/50">Шаг 1 · Ссылка для учеников вашей школы</p>
          <p className="mb-3 break-all font-montserrat text-2xl font-black text-cyan-200">{school.student_label}</p>
          <p className="mb-4 text-sm text-white/65">
            Ученик открывает ссылку, входит через почту или Яндекс ID и указывает класс — доступ открывается сразу. Вы видите, сколько учеников
            подключилось.
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={copyLink} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2.5 text-sm font-bold">
              <Icon name={copied ? "Check" : "Link"} size={15} /> {copied ? "Скопировано" : "Скопировать ссылку"}
            </button>
            <Link
              to={`/s/${school.code}/pamyatka`}
              target="_blank"
              className="flex items-center gap-1.5 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold hover:bg-white/10"
            >
              <Icon name="Printer" size={15} /> Памятка для печати
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div ref={qrRef} className="rounded-xl bg-white p-3">
            <QRCodeSVG value={`${school.student_url}?utm_source=qr`} size={160} level="M" />
          </div>
          <button onClick={downloadQr} className="mt-3 flex items-center gap-1.5 text-sm font-bold text-cyan-200 hover:text-white">
            <Icon name="Download" size={14} /> Скачать QR-код
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-white/50">Шаг 2 · Отправьте в чаты классов</p>
        <div className="grid gap-3 md:grid-cols-2">
          <CopyBox title="Для чатов учеников" icon="MessageCircle" text={chatText(school)} />
          <CopyBox title="Для родительских чатов" icon="Users" text={parentsText(school)} />
        </div>
      </div>

      {statsPath && (
        <div className="rounded-2xl border border-violet-400/30 bg-violet-500/10 p-5">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-violet-200/70">Шаг 3 · Следите за подключением</p>
          <p className="mb-3 text-sm text-white/70">
            Здесь видно, сколько учеников подключилось — по классам и по дням. Сохраните эту ссылку: она личная, вход не нужен.
          </p>
          <Link to={statsPath} className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold hover:bg-white/20">
            <Icon name="BarChart3" size={15} /> Открыть статистику школы
          </Link>
        </div>
      )}

      <p className="text-center text-sm text-white/45">
        Мы отправили уведомление команде — при необходимости свяжемся с вами. Вопросы: напишите нам через раздел «Поддержка».
      </p>
    </div>
  );
}
