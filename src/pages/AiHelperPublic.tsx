import { useEffect, useState } from "react";
import { Link, useParams } from "@/lib/router-compat";
import { Helmet } from "@/lib/helmet";
import Icon from "@/components/ui/icon";
import HelperChat from "@/components/ai-helper/HelperChat";
import { Helper, helperApi } from "@/components/ai-helper/api";

/** Публичная страница помощника: сюда приходят клиенты по ссылке владельца. */
export default function AiHelperPublic() {
  const { slug = "" } = useParams();
  const [item, setItem] = useState<Helper | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    helperApi.publicInfo(slug).then((r) => {
      if (r.ok && r.data) setItem(r.data.item);
      else setError(r.error || "Помощник не найден");
    });
  }, [slug]);

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Helmet>
        <title>{item ? `${item.name} — ИИ-помощник` : "ИИ-помощник"}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="max-w-2xl w-full mx-auto px-3 py-4 flex-1">
        {error ? (
          <div className="py-20 text-center text-white/60">
            <Icon name="MessageCircleOff" fallback="CircleAlert" size={32} className="mx-auto mb-3 opacity-60" />
            {error}
          </div>
        ) : !item ? (
          <div className="py-20 text-center"><Icon name="Loader2" size={24} className="animate-spin mx-auto text-white/40" /></div>
        ) : (
          <HelperChat slug={item.slug} name={item.name} greeting={item.greeting} color={item.color} />
        )}
      </div>
      <p className="text-center text-xs text-white/40 pb-4">
        Помощник отвечает по базе знаний владельца. Сделано на{" "}
        <Link to="/ai-helper" className="underline hover:text-white">УЧИСЬПРО — создайте своего бесплатно</Link>
      </p>
    </div>
  );
}
