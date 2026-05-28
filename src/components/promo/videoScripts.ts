/**
 * Сценарии видеообзора УЧИСЬПРО для соцсетей.
 * Один сценарий — три формата сборки (60с 9:16, 60с 16:9, 120с 16:9).
 *
 * Каждая сцена: длительность, текст диктора (Filipp/SpeechKit),
 * заголовок-плашка на экране, эмодзи, цвет градиента.
 */

export interface VideoScene {
  /** Длительность в секундах. */
  duration: number;
  /** Текст, который произнесёт диктор. */
  voice: string;
  /** Большая надпись поверх кадра. */
  title: string;
  /** Подпись поменьше под заголовком. */
  subtitle?: string;
  /** Эмодзи-иконка. */
  emoji: string;
  /** Tailwind-градиент фона (from-X via-Y to-Z). */
  bg: string;
  /** Промт для FLUX/Pollinations, если нужна картинка (опционально). */
  imagePrompt?: string;
  /** Цвет акцента (для подписи). */
  accent?: string;
}

export interface VideoVariant {
  id: "shorts60" | "wide60" | "wide120";
  label: string;
  /** Соотношение сторон. */
  aspect: "9:16" | "16:9";
  /** Целевой размер. */
  width: number;
  height: number;
  /** Где публиковать. */
  platforms: string[];
  /** Сцены. */
  scenes: VideoScene[];
  /** Готовая обложка-постер (FLUX) — прикреплять при публикации в соцсетях. */
  posterUrl: string;
}

// ───────────────────────────────────────────────────────────────────────────
// Базовые сцены (хук → проблема → решение → фишки → CTA)
// ───────────────────────────────────────────────────────────────────────────

const HOOK: VideoScene = {
  duration: 4,
  voice: "Внимание... репетитор больше не нужен.",
  title: "Репетитор\nбольше не нужен",
  subtitle: "Сейчас покажу почему",
  emoji: "🚀",
  bg: "from-purple-600 via-pink-500 to-orange-500",
};

const PROBLEM: VideoScene = {
  duration: 6,
  voice: "Один час с репетитором — полторы тысячи рублей. А нужно сорок часов до экзамена. Считай сам.",
  title: "1500 ₽ / час\n× 40 часов",
  subtitle: "= 60 000 ₽ за подготовку",
  emoji: "😱",
  bg: "from-red-600 via-rose-500 to-pink-500",
  accent: "text-yellow-300",
};

const SOLUTION: VideoScene = {
  duration: 6,
  voice: "Знакомься — УЧИСЬПРО. Искусственный интеллект, который учит школьников 24 часа в сутки.",
  title: "УЧИСЬПРО",
  subtitle: "ИИ-репетитор 24/7",
  emoji: "🤖",
  bg: "from-cyan-500 via-blue-500 to-purple-600",
};

const FEATURE_AI: VideoScene = {
  duration: 7,
  voice: "Задаёшь вопрос голосом или текстом — ИИ отвечает за секунду. По математике, физике, химии, любому предмету.",
  title: "Голос или текст",
  subtitle: "Ответ за секунду",
  emoji: "💬",
  bg: "from-violet-600 via-purple-500 to-fuchsia-500",
};

const FEATURE_EGE: VideoScene = {
  duration: 7,
  voice: "Готовишься к ЕГЭ или ОГЭ — внутри весь банк заданий ФИПИ, разборы и пробные экзамены. Плюс база из двухсот тридцати ВУЗов России.",
  title: "ЕГЭ · ОГЭ",
  subtitle: "+ 230 ВУЗов России",
  emoji: "🎓",
  bg: "from-emerald-500 via-teal-500 to-cyan-500",
};

const FEATURE_PROF: VideoScene = {
  duration: 6,
  voice: "Не знаешь, кем стать? Пройди тест «Познай себя» — за тридцать минут узнаешь свою профессию.",
  title: "Познай себя",
  subtitle: "Тест на профессию",
  emoji: "🧭",
  bg: "from-amber-500 via-orange-500 to-rose-500",
};

const FEATURE_KIDS: VideoScene = {
  duration: 5,
  voice: "А для самых маленьких — раздел «Малыш». Развивающие занятия с года.",
  title: "Малыш 1+",
  subtitle: "Развивашки для дошкольников",
  emoji: "👶",
  bg: "from-pink-400 via-rose-400 to-orange-400",
};

const FEATURE_GRANTS: VideoScene = {
  duration: 5,
  voice: "Лента грантов, олимпиад и стипендий обновляется каждый час — не пропустишь ни одной возможности.",
  title: "Лента грантов",
  subtitle: "Обновляется каждый час",
  emoji: "📡",
  bg: "from-indigo-600 via-blue-500 to-cyan-400",
};

const PROMO_DOBRO: VideoScene = {
  duration: 8,
  voice: "И самое главное. До пятнадцатого июня действует акция ДОБРО — всё бесплатно. Без карты, без подписки. Просто заходи и учись.",
  title: "Акция «ДОБРО»",
  subtitle: "Всё бесплатно до 15.06.2026",
  emoji: "❤️",
  bg: "from-rose-500 via-pink-500 to-orange-500",
  accent: "text-yellow-200",
};

