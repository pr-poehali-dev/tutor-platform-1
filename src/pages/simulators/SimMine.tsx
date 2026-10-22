import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import SimHeader from "@/components/simulators/SimHeader";
import { mySims } from "@/components/simulators/api";

/** Тренажёры, созданные в этом браузере: правка, ссылка ученикам, результаты. */
export default function SimMine() {
  const [list] = useState(mySims.list());
  const [copied, setCopied] = useState("");

  const copy = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/trenazhery/p/${slug}`);
      setCopied(slug);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      /* буфер обмена недоступен */
    }
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo title="Мои тренажёры" description="Тренажёры, которые вы создали в конструкторе" noindex />
      <SimHeader />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h1 className="font-montserrat text-2xl font-black">Мои тренажёры</h1>
          <Link
            to="/trenazhery/konstruktor"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2 text-sm font-bold text-white"
          >
            <Icon name="Plus" size={15} /> Создать
          </Link>
        </div>

        {list.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
            <Icon name="FolderOpen" size={36} className="mx-auto mb-3 text-white/40" />
            <p className="mb-1 font-bold">Пока пусто</p>
            <p className="mb-4 text-sm text-white/55">Создайте тренажёр с ИИ или возьмите за основу готовый из каталога.</p>
            <Link to="/trenazhery" className="text-primary hover:underline">
              Открыть каталог
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {list.map((s) => (
              <div key={s.slug} className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <Icon name="Box" size={18} className="text-cyan-300" />
                <span className="min-w-0 flex-1 truncate font-semibold">{s.title}</span>
                <button onClick={() => copy(s.slug)} className="flex items-center gap-1 rounded-md bg-white/5 px-2.5 py-1 text-xs hover:bg-white/10">
                  <Icon name={copied === s.slug ? "Check" : "Link"} size={13} />
                  {copied === s.slug ? "Скопировано" : "Ссылка"}
                </button>
                <Link to={`/trenazhery/p/${s.slug}`} className="flex items-center gap-1 rounded-md bg-white/5 px-2.5 py-1 text-xs hover:bg-white/10">
                  <Icon name="Play" size={13} /> Пройти
                </Link>
                <Link to={`/trenazhery/konstruktor?edit=${s.slug}`} className="flex items-center gap-1 rounded-md bg-violet-500/20 px-2.5 py-1 text-xs text-violet-100 hover:bg-violet-500/30">
                  <Icon name="Pencil" size={13} /> Изменить и результаты
                </Link>
              </div>
            ))}
            <p className="pt-2 text-xs text-white/40">
              Список хранится в этом браузере. Откройте его с того же устройства, чтобы править тренажёры и смотреть результаты.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
