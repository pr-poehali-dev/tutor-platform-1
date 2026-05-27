import Icon from "@/components/ui/icon";
import { COURSES } from "@/components/courses/coursesData";
import { Stats } from "./types";

interface Props {
  stats: Stats;
  fallbackCount: number;
}

export default function StatsHeader({ stats, fallbackCount }: Props) {
  return (
    <>
      <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/35 rounded-full px-4 py-1.5 mb-4">
        <Icon name="BookOpenCheck" size={14} className="text-emerald-300" />
        <span className="text-sm text-emerald-200 font-bold uppercase tracking-wider">Контент курсов</span>
      </div>
      <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-3">
        Программы <span className="gradient-text-purple">{COURSES.length} курсов</span>
      </h1>
      <p className="text-white/65 text-base md:text-lg max-w-3xl mb-8">
        Каждый курс получает уникальную программу по ФГОС. Генерация идёт <b>по одному курсу</b>: даже если связь оборвётся — прогресс сохранится в браузере и продолжится автоматически.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/15 border-2 border-emerald-500/45 rounded-2xl p-4 relative overflow-hidden">
          <div className="text-4xl font-montserrat font-black text-emerald-300">
            {stats.onSale}<span className="text-white/40 text-2xl">/{stats.total}</span>
          </div>
          <div className="text-emerald-200 text-[10px] uppercase tracking-wider font-black mt-1">в продаже</div>
          <Icon name="Store" size={36} className="absolute top-2 right-2 text-emerald-300/15" />
        </div>
        <div className="bg-card/60 border border-white/10 rounded-2xl p-4">
          <div className="text-3xl font-montserrat font-black text-white">{stats.ready}</div>
          <div className="text-white/45 text-[10px] uppercase tracking-wider font-bold">всего с программой</div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
          <div className="text-3xl font-montserrat font-black text-amber-300">{fallbackCount}</div>
          <div className="text-amber-200/65 text-[10px] uppercase tracking-wider font-bold">сняты с продажи (шаблон)</div>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4">
          <div className="text-3xl font-montserrat font-black text-rose-300">{stats.missing}</div>
          <div className="text-rose-200/65 text-[10px] uppercase tracking-wider font-bold">нет программы</div>
        </div>
      </div>

      {/* Главное сообщение: в каталоге сейчас только курсы с реальной ИИ-программой */}
      {stats.onSale < stats.total && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <Icon name="ShieldCheck" size={20} className="text-cyan-300 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-bold text-sm mb-0.5">В каталоге сейчас {stats.onSale} из {stats.total} курсов</p>
            <p className="text-white/65 text-xs">
              Курсы без реальной программы автоматически скрыты из продажи. Покупка по прямому URL также заблокирована. Чтобы вернуть курс в продажу — перегенерируй его через ИИ.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
