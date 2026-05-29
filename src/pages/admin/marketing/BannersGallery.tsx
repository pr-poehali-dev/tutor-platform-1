import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";

interface Banner {
  id: string;
  title: string;
  desc: string;
  format: string;
  url: string;
  post: string;
}

const SITE = "учисьпро.рф";

const BANNERS: Banner[] = [
  {
    id: "universal",
    title: "Универсальный",
    desc: "Учись бесплатно · ИИ-репетитор 24/7",
    format: "Пост · квадрат",
    url: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/f42287bb-3704-4fb2-ad63-aee6b818753b.jpg",
    post:
      "🚀 Персональный ИИ-репетитор, который отвечает за секунды — 24/7!\n\n" +
      "📚 Все курсы 1–11 классов\n🎓 Подготовка к ЕГЭ и ОГЭ\n🎤 Голосовое и текстовое общение\n\n" +
      `Первый урок бесплатно — заходи на ${SITE} и попробуй прямо сейчас!`,
  },
  {
    id: "story",
    title: "Для сторис",
    desc: "Вертикальный формат для Stories",
    format: "Сторис · 9:16",
    url: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/155a057c-2254-4526-9691-b61c0ab78ad1.jpg",
    post:
      "✨ Не понял тему? Спроси у ИИ-репетитора — ответит за секунды!\n\n" +
      `Учись когда удобно, готовься к экзаменам без стресса. ${SITE} 👆`,
  },
  {
    id: "dobro",
    title: "Акция ДОБРО",
    desc: "Учись бесплатно до 15 июня",
    format: "Пост · квадрат",
    url: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/ce211ed6-3814-427c-8918-2629335ec548.jpg",
    post:
      "❤️ Акция ДОБРО: учись БЕСПЛАТНО до 15 июня!\n\n" +
      "Мы поставили все платежи на паузу. Каждый школьник может пройти любой курс УЧИСЬПРО — без карты, без подписки, без ограничений.\n\n" +
      "🎒 Все курсы\n🤖 ИИ-репетитор 24/7\n🎓 Подготовка к ЕГЭ и ОГЭ\n\n" +
      `Успей подключиться → ${SITE}/share/dobro`,
  },
  {
    id: "ege",
    title: "Подготовка к ЕГЭ",
    desc: "Сдай ЕГЭ на высший балл",
    format: "Пост · квадрат",
    url: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/1ac253de-acc4-427c-b3de-302b303c000d.jpg",
    post:
      "🎯 Сдай ЕГЭ на высший балл с ИИ-репетитором!\n\n" +
      "📝 Разбор заданий ФИПИ\n⚡ Объяснения за секунды\n🕐 Готовься 24/7 в своём темпе\n\n" +
      `Начни подготовку бесплатно на ${SITE}`,
  },
];

export default function BannersGallery() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (key: string, text: string, fallbackLabel: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      window.prompt(fallbackLabel, text);
    }
  };

  return (
    <Card className="border border-white/10 bg-white/[0.03] p-5 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
          <Icon name="Image" size={18} className="text-white" />
        </div>
        <div>
          <h2 className="font-montserrat text-base font-bold text-white">Рекламные баннеры</h2>
          <p className="text-white/55 text-xs">Картинка + готовый текст поста для VK и Telegram. Копируй и публикуй.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BANNERS.map((b) => (
          <div key={b.id} className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden flex flex-col sm:flex-row">
            <div className="sm:w-40 flex-shrink-0 aspect-square sm:aspect-auto overflow-hidden bg-black/30">
              <img src={b.url} alt={b.title} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="p-3 flex flex-col flex-1 min-w-0">
              <p className="font-bold text-white text-sm">{b.title}</p>
              <span className="text-white/35 text-[10px] mb-2">{b.format}</span>
              <div className="bg-black/30 border border-white/8 rounded-xl p-2.5 mb-3 flex-1">
                <p className="text-white/65 text-xs leading-relaxed whitespace-pre-wrap line-clamp-6">{b.post}</p>
              </div>
              <div className="mt-auto flex gap-1.5 flex-wrap">
                <button
                  onClick={() => copy(`post-${b.id}`, b.post, "Скопируй текст поста:")}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold py-2 rounded-xl hover:opacity-90 transition-opacity"
                >
                  <Icon name={copied === `post-${b.id}` ? "Check" : "Copy"} size={13} />
                  {copied === `post-${b.id}` ? "Скопировано!" : "Копировать текст"}
                </button>
                <a
                  href={b.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 border border-white/15 text-white/70 hover:text-white hover:border-white/30 text-xs font-bold py-2 rounded-xl transition-all"
                >
                  <Icon name="Download" size={13} /> Картинка
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
