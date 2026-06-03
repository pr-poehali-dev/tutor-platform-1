import { useAuth } from "@/context/AuthContext";

interface Props {
  className?: string;
}

/** Кнопка «Войти через Яндекс». Редиректит на страницу авторизации Яндекса. */
export default function YandexLoginButton({ className = "" }: Props) {
  const { loginWithYandex } = useAuth();

  return (
    <button
      type="button"
      onClick={loginWithYandex}
      className={`w-full inline-flex items-center justify-center gap-2.5 bg-white text-[#000] font-semibold text-sm px-5 py-3 rounded-2xl hover:bg-white/90 transition-colors ${className}`}
    >
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#FC3F1D] text-white font-bold text-[13px] leading-none">Я</span>
      Войти через Яндекс
    </button>
  );
}