const CTA: VideoScene = {
  duration: 6,
  voice: "Заходи на учисьпро точка рф. Начни учиться бесплатно прямо сейчас.",
  title: "учисьпро.рф",
  subtitle: "Начни прямо сейчас →",
  emoji: "🌐",
  bg: "from-purple-600 via-fuchsia-500 to-pink-500",
};

// ───────────────────────────────────────────────────────────────────────────
// 3 ВАРИАНТА СБОРКИ
// ───────────────────────────────────────────────────────────────────────────

/** 60 сек 9:16 — VK Клипы, TikTok, Reels, YouTube Shorts. Короткий хук-сценарий. */
export const VIDEO_SHORTS_60: VideoVariant = {
  id: "shorts60",
  label: "Shorts · 60 секунд · вертикальный 9:16",
  aspect: "9:16",
  width: 720,
  height: 1280,
  platforms: ["VK Клипы", "TikTok", "YouTube Shorts", "Дзен Видео"],
  posterUrl: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/731fc37c-ffae-4f3f-a1e6-34a7fe86d6b0.jpg",
  scenes: [
    HOOK,                  // 4s
    PROBLEM,               // 6s
    SOLUTION,              // 6s
    FEATURE_AI,            // 7s
    FEATURE_EGE,           // 7s
    FEATURE_PROF,          // 6s
    PROMO_DOBRO,           // 8s
    { ...CTA, duration: 6, voice: "Заходи на учисьпро точка рф. Бесплатно." }, // 6s
                           // = 50s + плашки
  ],
};

/** 60 сек 16:9 — для лент VK, Rutube, Дзен, постов. */
export const VIDEO_WIDE_60: VideoVariant = {
  id: "wide60",
  label: "Минута · 16:9 · горизонтальный",
  aspect: "16:9",
  width: 1280,
  height: 720,
  platforms: ["VK Видео", "Rutube", "Дзен", "Telegram"],
  posterUrl: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/91289bad-1c65-43d9-a125-881fe8491313.jpg",
  scenes: [
    HOOK,
    PROBLEM,
    SOLUTION,
    FEATURE_AI,
    FEATURE_EGE,
    FEATURE_PROF,
    PROMO_DOBRO,
    CTA,
  ],
};

/** 120 сек 16:9 — полный обзор для YouTube, презентаций, закреплённого видео. */
export const VIDEO_WIDE_120: VideoVariant = {
  id: "wide120",
  label: "Полный обзор · 2 минуты · 16:9",
  aspect: "16:9",
  width: 1280,
  height: 720,
  platforms: ["YouTube", "VK Видео", "Rutube", "Презентации"],
  posterUrl: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/2c748f4f-6859-4396-af29-741d5bebfae3.jpg",
  scenes: [
    { ...HOOK, duration: 5 },
    { ...PROBLEM, duration: 8, voice: "Один час с репетитором стоит полторы тысячи рублей. А до экзамена нужно сорок часов. Получается шестьдесят тысяч за подготовку одного ребёнка. И это без гарантии результата." },
    { ...SOLUTION, duration: 8, voice: "Знакомься — УЧИСЬПРО. Российская образовательная платформа с искусственным интеллектом. Один ИИ-репетитор учит школьников двадцать четыре часа в сутки, по всем предметам, в любой точке страны." },
    { ...FEATURE_AI, duration: 12, voice: "Задаёшь вопрос голосом или текстом — ИИ отвечает за секунду. По математике, физике, химии, биологии, русскому, английскому — любому школьному предмету с первого по одиннадцатый класс. Объясняет простыми словами, на твоих примерах, столько раз, сколько нужно." },
    { ...FEATURE_EGE, duration: 12, voice: "Готовишься к ЕГЭ или ОГЭ — внутри весь банк заданий с сайта ФИПИ, видеоразборы, пробные экзамены с автопроверкой. Плюс база из двухсот тридцати ВУЗов России с проходными баллами по всем городам-миллионникам." },
    FEATURE_PROF,
    FEATURE_KIDS,
    FEATURE_GRANTS,
    { ...PROMO_DOBRO, duration: 10, voice: "А теперь самое главное. С двадцать восьмого мая по пятнадцатое июня две тысячи двадцать шестого года действует благотворительная акция ДОБРО. Все платежи приостановлены — все курсы, ИИ-репетитор и подготовка к экзаменам полностью бесплатны. Без карты. Без подписки." },
    { ...CTA, duration: 6, voice: "Заходи на учисьпро точка рф. Начни учиться бесплатно прямо сейчас. Расскажи друзьям." },
  ],
};

export const ALL_VARIANTS: VideoVariant[] = [
  VIDEO_SHORTS_60,
  VIDEO_WIDE_60,
  VIDEO_WIDE_120,
];

/** Общая длина в секундах. */
export function totalDuration(v: VideoVariant): number {
  return v.scenes.reduce((sum, s) => sum + s.duration, 0);
}

/** Полный текст для озвучки (одной дорожкой). */
export function fullVoiceText(v: VideoVariant): string {
  return v.scenes.map((s) => s.voice).join(" ... ");
}