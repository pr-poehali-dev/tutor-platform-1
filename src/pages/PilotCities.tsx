import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { PILOT_CITIES } from "@/data/pilotCities";

/** Список городов пилотного проекта: ученик выбирает свой город и активирует промокод. */
export default function PilotCities() {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase().replace(/ё/g, "е");
  const list = query
    ? PILOT_CITIES.filter((c) => (c.name + " " + c.nameGen).toLowerCase().replace(/ё/g, "е").includes(query))
    : PILOT_CITIES;
  return (
    <div className="min-h-screen bg-mesh text-white font-golos">
      <Seo
        title="Пилотный проект УЧИСЬПРО для школ: выберите свой город"
        description="Бесплатный доступ к курсам для школьников 1–11 класса до 31 мая 2027 года. Промокод — название вашего города."
        canonical="https://учисьпро.рф/pilot"
        noindex
      />
      <header className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-lg">🎓</div>
            <span className="font-montserrat font-black gradient-text-purple">УЧИСЬПРО</span>
          </Link>
          <Link to="/shkola" className="text-sm font-bold text-violet-200 hover:text-white transition-colors">Школьникам</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8 md:py-12">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: "Главная", href: "/" },
            { label: "Школьникам", href: "/shkola" },
            { label: "Пилотный проект", href: "/pilot" },
          ]}
        />
        <div className="text-center mb-8">
          <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-tight mb-4">
            Пилотный проект{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">для школ</span>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-xl mx-auto">
            Курсы для 1–11 класса бесплатно до 31 мая 2027 года. Выберите свой город — промокод уже будет подставлен.
          </p>
        </div>

        <div className="relative mb-5">
          <Icon name="Search" size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Найти свой город"
            aria-label="Поиск города"
            className="w-full rounded-xl bg-white/[0.05] border border-white/15 pl-11 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-violet-400"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {list.length === 0 && <p className="text-white/50 text-sm sm:col-span-2">Такого города пока нет в пилоте.</p>}
          {list.map((c) => (
            <Link
              key={c.slug}
              to={c.path}
              className="group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-violet-400/40 p-4 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/25 to-cyan-500/25 flex items-center justify-center flex-shrink-0">
                  <Icon name="MapPin" size={18} className="text-cyan-200" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold truncate">{c.name}</p>
                  <p className="text-xs text-white/50 font-mono tracking-wider truncate">{c.promo}</p>
                </div>
              </div>
              <Icon name="ChevronRight" size={18} className="text-white/40 group-hover:text-white flex-shrink-0" />
            </Link>
          ))}
        </div>

        <p className="text-white/45 text-xs leading-relaxed mt-8">
          Промокод действует только для раздела «Школьникам». Курсы для взрослых, раздел «Малыш» и подписка «Репетитор» оплачиваются отдельно. Один аккаунт — одна активация.
        </p>
      </main>
    </div>
  );
}
