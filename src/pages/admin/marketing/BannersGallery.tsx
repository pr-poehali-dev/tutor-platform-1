import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Banner {
  id: string;
  title: string;
  desc: string;
  format: string;
  url: string;
}

const BANNERS: Banner[] = [
  {
    id: "universal",
    title: "Универсальный",
    desc: "Учись бесплатно · ИИ-репетитор 24/7",
    format: "Пост · квадрат",
    url: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/f42287bb-3704-4fb2-ad63-aee6b818753b.jpg",
  },
  {
    id: "story",
    title: "Для сторис",
    desc: "Вертикальный формат для Stories",
    format: "Сторис · 9:16",
    url: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/155a057c-2254-4526-9691-b61c0ab78ad1.jpg",
  },
  {
    id: "dobro",
    title: "Акция ДОБРО",
    desc: "Учись бесплатно до 15 июня",
    format: "Пост · квадрат",
    url: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/ce211ed6-3814-427c-8918-2629335ec548.jpg",
  },
  {
    id: "ege",
    title: "Подготовка к ЕГЭ",
    desc: "Сдай ЕГЭ на высший балл",
    format: "Пост · квадрат",
    url: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/1ac253de-acc4-427c-b3de-302b303c000d.jpg",
  },
];

export default function BannersGallery() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyUrl = async (b: Banner) => {
    try {
      await navigator.clipboard.writeText(b.url);
      setCopiedId(b.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      window.prompt("Скопируй ссылку на баннер:", b.url);
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
          <p className="text-white/55 text-xs">Готовые картинки для постов в VK и Telegram. Скачай или скопируй ссылку.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {BANNERS.map((b) => (
          <div key={b.id} className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden flex flex-col">
            <div className="aspect-square overflow-hidden bg-black/30">
              <img src={b.url} alt={b.title} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="p-3 flex flex-col flex-1">
              <p className="font-bold text-white text-sm">{b.title}</p>
              <p className="text-white/50 text-xs mb-1">{b.desc}</p>
              <span className="text-white/35 text-[10px] mb-3">{b.format}</span>
              <div className="mt-auto flex gap-1.5">
                <a
                  href={b.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold py-2 rounded-xl hover:opacity-90 transition-opacity"
                >
                  <Icon name="Download" size={13} /> Скачать
                </a>
                <button
                  onClick={() => copyUrl(b)}
                  title="Скопировать ссылку"
                  className="px-2.5 rounded-xl border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-all"
                >
                  <Icon name={copiedId === b.id ? "Check" : "Link"} size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}