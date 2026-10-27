import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SimHeader from "@/components/simulators/SimHeader";
import Player from "@/components/simulators/Player";
import { findTemplate } from "@/components/simulators/templates";
import { mySims, simApi } from "@/components/simulators/api";
import { AUDIENCE_LABEL, CATEGORY_LABEL, RunResult, Simulator } from "@/components/simulators/types";

const NAME_KEY = "uchispro_sim_student_v1";

/**
 * Прохождение тренажёра по ссылке.
 * /trenazhery/t/:slug — готовый шаблон; /trenazhery/p/:slug — тренажёр, сохранённый в конструкторе.
 * ?g=КОД — код класса/группы подставится автоматически.
 */
export default function SimPlay({ saved = false }: { saved?: boolean }) {
  const { slug = "" } = useParams();
  const [params] = useSearchParams();
  const [sim, setSim] = useState<Simulator | null>(saved ? null : findTemplate(slug) || null);
  const [loading, setLoading] = useState(saved);
  const [error, setError] = useState(!saved && !findTemplate(slug) ? "Тренажёр не найден" : "");
  const [name, setName] = useState("");
  useEffect(() => {
    try {
      const stored = localStorage.getItem(NAME_KEY);
      if (stored) setName((cur) => cur || stored);
    } catch {
      /* noop */
    }
  }, []);
  const [group, setGroup] = useState(params.get("g") || "");
  const [started, setStarted] = useState(false);
  const [sent, setSent] = useState<"" | "ok" | "fail">("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!saved) return;
    simApi.get(slug).then((r) => {
      setLoading(false);
      if (r.ok) setSim(r.trainer);
      else setError(r.error || "Тренажёр не найден");
    });
  }, [saved, slug]);

  const runSlug = saved ? slug : `tpl-${slug}`;
  const isAuthor = saved && !!mySims.key(slug);

  const onFinish = async (r: RunResult) => {
    const res = await simApi.run(runSlug, r, name.trim(), group.trim());
    setSent(res.ok ? "ok" : "fail");
  };

  const start = () => {
    if (name.trim()) localStorage.setItem(NAME_KEY, name.trim());
    setSent("");
    setStarted(true);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href.split("?")[0]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* буфер обмена недоступен */
    }
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title={sim ? `${sim.title} — 3D-тренажёр` : "3D-тренажёр"}
        description={sim?.description || "Интерактивный 3D/VR-тренажёр в браузере"}
        noindex={saved}
      />
      <SimHeader />

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-5 md:px-6">
        {loading && (
          <div className="flex h-[60vh] items-center justify-center text-white/60">
            <Icon name="Loader2" size={28} className="mr-2 animate-spin" /> Загружаем тренажёр…
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto mt-16 max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center">
            <Icon name="SearchX" size={36} className="mx-auto mb-3 text-white/50" />
            <p className="mb-1 text-lg font-bold">{error}</p>
            <p className="mb-4 text-sm text-white/60">Проверьте ссылку или выберите тренажёр в каталоге.</p>
            <Link to="/trenazhery" className="text-primary hover:underline">
              Открыть каталог
            </Link>
          </div>
        )}

        {sim && (
          <>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap gap-1.5 text-[11px]">
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-white/75">{CATEGORY_LABEL[sim.category] || "Тренажёр"}</span>
                  {sim.audience?.map((a) => (
                    <span key={a} className="rounded bg-cyan-500/15 px-1.5 py-0.5 text-cyan-200">
                      {AUDIENCE_LABEL[a]}
                    </span>
                  ))}
                  {sim.grade && <span className="rounded bg-white/5 px-1.5 py-0.5 text-white/55">{sim.grade}</span>}
                </div>
                <h1 className="font-montserrat text-2xl font-black md:text-3xl">{sim.title}</h1>
                {sim.description && <p className="mt-1 max-w-3xl text-sm text-white/60">{sim.description}</p>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyLink} className="border-white/20 bg-transparent text-white">
                  <Icon name={copied ? "Check" : "Link"} size={14} className="mr-1" />
                  {copied ? "Скопировано" : "Ссылка для учеников"}
                </Button>
                {isAuthor && (
                  <Link to={`/trenazhery/konstruktor?edit=${slug}`}>
                    <Button size="sm" className="bg-white/10 text-white hover:bg-white/20">
                      <Icon name="Pencil" size={14} className="mr-1" /> Изменить
                    </Button>
                  </Link>
                )}
                {!saved && (
                  <Link to={`/trenazhery/konstruktor?from=${slug}`}>
                    <Button size="sm" className="bg-white/10 text-white hover:bg-white/20">
                      <Icon name="Copy" size={14} className="mr-1" /> Взять за основу
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {!started ? (
              <div className="grid gap-5 md:grid-cols-[1fr_340px]">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="mb-3 font-bold">Что предстоит сделать</p>
                  <ol className="space-y-2">
                    {sim.steps.map((s, i) => (
                      <li key={s.id} className="flex gap-3 text-sm">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold">{i + 1}</span>
                        <span className="text-white/80">{s.title}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-4 rounded-xl bg-white/5 p-3 text-sm text-white/60">
                    <p>
                      <b className="text-white/85">Как проходить:</b> крутите сцену мышью или пальцем и нажимайте на нужный предмет. За ошибки и
                      подсказки снимаются баллы, опасная ошибка — сразу «не сдано». Порог: {sim.passScore ?? 70} баллов.
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="mb-3 font-bold">Представьтесь</p>
                  <label className="mb-1 block text-xs text-white/55">Имя и фамилия</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: Иван Петров" className="mb-3 bg-white/5" />
                  <label className="mb-1 block text-xs text-white/55">Класс или группа (если дал учитель)</label>
                  <Input value={group} onChange={(e) => setGroup(e.target.value)} placeholder="Например: 8Б" className="mb-4 bg-white/5" />
                  <Button onClick={start} className="w-full bg-gradient-to-r from-violet-500 to-cyan-500 font-bold text-white">
                    <Icon name="Play" size={16} className="mr-1" /> Начать тренажёр
                  </Button>
                  <p className="mt-2 text-center text-xs text-white/40">Результат увидит учитель или инструктор</p>
                </div>
              </div>
            ) : (
              <>
                <Player key={slug} sim={sim} onFinish={onFinish} />
                {sent === "ok" && (
                  <p className="mt-3 flex items-center gap-1.5 text-sm text-emerald-300">
                    <Icon name="CheckCircle2" size={15} /> Результат сохранён{name ? ` — ${name}` : ""}
                  </p>
                )}
                {sent === "fail" && <p className="mt-3 text-sm text-amber-300">Результат не отправился — проверьте интернет и пройдите ещё раз.</p>}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}