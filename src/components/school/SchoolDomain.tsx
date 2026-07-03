import { useState } from "react";
import Icon from "@/components/ui/icon";
import { setSchoolDomain, verifySchoolDomain, removeSchoolDomain, type School, type DomainDns } from "./api";

interface Props {
  school: School;
  onUpdated: (s: School) => void;
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const ok = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value).then(ok).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
    function fallbackCopy() {
      try {
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        ok();
      } catch {
        /* ignore */
      }
    }
  };
  return (
    <div>
      <div className="text-white/45 text-xs mb-1">{label}</div>
      <div className="flex items-center gap-2 bg-white/[0.05] border border-white/12 rounded-lg px-3 py-2">
        <code className="flex-1 text-sm text-white/90 truncate">{value}</code>
        <button onClick={copy} className="text-white/50 hover:text-white flex-shrink-0" aria-label="Копировать">
          <Icon name={copied ? "Check" : "Copy"} size={14} />
        </button>
      </div>
    </div>
  );
}

export default function SchoolDomain({ school, onUpdated }: Props) {
  const [domain, setDomain] = useState(school.custom_domain || "");
  const [dns, setDns] = useState<DomainDns | null>(
    school.custom_domain && school.domain_verify_token
      ? {
          txt_name: `_uchisipro.${school.custom_domain}`,
          txt_value: school.domain_verify_token,
          cname_name: school.custom_domain,
          cname_value: "schools.учисьпро.рф",
        }
      : null
  );
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [confirmUnbind, setConfirmUnbind] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err" | "info"; text: string } | null>(null);

  const verified = school.domain_verified && !!school.custom_domain;

  const save = async () => {
    setSaving(true);
    setMsg(null);
    const res = await setSchoolDomain(domain);
    setSaving(false);
    if (res.ok && res.data) {
      setDns(res.data.dns);
      onUpdated(res.data.school);
      setMsg({ type: "info", text: "Домен привязан. Добавьте DNS-записи у регистратора и нажмите «Проверить»." });
    } else {
      setMsg({ type: "err", text: res.error || "Не удалось привязать домен" });
    }
  };

  const verify = async () => {
    setVerifying(true);
    setMsg(null);
    const res = await verifySchoolDomain();
    setVerifying(false);
    if (res.ok && res.data) {
      if (res.data.verified && res.data.school) {
        onUpdated(res.data.school);
        setMsg({ type: "ok", text: "Домен подтверждён!" });
      } else {
        setMsg({ type: "info", text: res.data.message || "Запись пока не найдена, попробуйте позже." });
      }
    } else {
      setMsg({ type: "err", text: res.error || "Ошибка проверки" });
    }
  };

  const unbind = async () => {
    setConfirmUnbind(false);
    const res = await removeSchoolDomain();
    if (res.ok && res.data) {
      onUpdated(res.data.school);
      setDns(null);
      setDomain("");
      setMsg({ type: "info", text: "Домен отвязан." });
    } else {
      setMsg({ type: "err", text: res.error || "Не удалось отвязать домен" });
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="font-montserrat font-bold text-white mb-1 flex items-center gap-2">
          <Icon name="Globe" size={17} className="text-violet-300" /> Свой домен школы
          {verified && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-md px-2 py-0.5">
              <Icon name="ShieldCheck" size={11} /> Подтверждён
            </span>
          )}
        </h3>
        <p className="text-white/55 text-sm mb-4">
          Разместите школу на своём адресе, например <span className="text-white/80">school.ru</span>. Введите домен и
          подтвердите владение через DNS.
        </p>

        <div className="flex flex-wrap gap-2">
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="school.ru"
            className="flex-1 min-w-[200px] bg-white/[0.05] border border-white/12 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50"
          />
          <button
            onClick={save}
            disabled={saving || !domain.trim()}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-4 py-2.5 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-60"
          >
            {saving ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Link" size={15} />}
            {school.custom_domain ? "Обновить" : "Привязать"}
          </button>
        </div>
        {msg && (
          <p
            className={`text-xs mt-2 ${
              msg.type === "ok" ? "text-emerald-300" : msg.type === "err" ? "text-rose-300" : "text-white/60"
            }`}
          >
            {msg.text}
          </p>
        )}
      </div>

      {/* DNS-инструкция */}
      {dns && !verified && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
          <h3 className="font-montserrat font-bold text-white">Шаг 1. Добавьте DNS-записи</h3>
          <p className="text-white/55 text-sm">
            В панели вашего регистратора домена добавьте две записи. Первая подтверждает владение, вторая направляет
            домен на платформу.
          </p>

          <div className="space-y-3">
            <div className="text-white/70 text-sm font-medium">TXT-запись (подтверждение владения)</div>
            <CopyRow label="Имя (Host)" value={dns.txt_name} />
            <CopyRow label="Значение (Value)" value={dns.txt_value} />
          </div>

          <div className="space-y-3 pt-2 border-t border-white/8">
            <div className="text-white/70 text-sm font-medium">CNAME-запись (направление домена)</div>
            <CopyRow label="Имя (Host)" value={dns.cname_name} />
            <CopyRow label="Значение (Value)" value="schools.учисьпро.рф" />
          </div>

          <div className="pt-2">
            <h3 className="font-montserrat font-bold text-white mb-2">Шаг 2. Проверьте</h3>
            <button
              onClick={verify}
              disabled={verifying}
              className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/15 hover:border-violet-400/40 text-white font-bold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60"
            >
              {verifying ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="RefreshCw" size={15} />}
              Проверить подтверждение
            </button>
            <p className="text-white/40 text-xs mt-2">DNS может обновляться до 24 часов. После подтверждения мы автоматически выпустим SSL-сертификат.</p>
          </div>
        </div>
      )}

      {verified && (
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] p-5">
          <div className="flex items-center gap-2 text-emerald-300 mb-1">
            <Icon name="CircleCheck" size={18} />
            <span className="font-bold">Домен {school.custom_domain} подтверждён</span>
          </div>
          <p className="text-white/60 text-sm">Мы выпускаем SSL-сертификат — обычно это занимает несколько минут.</p>
        </div>
      )}

      {school.custom_domain &&
        (confirmUnbind ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-white/60">Отвязать {school.custom_domain}?</span>
            <button onClick={unbind} className="text-rose-300 hover:text-rose-200 font-medium">
              Да, отвязать
            </button>
            <button onClick={() => setConfirmUnbind(false)} className="text-white/45 hover:text-white">
              Отмена
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmUnbind(true)}
            className="text-white/40 hover:text-rose-300 text-sm transition-colors"
          >
            Отвязать домен
          </button>
        ))}
    </div>
  );
}