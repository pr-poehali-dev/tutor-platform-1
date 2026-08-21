import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Props {
  url: string;
  title: string;
  summary?: string;
  content?: string;
}

const TENCHAT_PROFILE = "https://tenchat.ru/u/WDP9Eb5q";
const PIN_KEY = "uchispro_admin_pin_v1";

/** Кнопка нужна только владельцу сайта — читателям её видеть незачем. */
function isOwner(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    sessionStorage.getItem(PIN_KEY) || localStorage.getItem(PIN_KEY),
  );
}

/** Готовит текст поста под TenChat и открывает редактор.
 *
 *  У TenChat нет открытого API для автопубликации, поэтому делаем
 *  максимально быстрый ручной путь: текст уже собран и в буфере,
 *  остаётся вставить его в редактор и нажать «Опубликовать».
 */
export default function CrosspostTenchat({
  url,
  title,
  summary = "",
  content = "",
}: Props) {
  const [copied, setCopied] = useState(false);
  const [owner] = useState(isOwner);

  const buildPost = (): string => {
    // Берём вступление статьи: до 1200 знаков по границе абзаца,
    // чтобы пост читался целиком, а за продолжением человек шёл на сайт.
    const body = (content || summary || "")
      .replace(/^#+\s.*$/gm, "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    let intro = body.slice(0, 1200);
    const lastBreak = intro.lastIndexOf("\n\n");
    if (lastBreak > 500) intro = intro.slice(0, lastBreak);

    return `${title}\n\n${intro.trim()}\n\nПродолжение и полный разбор — по ссылке:\n${url}`;
  };

  const handleCopy = async () => {
    const text = buildPost();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* буфер недоступен — пользователь скопирует вручную из открытого окна */
    }
    window.open(TENCHAT_PROFILE, "_blank", "noopener,noreferrer");
  };

  if (!owner) return null;

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-lg border border-[#2B5CE6]/40 bg-[#2B5CE6]/15
                 px-3.5 py-2 text-sm font-medium text-[#9db3ff] transition
                 hover:border-[#2B5CE6]/70 hover:bg-[#2B5CE6]/25 hover:text-white"
      title="Скопировать готовый пост и открыть TenChat"
    >
      <Icon name={copied ? "Check" : "Briefcase"} size={15} />
      {copied ? "Пост скопирован — вставьте в TenChat" : "Опубликовать в TenChat"}
    </button>
  );
}