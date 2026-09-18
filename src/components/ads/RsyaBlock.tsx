import { useState } from "react";
import Icon from "@/components/ui/icon";
import { RsyaCampaign } from "./adsData";

/**
 * Блок кампании в РСЯ для админки.
 *
 * Вынесен отдельно: страница менеджера рекламы уже на 300+ строк, а данных
 * по сетям столько же, сколько по поиску. Держать всё в одном файле — значит
 * гарантированно получить простыню, в которой никто ничего не найдёт.
 */

function Copy({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        });
      }}
      className="inline-flex items-center gap-1 text-white/45 hover:text-white text-[11px] transition-colors"
    >
      <Icon name={done ? "Check" : "Copy"} size={11} />
      {done ? "Скопировано" : "Копировать"}
    </button>
  );
}

function Label({ children, action }: { children: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold">{children}</p>
      {action}
    </div>
  );
}

export default function RsyaBlock({ rsya }: { rsya: RsyaCampaign }) {
  return (
    <div className="mt-8 rounded-2xl border border-cyan-500/25 bg-cyan-500/[0.04] p-5 md:p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/25 flex items-center justify-center shrink-0">
          <Icon name="LayoutGrid" size={18} className="text-cyan-300" />
        </div>
        <div>
          <h3 className="font-montserrat font-black text-lg text-white leading-tight">
            Кампания в РСЯ — отдельно от поиска
          </h3>
          <p className="text-white/50 text-xs mt-1 leading-relaxed">
            В поиске человек ищет решение, в сетях — читает статью и никого ни о чём не просил.
            Поэтому здесь другие тексты и картинка важнее слов. Копировать поисковые объявления
            в РСЯ нельзя: показы идут, а отклик падает до сотых процента.
          </p>
        </div>
      </div>

      {/* Ссылка с меткой сетей — своя, чтобы не склеиться с поиском в отчётах */}
      <div className="mb-5">
        <Label action={<Copy text={rsya.finalUrl} />}>Ссылка для объявлений РСЯ</Label>
        <div className="bg-background/40 border border-white/10 rounded-xl px-3 py-2.5">
          <code className="text-cyan-200 text-xs font-mono break-all">{rsya.finalUrl}</code>
        </div>
      </div>

      {/* Объявления */}
      <div className="mb-5">
        <Label action={<Copy text={rsya.variants.map((v) => `${v.title1}\n${v.title2}\n${v.description}`).join("\n\n")} />}>
          Объявления для сетей
        </Label>
        <div className="space-y-2">
          {rsya.variants.map((v, i) => (
            <div key={i} className="bg-background/40 border border-white/10 rounded-xl p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm leading-snug">{v.title1}</p>
                  <p className="text-cyan-200/80 text-xs mt-0.5">{v.title2}</p>
                  <p className="text-white/60 text-xs mt-1.5 leading-relaxed">{v.description}</p>
                </div>
                <span className="text-white/25 text-[10px] tabular-nums shrink-0 pt-0.5">
                  {v.title1.length}/{v.title2.length}/{v.description.length}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-5">
        {/* Картинки */}
        <div>
          <Label>Баннеры</Label>

          {rsya.readyImages && rsya.readyImages.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-2">
              {rsya.readyImages.map((im) => (
                <a
                  key={im.src}
                  href={im.src}
                  download
                  className="group block rounded-xl overflow-hidden border border-white/10 hover:border-cyan-400/40 transition-colors"
                >
                  <img
                    src={im.src}
                    alt={`Баннер ${im.ratio}`}
                    loading="lazy"
                    className="w-full h-24 object-cover"
                  />
                  <div className="flex items-center justify-between gap-2 px-2 py-1.5 bg-background/60">
                    <span className="text-white/60 text-[10px]">{im.ratio}</span>
                    <Icon
                      name="Download"
                      size={11}
                      className="text-white/40 group-hover:text-cyan-300 transition-colors"
                    />
                  </div>
                </a>
              ))}
            </div>
          )}

          <div className="bg-background/40 border border-white/10 rounded-xl p-3 space-y-1.5">
            {rsya.imageIdeas.map((im) => (
              <p key={im} className="text-white/75 text-xs leading-relaxed flex gap-2">
                <Icon name="Image" size={12} className="text-cyan-300/70 mt-0.5 shrink-0" />
                {im}
              </p>
            ))}
          </div>
          <p className="text-white/30 text-[10px] mt-1.5 leading-relaxed">
            Два баннера готовы — скачайте и загрузите в Директ. Для теста нужен третий:
            описания выше можно отдать в генератор изображений.
          </p>
        </div>

        {/* Интересы */}
        <div>
          <Label action={<Copy text={rsya.interests.join("\n")} />}>Интересы и сегменты</Label>
          <div className="bg-background/40 border border-white/10 rounded-xl p-3 space-y-1">
            {rsya.interests.map((it) => (
              <p key={it} className="text-white/80 text-xs">{it}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Ретаргетинг */}
      <div className="mb-5">
        <Label>Ретаргетинг: догнать тех, кто не дошёл</Label>
        <div className="space-y-2">
          {rsya.retargeting.map((r) => (
            <div key={r.name} className="bg-background/40 border border-white/10 rounded-xl p-3">
              <p className="text-white font-bold text-xs mb-1">{r.name}</p>
              <p className="text-white/45 text-[11px] mb-1.5 leading-relaxed">
                <span className="text-white/30">Условие: </span>
                {r.condition}
              </p>
              <p className="text-cyan-200/85 text-xs leading-relaxed">
                <span className="text-white/30">Сообщение: </span>
                {r.pitch}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Отключить площадки */}
        <div>
          <Label action={<Copy text={rsya.excludedPlacements.join("\n")} />}>
            Отключить сразу
          </Label>
          <div className="bg-background/40 border border-rose-500/20 rounded-xl p-3 space-y-1">
            {rsya.excludedPlacements.map((p) => (
              <p key={p} className="text-rose-200/80 text-xs leading-relaxed">−{p}</p>
            ))}
          </div>
        </div>

        {/* Настройки */}
        <div>
          <Label>Настройки кампании</Label>
          <div className="bg-background/40 border border-emerald-500/20 rounded-xl p-3 space-y-1.5">
            {rsya.settings.map((s) => (
              <p key={s} className="text-white/80 text-xs leading-relaxed flex gap-2">
                <Icon name="Check" size={12} className="text-emerald-300/70 mt-0.5 shrink-0" />
                {s}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}