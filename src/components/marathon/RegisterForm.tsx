import { useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import { trackGoal } from "@/components/analytics/YandexMetrika";
import { marathonApi, saveToken } from "./api";
import { MarathonProgram } from "./types";

interface Props {
  program: MarathonProgram;
  id?: string;
}

export default function RegisterForm({ program, id }: Props) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Укажите email — на него придёт подарок и ссылка на уроки");
      return;
    }
    if (!agree) {
      setError("Нужно согласие на обработку данных");
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const source = params.get("utm_source") || "site";
      const res = await marathonApi.register(program.track, email.trim(), name.trim(), source);
      saveToken(program.track, res.token);
      trackGoal("marathon_register", { track: program.track });
      navigate(`/${program.slug}/kabinet?t=${res.token}&welcome=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не получилось, попробуйте ещё раз");
      setLoading(false);
    }
  };

  return (
    <form id={id} onSubmit={submit} className="scroll-mt-24 rounded-3xl border border-violet-400/30 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/10 to-cyan-600/15 p-6 md:p-7">
      <p className="font-montserrat font-black text-white text-xl mb-1">Участвовать бесплатно</p>
      <p className="text-white/60 text-sm mb-5">Первый урок откроется сразу, чек-лист придёт на почту.</p>
      <div className="space-y-3 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ваше имя"
          autoComplete="given-name"
          className="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-3.5 text-white placeholder:text-white/35 focus:outline-none focus:border-violet-400/60"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          autoComplete="email"
          required
          className="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-3.5 text-white placeholder:text-white/35 focus:outline-none focus:border-violet-400/60"
        />
      </div>
      <label className="flex items-start gap-2.5 text-white/55 text-xs mb-4 cursor-pointer">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-violet-500" />
        <span>
          Согласен(на) на обработку персональных данных и получение писем о марафоне по{" "}
          <a href="/legal/privacy" target="_blank" rel="noreferrer" className="underline hover:text-white">политике конфиденциальности</a>
        </span>
      </label>
      {error && <p className="text-rose-300 text-sm mb-3">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-6 py-4 rounded-2xl hover:opacity-90 disabled:opacity-60 transition-opacity"
      >
        {loading ? <Icon name="Loader2" size={18} className="animate-spin" /> : <Icon name="Rocket" size={18} />}
        Начать марафон
      </button>
      <p className="text-white/40 text-[11px] mt-3 text-center">Бесплатно · без карты · отписаться можно в любой момент</p>
    </form>
  );
}
