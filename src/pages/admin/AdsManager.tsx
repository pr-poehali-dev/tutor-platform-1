import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { AD_CAMPAIGNS, AdCampaign } from "@/components/ads/adsData";

function copyToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => { /* noop */ });
  }
}

function CharCount({ text, max }: { text: string; max: number }) {
  const ok = text.length <= max;
  return (
    <span className={`text-[10px] tabular-nums ${ok ? "text-emerald-300" : "text-rose-300"}`}>
      {text.length}/{max}
    </span>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { copyToClipboard(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/8 hover:bg-white/15 text-white/75 hover:text-white text-[10px] font-semibold transition-colors"
    >
      <Icon name={copied ? "Check" : "Copy"} size={11} />
      {copied ? "Скопировано" : "Копировать"}
    </button>
  );
}

function CampaignBlock({ c }: { c: AdCampaign }) {
  return (
    <div className="bg-card border border-white/10 rounded-3xl overflow-hidden">
      {/* Шапка */}
      <div className={`bg-gradient-to-br ${c.color} p-5 flex items-center gap-4`}>
        <div className="text-5xl">{c.emoji}</div>
        <div className="min-w-0 flex-1">
          <p className="text-white/80 text-[10px] uppercase tracking-wider font-bold">Кампания</p>
          <p className="font-montserrat font-black text-white text-xl leading-tight">{c.name}</p>
          <p className="text-white/85 text-xs">{c.audience}</p>
        </div>
        <Link
          to={c.landingPath}
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-2 rounded-xl"
        >
          <Icon name="ExternalLink" size={12} />
          Открыть лендинг
        </Link>
      </div>

      <div className="p-5 space-y-6">
        {/* Финальный URL */}
        <div>
          <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-2">Целевая ссылка (с UTM)</p>
          <div className="bg-background/60 border border-white/10 rounded-xl px-3 py-2.5 flex items-center gap-2">
            <code className="text-purple-200 text-xs font-mono flex-1 truncate">{c.finalUrl}</code>
            <CopyBtn text={c.finalUrl} />
          </div>
        </div>

        {/* Варианты объявлений */}
        <div>
          <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-3">
            Объявления ({c.variants.length} варианта для A/B-теста)
          </p>
          <div className="space-y-3">
            {c.variants.map((v, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-3">Вариант {i + 1}</p>
                <div className="space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white/55 text-[10px]">Заголовок 1</p>
                      <div className="flex items-center gap-2">
                        <CharCount text={v.title1} max={56} />
                        <CopyBtn text={v.title1} />
                      </div>
                    </div>
                    <p className="text-white font-bold text-sm bg-background/40 rounded-lg px-3 py-2">{v.title1}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white/55 text-[10px]">Заголовок 2</p>
                      <div className="flex items-center gap-2">
                        <CharCount text={v.title2} max={30} />
                        <CopyBtn text={v.title2} />
                      </div>
                    </div>
                    <p className="text-white text-sm bg-background/40 rounded-lg px-3 py-2">{v.title2}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white/55 text-[10px]">Описание</p>
                      <div className="flex items-center gap-2">
                        <CharCount text={v.description} max={81} />
                        <CopyBtn text={v.description} />
                      </div>
                    </div>
                    <p className="text-white/85 text-xs bg-background/40 rounded-lg px-3 py-2">{v.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Быстрые ссылки */}
        <div>
          <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-2">Быстрые ссылки</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {c.quickLinks.map((q) => (
              <div key={q.path} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white text-xs font-bold truncate">{q.label}</p>
                  <p className="text-white/55 text-[10px] truncate">{q.description}</p>
                </div>
                <CopyBtn text={`https://учисьпро.рф${q.path}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Уточнения */}
        <div>
          <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-2">Уточнения (до 25 симв)</p>
          <div className="flex flex-wrap gap-2">
            {c.refinements.map((r) => (
              <div key={r} className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/85 text-xs px-2.5 py-1 rounded-lg">
                {r}
                <span className={`text-[9px] ${r.length <= 25 ? "text-emerald-300" : "text-rose-300"}`}>({r.length})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ключи */}
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold">Ключевые фразы</p>
              <CopyBtn text={c.keywords.join("\n")} />
            </div>
            <div className="bg-background/40 border border-white/10 rounded-xl p-3 max-h-48 overflow-y-auto">
              {c.keywords.map((k) => (
                <p key={k} className="text-white/85 text-xs py-0.5">{k}</p>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold">Минус-слова</p>
              <CopyBtn text={c.negativeKeywords.join(" ")} />
            </div>
            <div className="bg-background/40 border border-rose-500/20 rounded-xl p-3 max-h-48 overflow-y-auto">
              {c.negativeKeywords.map((k) => (
                <p key={k} className="text-rose-200/85 text-xs py-0.5">−{k}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdsManager() {
  const [tab, setTab] = useState<string>(AD_CAMPAIGNS[0]?.slug ?? "");
  const current = AD_CAMPAIGNS.find((c) => c.slug === tab) || AD_CAMPAIGNS[0];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Менеджер рекламы — Яндекс.Директ"
        description="Готовые тексты объявлений, UTM-ссылки и ключевые слова для Яндекс.Директа."
        noindex
      />

      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide">УЧИСЬПРО</span>
          </Link>
          <span className="text-xs text-white/45 uppercase tracking-wider font-semibold">Админ · Реклама</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 md:px-8 py-10">
        <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/35 rounded-full px-4 py-1.5 mb-5">
          <Icon name="Megaphone" size={14} className="text-amber-300" />
          <span className="text-sm text-amber-200 font-bold uppercase tracking-wider">Яндекс Директ</span>
        </div>
        <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white mb-3 leading-tight">
          Готовые объявления <span className="gradient-text-purple">для копирования</span>
        </h1>
        <p className="text-white/65 text-base md:text-lg max-w-2xl mb-8">
          Скопируй тексты в кабинет Директа, добавь ключевые фразы и минус-слова, поставь целевую ссылку с UTM — кампания готова к запуску.
        </p>

        {/* Инструкция */}
        <div className="bg-cyan-500/8 border border-cyan-500/30 rounded-2xl p-5 mb-8">
          <p className="font-montserrat font-black text-white text-base mb-3 flex items-center gap-2">
            <Icon name="ListChecks" size={16} className="text-cyan-300" />
            Что делать в кабинете Директа
          </p>
          <ol className="space-y-2 text-white/75 text-sm">
            <li><b className="text-cyan-300">1.</b> Создать кампанию «Текстово-графические объявления» с оплатой за клики.</li>
            <li><b className="text-cyan-300">2.</b> Регион — Россия. Время показа — круглосуточно.</li>
            <li><b className="text-cyan-300">3.</b> Скопировать ключевые фразы и минус-слова из вкладки нужной кампании.</li>
            <li><b className="text-cyan-300">4.</b> Создать группу объявлений → добавить 2-4 варианта (для A/B-теста).</li>
            <li><b className="text-cyan-300">5.</b> В поле «Ссылка на сайт» вставить целевую ссылку с UTM (из этой страницы).</li>
            <li><b className="text-cyan-300">6.</b> Добавить быстрые ссылки и уточнения — они тут готовы.</li>
            <li><b className="text-cyan-300">7.</b> Привязать счётчик Метрики <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded">109375884</span> для оптимизации на конверсии.</li>
          </ol>
        </div>

        {/* Табы */}
        <div className="flex flex-wrap gap-2 mb-6">
          {AD_CAMPAIGNS.map((c) => (
            <button
              key={c.slug}
              onClick={() => setTab(c.slug)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === c.slug
                  ? `bg-gradient-to-br ${c.color} text-white shadow-lg`
                  : "bg-white/5 border border-white/10 text-white/65 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>{c.emoji}</span>
              {c.name}
            </button>
          ))}
        </div>

        {/* Текущая кампания */}
        <CampaignBlock c={current} />

        {/* Полезные ссылки */}
        <div className="mt-8 flex flex-wrap items-center gap-3 text-white/45 text-xs">
          <a
            href="https://direct.yandex.ru"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Icon name="ExternalLink" size={12} />
            Кабинет Яндекс.Директ
          </a>
          <span className="text-white/20">·</span>
          <a
            href="https://metrika.yandex.ru/list"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Icon name="ExternalLink" size={12} />
            Яндекс.Метрика
          </a>
          <span className="text-white/20">·</span>
          <a
            href="https://wordstat.yandex.ru"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Icon name="ExternalLink" size={12} />
            Wordstat — проверить спрос
          </a>
        </div>
      </div>
    </div>
  );
}
