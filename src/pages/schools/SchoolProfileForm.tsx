import { useEffect, useState } from "react";
import { Link, useSearchParams } from "@/lib/router-compat";
import Seo from "@/components/seo/Seo";
import Icon from "@/components/ui/icon";
import DirLayout from "@/components/schools/DirLayout";
import ProfileForm from "@/components/schools/ProfileForm";
import { dirApi, ProfileFields, SchoolCard, SchoolRating } from "@/components/schools/api";

type Data = { school: SchoolCard & { ratings: SchoolRating[] }; last: (Partial<ProfileFields> & { status: string }) | null };

const STATUS: Record<string, string> = {
  pending: "Предыдущая анкета на проверке. Можно отправить исправленную — заменит прежнюю.",
  approved: "Анкета опубликована. Если что-то изменилось — отправьте обновлённую.",
  rejected: "Предыдущую анкету не смогли опубликовать. Ответьте на наше письмо — подскажем почему.",
};

export default function SchoolProfileForm() {
  const [sp] = useSearchParams();
  const t = sp.get("t") || "";
  const [d, setD] = useState<Data | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    dirApi.profileForm(t).then((r) => (r.ok ? setD(r.data) : setError(r.error)));
  }, [t]);

  return (
    <DirLayout crumbs={[{ label: "Справочник школ", href: "/shkoly" }, { label: "Анкета школы" }]}>
      <Seo title="Анкета школы для справочника" description="Расскажите о достижениях и методиках школы." noindex />
      <div className="mx-auto max-w-3xl">
        {error && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <p className="font-semibold">{error}</p>
            <p className="mt-2 text-sm text-white/60">
              Найдите свою школу в <Link to="/shkoly" className="text-primary hover:underline">справочнике</Link> и нажмите «Я представляю эту школу».
            </p>
          </div>
        )}
        {!d && !error && <p className="mt-8 text-white/50">Загружаем…</p>}
        {d && (
          <>
            <section className="mb-6 mt-4">
              <h1 className="text-2xl font-bold sm:text-3xl">Расскажите о школе</h1>
              <p className="mt-2 text-white/70">
                <b className="text-white">{d.school.name}</b>, {d.school.city}. Сведения появятся на{" "}
                <Link to={`/shkoly/${d.school.slug}`} className="text-primary hover:underline">странице школы</Link> после проверки.
              </p>
              {d.school.ratings.length > 0 && (
                <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-400/10 p-3 text-sm text-amber-100">
                  <Icon name="Award" size={16} className="mt-0.5 shrink-0 text-amber-300" />
                  Школа уже отмечена: {d.school.ratings.map((r) => `${r.place}-е место — ${r.list}`).join("; ")}.
                </p>
              )}
              {d.last && STATUS[d.last.status] && <p className="mt-3 text-sm text-white/60">{STATUS[d.last.status]}</p>}
            </section>
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
              <ProfileForm mode="token" token={t} initial={d.last || undefined} />
            </div>
          </>
        )}
      </div>
    </DirLayout>
  );
}
