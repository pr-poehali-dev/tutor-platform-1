import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const STEPS = [
  { icon: "Share2", title: "Поделись ссылкой", desc: "Отправь другу персональную ссылку из кабинета" },
  { icon: "UserPlus", title: "Друг регистрируется", desc: "Он получает бонус на первую подписку" },
  { icon: "Gift", title: "Ты получаешь награду", desc: "Бонусные ЗНАЙКИ и скидку на продление" },
];

export default function PricingReferral() {
  return (
    <div className="mb-16">
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-500/15 via-pink-500/10 to-cyan-500/10 p-6 md:p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Icon name="Gift" size={20} className="text-white" />
            </div>
            <h2 className="font-montserrat font-black text-xl md:text-2xl text-white">
              Приведи друга — получи бонус
            </h2>
          </div>
          <p className="text-white/65 text-sm md:text-base mb-6 max-w-2xl">
            Делись платформой с друзьями и одноклассниками. Каждый, кто придёт по твоей ссылке, получит бонус,
            а ты — награду ЗНАЙКАМИ и скидку на продление подписки. Учиться вместе выгоднее.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {STEPS.map((s, i) => (
              <div key={s.title} className="bg-white/[0.04] border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-purple-500/25 flex items-center justify-center text-purple-200 text-xs font-bold">
                    {i + 1}
                  </div>
                  <Icon name={s.icon} size={16} className="text-purple-300" />
                </div>
                <p className="font-bold text-white text-sm mb-1">{s.title}</p>
                <p className="text-white/50 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <Link
            to="/referral"
            className="inline-flex items-center gap-2 bg-white text-background font-bold text-sm px-6 py-3 rounded-2xl hover:bg-white/90 transition-all"
          >
            <Icon name="Sparkles" size={16} />
            Получить мою ссылку
          </Link>
        </div>
      </div>
    </div>
  );
}
