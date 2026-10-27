import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "@/lib/helmet";
import Icon from "@/components/ui/icon";
import func2url from "../../backend/func2url.json";

const URL = (func2url as Record<string, string>)["edu-institutions"];

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("t") || "";
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [org, setOrg] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      return;
    }
    fetch(`${URL}?action=unsubscribe&t=${encodeURIComponent(token)}`)
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (ok) {
          setOrg(d.org || "");
          setState("ok");
        } else setState("error");
      })
      .catch(() => setState("error"));
  }, [token]);

  return (
    <div className="min-h-screen bg-mesh text-white font-golos flex items-center justify-center p-6">
      <Helmet>
        <title>Отписка от писем — УЧИСЬПРО</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="max-w-md w-full rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
        {state === "loading" && <Icon name="Loader2" size={28} className="animate-spin mx-auto text-white/60" />}
        {state === "ok" && (
          <>
            <Icon name="MailX" size={36} className="mx-auto text-emerald-300 mb-3" />
            <h1 className="font-montserrat font-black text-2xl mb-2">Вы отписались</h1>
            <p className="text-white/65 text-sm">
              {org ? `Мы больше не будем присылать письма на адрес «${org}».` : "Мы больше не будем присылать вам письма."} Извините за беспокойство.
            </p>
          </>
        )}
        {state === "error" && (
          <>
            <Icon name="CircleAlert" size={36} className="mx-auto text-amber-300 mb-3" />
            <h1 className="font-montserrat font-black text-2xl mb-2">Ссылка недействительна</h1>
            <p className="text-white/65 text-sm">Если вы хотите отписаться, просто ответьте на письмо словом «отписаться» — мы удалим адрес вручную.</p>
          </>
        )}
        <Link to="/" className="inline-block mt-6 text-sm text-violet-300 hover:text-white">На главную</Link>
      </div>
    </div>
  );
}
