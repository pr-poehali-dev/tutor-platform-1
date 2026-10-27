import { useEffect, useState } from "react";
import { Link, useParams } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import DirLayout from "@/components/schools/DirLayout";
import SchoolRow from "@/components/schools/SchoolRow";
import ProfileForm from "@/components/schools/ProfileForm";
import { dirApi, KIND_LABEL, SchoolDetails, SITE_URL } from "@/components/schools/api";

export default function SchoolPage() {
  const { slug = "" } = useParams();
  const [s, setS] = useState<SchoolDetails | null>(null);
  const [error, setError] = useState("");
  const [claim, setClaim] = useState(false);

  useEffect(() => {
    setS(null);
    setClaim(false);
    dirApi.school(slug).then((r) => (r.ok ? setS(r.data) : setError(r.error)));
  }, [slug]);

  if (error) {
    return (
      <DirLayout crumbs={[{ label: "Главная", href: "/" }, { label: "Справочник школ", href: "/shkoly" }]}>
        <p className="mt-8 text-white/70">{error}</p>
        <Link to="/shkoly" className="mt-4 inline-block text-primary hover:underline">Вернуться в справочник</Link>
      </DirLayout>
    );
  }
  if (!s) {
    return (
      <DirLayout crumbs={[{ label: "Главная", href: "/" }, { label: "Справочник школ", href: "/shkoly" }]}>
        <p className="mt-8 text-white/50">Загружаем…</p>
      </DirLayout>
    );
  }

  const p = s.profile;
  const address = s.address.replace(/^\d{6},\s*/, "");
  const crumbs = [
    { label: "Главная", href: "/" },
    { label: "Справочник школ", href: "/shkoly" },
    ...(s.city_slug ? [{ label: s.city, href: `/shkoly/gorod/${s.city_slug}` }] : []),
    { label: s.name },
  ];
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "School",
      name: s.full_name,
      alternateName: s.name,
      url: `${SITE_URL}/shkoly/${s.slug}`,
      address: { "@type": "PostalAddress", streetAddress: address, addressLocality: s.city, addressCountry: "RU" },
      ...(s.phone ? { telephone: s.phone } : {}),
      ...(s.website ? { sameAs: [s.website] } : {}),
      ...(s.ratings.length
        ? { award: s.ratings.map((r) => `${r.place}-е место: ${r.list} (RAEX, ${r.year})`) }
        : {}),
    },
  ];

  return (
    <DirLayout crumbs={crumbs}>
      <Seo
        title={`${s.name} — ${s.city}: адрес, сайт, рейтинг`}
        description={`${s.full_name}, ${s.city}. Адрес: ${address}.${s.ratings.length ? ` ${s.ratings[0].place}-е место в рейтинге «${s.ratings[0].list}» RAEX ${s.ratings[0].year}.` : ""} Телефон, сайт${p ? ", достижения и методики школы" : ""}.`}
        canonical={`${SITE_URL}/shkoly/${s.slug}`}
        jsonLd={jsonLd}
      />

      <section className="mb-8 mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">{KIND_LABEL[s.kind]}</span>
          {s.verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">
              <Icon name="BadgeCheck" size={13} />
              Сведения подтверждены школой
            </span>
          )}
          {s.city_place && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-3 py-1 text-xs text-amber-200">
              <Icon name="Trophy" size={13} />
              {s.city_place}-е место в справочнике — {s.city}
            </span>
          )}
        </div>
        <h1 className="mt-4 text-2xl font-bold leading-tight sm:text-4xl">{s.name}</h1>
        {s.full_name !== s.name && <p className="mt-2 text-sm text-white/50">{s.full_name}</p>}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {s.ratings.length > 0 && (
            <section className="rounded-3xl border border-amber-400/30 bg-amber-400/[0.07] p-5">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
                <Icon name="Award" size={20} className="text-amber-300" />
                В открытых рейтингах
              </h2>
              <ul className="space-y-2">
                {s.ratings.map((r) => (
                  <li key={r.url} className="flex items-start gap-3">
                    <span className="grid h-9 min-w-9 shrink-0 place-items-center rounded-lg bg-amber-400/20 px-2 text-sm font-bold text-amber-100">
                      {r.place}
                    </span>
                    <span className="text-sm">
                      <a href={r.url} target="_blank" rel="noopener noreferrer nofollow" className="font-medium hover:underline">
                        {r.list}
                      </a>
                      <span className="block text-white/50">RAEX, {r.year} · место {r.place} из {r.size}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {p ? (
            <section className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="flex items-center gap-2 text-sm text-emerald-300">
                <Icon name="BadgeCheck" size={16} />
                Рассказывает школа
              </p>
              {(p.olympiad_winners || p.avg_ege) && (
                <div className="grid grid-cols-2 gap-3">
                  {p.olympiad_winners ? <Stat value={String(p.olympiad_winners)} label="призёров и победителей олимпиад за год" /> : null}
                  {p.avg_ege ? <Stat value={String(p.avg_ege).replace(".", ",")} label="средний балл ЕГЭ" /> : null}
                </div>
              )}
              <Block title="О школе" text={p.about} />
              <Block title="Достижения" text={p.achievements} />
              <Block title="Методики и авторские программы" text={p.methods} />
              <Block title="Профили и направления" text={p.profiles} />
            </section>
          ) : (
            <section className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-5">
              <h2 className="text-lg font-bold">Школа ещё не рассказала о себе</h2>
              <p className="mt-2 text-sm text-white/60">
                Здесь появятся достижения, методики и профильные классы, когда школа пришлёт сведения. Сейчас на странице — данные официального реестра.
              </p>
              {!claim && (
                <button onClick={() => setClaim(true)} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-300 hover:underline">
                  <Icon name="PenLine" size={15} />
                  Я представляю эту школу — заполнить анкету
                </button>
              )}
            </section>
          )}

          {claim && (
            <section className="rounded-3xl border border-emerald-400/30 bg-emerald-400/[0.06] p-5">
              <h2 className="mb-1 text-lg font-bold">Анкета школы</h2>
              <p className="mb-4 text-sm text-white/60">
                Проверим сведения и опубликуем в течение 2 рабочих дней. Укажите рабочую почту школы — по ней мы подтвердим, что вы её представляете.
              </p>
              <ProfileForm mode="claim" slug={s.slug} />
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-sm">
            <h2 className="mb-3 font-bold">Контакты</h2>
            <dl className="space-y-3">
              {address && <Row icon="MapPin" label="Адрес" value={address} />}
              {s.phone && <Row icon="Phone" label="Телефон" value={s.phone} />}
              {s.website && (
                <div className="flex gap-3">
                  <Icon name="Globe" size={16} className="mt-0.5 shrink-0 text-white/40" />
                  <div className="min-w-0">
                    <dt className="text-xs text-white/40">Сайт</dt>
                    <dd>
                      <a href={s.website} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-primary hover:underline">
                        {s.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </a>
                    </dd>
                  </div>
                </div>
              )}
            </dl>
            <p className="mt-4 text-xs text-white/35">Источник: реестр аккредитации Рособрнадзора. Нашли ошибку? Напишите нам — исправим.</p>
          </section>

          <section className="rounded-3xl border border-primary/30 bg-primary/10 p-5 text-sm">
            <p className="font-bold">Ученикам этой школы</p>
            <p className="mt-1 text-white/70">ИИ-наставник по всем предметам: объяснит тему и разберёт домашку по фото. Первый урок — бесплатно.</p>
            <Link to="/tutor" className="mt-3 inline-flex items-center gap-1 font-semibold text-primary hover:underline">
              Попробовать
              <Icon name="ArrowRight" size={14} />
            </Link>
          </section>
        </aside>
      </div>

      {s.nearby.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold">Другие школы — {s.city}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {s.nearby.map((n) => (
              <SchoolRow key={n.id} school={n} />
            ))}
          </div>
          {s.city_slug && (
            <Link to={`/shkoly/gorod/${s.city_slug}`} className="mt-4 inline-block text-sm text-primary hover:underline">
              Все школы — {s.city} →
            </Link>
          )}
        </section>
      )}
    </DirLayout>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.05] p-4">
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  );
}

function Block({ title, text }: { title: string; text: string | null }) {
  if (!text) return null;
  return (
    <div>
      <h3 className="mb-1 font-semibold">{title}</h3>
      <p className="whitespace-pre-line text-sm leading-relaxed text-white/75">{text}</p>
    </div>
  );
}

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <Icon name={icon} size={16} className="mt-0.5 shrink-0 text-white/40" />
      <div>
        <dt className="text-xs text-white/40">{label}</dt>
        <dd>{value}</dd>
      </div>
    </div>
  );
}
