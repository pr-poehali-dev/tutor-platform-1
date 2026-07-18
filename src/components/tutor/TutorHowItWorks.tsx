import Icon from "@/components/ui/icon";
import { TUTOR_STEPS, TUTOR_PERKS } from "./tutorHubData";

export default function TutorHowItWorks() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white">Как это работает</h2>
        <p className="text-white/55 text-sm md:text-base mt-2">Три шага до первого урока</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 md:gap-5">
        {TUTOR_STEPS.map((step) => (
          <div key={step.n} className="relative rounded-3xl border border-white/10 bg-card/60 p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center font-montserrat font-black text-white">
                {step.n}
              </span>
              <Icon name={step.icon} size={22} className="text-purple-300" />
            </div>
            <h3 className="font-montserrat font-bold text-lg text-white">{step.title}</h3>
            <p className="text-white/60 text-sm mt-2 leading-relaxed">{step.text}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
        {TUTOR_PERKS.map((perk) => (
          <div key={perk.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <Icon name={perk.icon} size={20} className="text-cyan-300 mb-2" />
            <h4 className="font-bold text-white text-sm">{perk.title}</h4>
            <p className="text-white/55 text-xs mt-1 leading-relaxed">{perk.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
