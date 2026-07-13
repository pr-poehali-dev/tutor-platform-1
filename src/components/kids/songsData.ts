/**
 * Каталог детских песенок и стихов для модуля «Малыш» → раздел «Учим песни и стихи».
 *
 * ВАЖНО про авторские права (ГК РФ ч. IV, ст. 1281):
 *  • Используем ТОЛЬКО народные потешки/песенки (фольклор, общественное достояние)
 *  • И авторские песенки УЧИСЬПРО — уникальные тексты, написанные методистом
 *    специально для платформы. Любая внешняя популярная песня (Синий трактор,
 *    Маша и Медведь и т.п.) защищена авторским правом — её включать НЕЛЬЗЯ.
 *  • Авторы-классики (Барто, Михалков, Маршак, Чуковский, Заходер) — права
 *    действуют ещё десятилетия после смерти, поэтому их песни тоже не включаем.
 *
 * Каждая песенка имеет:
 *  • lyrics — строки текста (для подсветки строки во время воспроизведения)
 *  • actions — что делать вместе с ребёнком (пальчиковые игры, движения)
 *  • difficulty — для какого возраста
 */

export type SongCategory = "potyashka" | "song" | "poem" | "lullaby" | "finger";
export type SongAge = "1-3" | "3-5" | "5-7";

/** Стиль фоновой мелодии, под который Лиса поёт нараспев. */
export type MelodyStyle = "folk" | "pop" | "lullaby" | "ethno" | "march";

/** CDN-источники фоновой инструменталки (сгенерированы процедурно, CC0).
 *  Используются для микширования с TTS-голосом Лисы.
 *  Длительность каждого трека ~20 сек, проигрываются в цикле. */
export const MELODY_TRACKS: Record<MelodyStyle, { url: string; label: string; volume: number }> = {
  folk: {
    url: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/bucket/songs/melody-folk.wav",
    label: "Народная гармошка",
    volume: 0.22,
  },
  pop: {
    url: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/bucket/songs/melody-pop.wav",
    label: "Детский поп",
    volume: 0.18,
  },
  lullaby: {
    url: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/bucket/songs/melody-lullaby.wav",
    label: "Колыбельное пианино",
    volume: 0.25,
  },
  ethno: {
    url: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/bucket/songs/melody-ethno.wav",
    label: "Гусли и свирель",
    volume: 0.22,
  },
  march: {
    url: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/bucket/songs/melody-march.wav",
    label: "Игрушечный марш",
    volume: 0.2,
  },
};

export interface SongLine {
  text: string;
  /** Длительность строки в секундах при озвучке (для подсветки) */
  seconds?: number;
  /** Жест/действие к этой строке (для пальчиковых игр и потешек) */
  action?: string;
  /** Таймкод начала строки (в секундах) в готовом аудиофайле песни (audioUrl).
   *  Нужен для караоке-подсветки под живой вокал. Если не указан — подсветка
   *  распределяется равномерно по длительности трека. */
  at?: number;
}

export interface Song {
  id: string;
  title: string;
  author: string;
  /** короткое уточнение про права (общественное достояние и т.п.) */
  authorNote: string;
  category: SongCategory;
  ages: SongAge[];
  emoji: string;
  color: string; // tailwind gradient
  /** Тематические теги для фильтра: транспорт, животные, природа, цвета, счёт */
  tags: string[];
  /** Чему учит песенка */
  teaches: string[];
  lines: SongLine[];
  /** Совет родителю — как лучше играть/петь */
  parentTip: string;
  /** Признак: «УЧИСЬПРО оригинал» — текст написан методистом платформы */
  original?: boolean;
  /** Стиль фоновой мелодии. Если не указан — выбирается по категории. */
  melodyStyle?: MelodyStyle;
  /** Темп пения Лисы (0.7 — очень медленно/распевно, 1.0 — обычная речь).
   *  Если не указан — выбирается по категории (колыбельные медленнее). */
  singSpeed?: number;
  /** URL готового аудиофайла с ЖИВЫМ вокалом (mp3/wav на CDN).
   *  Если задан — плеер играет цельный студийный трек вместо синтеза Лисы,
   *  а текст подсвечивается как караоке. Это даёт настоящее «пение».
   *  Строкам можно задать точные таймкоды `at`, иначе подсветка равномерная. */
  audioUrl?: string;
}

/** Возвращает стиль мелодии для песни — либо явно заданный, либо по умолчанию для категории. */
export function getMelodyStyle(song: Song): MelodyStyle {
  if (song.melodyStyle) return song.melodyStyle;
  if (song.category === "lullaby") return "lullaby";
  if (song.category === "potyashka") return "ethno";
  if (song.category === "finger") return "folk";
  if (song.category === "poem") return "pop";
  // song
  if (song.tags.includes("транспорт")) return "march";
  return "folk";
}

/** Темп пения Лисы по умолчанию — колыбельные пропеваются очень медленно. */
export function getSingSpeed(song: Song): number {
  if (song.singSpeed) return song.singSpeed;
  if (song.category === "lullaby") return 0.75;
  if (song.category === "potyashka") return 0.85;
  return 0.88;
}

/** Музыкальный стиль (жанр) для генерации песни через Suno — по категории. */
export function getSunoStyle(song: Song): string {
  const base = "russian children song, clear soft female vocal, simple catchy melody, warm, kids nursery, no rap, no hip-hop";
  if (song.category === "lullaby")
    return "gentle russian lullaby, tender soft female vocal, slow calm melody, soothing, music box, no rap";
  if (song.category === "potyashka")
    return "cheerful russian folk nursery rhyme, playful female vocal, acoustic, bright, " + base;
  if (song.category === "finger")
    return "playful russian childrens folk, light acoustic, gentle female vocal, " + base;
  if (song.tags.includes("транспорт"))
    return "upbeat cheerful childrens march, fun female vocal, drums, bright, " + base;
  return base;
}

/** Собирает текст песни для Suno с разметкой куплетов/припева. */
export function getSunoLyrics(song: Song): string {
  const lines = song.lines.map((l) => l.text.trim()).filter(Boolean);
  if (lines.length <= 4) return lines.join("\n");
  const head = lines.slice(0, Math.ceil(lines.length / 2));
  const tail = lines.slice(Math.ceil(lines.length / 2));
  return "[Verse]\n" + head.join("\n") + "\n[Chorus]\n" + tail.join("\n");
}

export const SONG_CATEGORIES: { id: SongCategory; label: string; emoji: string }[] = [
  { id: "potyashka", label: "Потешки", emoji: "👋" },
  { id: "finger", label: "Пальчиковые игры", emoji: "✋" },
  { id: "song", label: "Песенки", emoji: "🎵" },
  { id: "poem", label: "Стихи", emoji: "📜" },
  { id: "lullaby", label: "Колыбельные", emoji: "🌙" },
];

export const SONG_AGES: { id: SongAge; label: string }[] = [
  { id: "1-3", label: "1–3 года" },
  { id: "3-5", label: "3–5 лет" },
  { id: "5-7", label: "5–7 лет" },
];

// ─────────────────────────────────────────────────────────────────────────────
export const SONGS: Song[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // ПОТЕШКИ (русский фольклор — общественное достояние)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "ladushki",
    title: "Ладушки-ладушки",
    author: "Русская народная потешка",
    authorNote: "Фольклор, общественное достояние",
    category: "potyashka",
    ages: ["1-3"],
    emoji: "👏",
    color: "from-amber-400 to-orange-500",
    tags: ["знакомство", "пальчики", "первые слова"],
    teaches: ["хлопать в ладоши", "слышать ритм", "первые движения по слову"],
    lines: [
      { text: "Ладушки, ладушки!", seconds: 2.5, action: "Хлопаем в ладоши" },
      { text: "Где были? — У бабушки!", seconds: 3, action: "Разводим руки и снова хлопаем" },
      { text: "Что ели? — Кашку.", seconds: 2.5, action: "Подносим руку ко рту" },
      { text: "Что пили? — Бражку.", seconds: 2.5, action: "Изображаем питьё" },
      { text: "Кашка масленька,", seconds: 2.5, action: "Гладим себя по животику" },
      { text: "Бражка сладенька,", seconds: 2.5, action: "Облизываемся" },
      { text: "Бабушка добренька.", seconds: 2.5, action: "Обнимаем себя" },
      { text: "Попили, поели,", seconds: 2, action: "Хлопаем" },
      { text: "Шу-у-у — полетели!", seconds: 3, action: "Машем руками как крыльями" },
      { text: "На головку сели!", seconds: 3, action: "Прикладываем ладошки к голове" },
    ],
    parentTip: "Сажай малыша к себе на колени лицом, держи его ручки и хлопай ими в такт. Самая первая игра-потешка для детей с 6 месяцев.",
  },
  {
    id: "soroka-beloboka",
    title: "Сорока-белобока",
    author: "Русская народная потешка",
    authorNote: "Фольклор, общественное достояние",
    category: "potyashka",
    ages: ["1-3"],
    emoji: "🐦",
    color: "from-slate-400 to-zinc-500",
    tags: ["пальчики", "птицы", "счёт"],
    teaches: ["знакомство с пальчиками", "массаж ладони", "счёт до 5"],
    lines: [
      { text: "Сорока-белобока", seconds: 2.5, action: "Водим пальцем по ладошке малыша по кругу" },
      { text: "Кашку варила,", seconds: 2, action: "Продолжаем круговые движения" },
      { text: "Деток кормила.", seconds: 2 },
      { text: "Этому дала,", seconds: 2, action: "Загибаем большой палец" },
      { text: "Этому дала,", seconds: 2, action: "Загибаем указательный" },
      { text: "Этому дала,", seconds: 2, action: "Загибаем средний" },
      { text: "Этому дала,", seconds: 2, action: "Загибаем безымянный" },
      { text: "А этому — не дала!", seconds: 3, action: "Качаем мизинчик" },
      { text: "Ты дров не рубил,", seconds: 2.5 },
      { text: "Воды не носил,", seconds: 2.5 },
      { text: "Каши не варил —", seconds: 2.5 },
      { text: "Тебе ничего нет!", seconds: 3 },
    ],
    parentTip: "Бери ладошку малыша и води пальцем по кругу — это массаж активных точек. С 4-х месяцев. Развивает мелкую моторику и связь с речью.",
  },
  {
    id: "idyot-koza",
    title: "Идёт коза рогатая",
    author: "Русская народная потешка",
    authorNote: "Фольклор, общественное достояние",
    category: "potyashka",
    ages: ["1-3"],
    emoji: "🐐",
    color: "from-lime-400 to-green-500",
    tags: ["игра", "животные", "эмоции"],
    teaches: ["реакция на ритм", "первый смех от игры", "узнавание животного"],
    lines: [
      { text: "Идёт коза рогатая,", seconds: 3, action: "Показываем рожки пальцами" },
      { text: "Идёт коза бодатая.", seconds: 3, action: "Бодаем воздух пальчиками" },
      { text: "Ножками — топ-топ!", seconds: 3, action: "Топаем ножками" },
      { text: "Глазками — хлоп-хлоп!", seconds: 3, action: "Хлопаем глазками" },
      { text: "Кто кашу не ест,", seconds: 3 },
      { text: "Кто молоко не пьёт —", seconds: 3 },
      { text: "Того забодаю,", seconds: 3, action: "Грозим рожками" },
      { text: "Забодаю, забодаю!", seconds: 3, action: "Щекочем малыша" },
    ],
    parentTip: "На последних строчках щекочи малыша — это безопасный смех и тренировка дыхания. Идеально с 8 месяцев до 2,5 лет.",
  },
  {
    id: "vodichka",
    title: "Водичка, водичка",
    author: "Русская народная потешка",
    authorNote: "Фольклор, общественное достояние",
    category: "potyashka",
    ages: ["1-3"],
    emoji: "💧",
    color: "from-cyan-400 to-blue-500",
    tags: ["гигиена", "режим дня", "первые слова"],
    teaches: ["умывание без слёз", "называть части лица", "ритм слов"],
    lines: [
      { text: "Водичка, водичка,", seconds: 3, action: "Открываем кран, льём воду на ручки" },
      { text: "Умой моё личико,", seconds: 3, action: "Умываем лицо" },
      { text: "Чтобы глазки блестели,", seconds: 3, action: "Прикладываем пальчики к глазкам" },
      { text: "Чтобы щёчки краснели,", seconds: 3, action: "Гладим щёчки" },
      { text: "Чтоб смеялся роток,", seconds: 3, action: "Улыбаемся широко" },
      { text: "Чтоб кусался зубок!", seconds: 3, action: "Изображаем зубки" },
    ],
    parentTip: "Произноси потешку каждый раз во время умывания — у малыша сформируется приятный ритуал. Через 2 недели сам будет проситься умываться.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ПАЛЬЧИКОВЫЕ ИГРЫ
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "semya",
    title: "Этот пальчик — дедушка",
    author: "Русская народная потешка",
    authorNote: "Фольклор, общественное достояние",
    category: "finger",
    ages: ["1-3", "3-5"],
    emoji: "👨‍👩‍👧",
    color: "from-rose-400 to-pink-500",
    tags: ["семья", "пальчики", "счёт"],
    teaches: ["знание членов семьи", "счёт до 5", "сжимание-разжимание кулачка"],
    lines: [
      { text: "Этот пальчик — дедушка,", seconds: 3, action: "Показываем большой палец" },
      { text: "Этот пальчик — бабушка,", seconds: 3, action: "Показываем указательный" },
      { text: "Этот пальчик — папочка,", seconds: 3, action: "Показываем средний" },
      { text: "Этот пальчик — мамочка,", seconds: 3, action: "Показываем безымянный" },
      { text: "Этот пальчик — я.", seconds: 3, action: "Показываем мизинчик" },
      { text: "Вот и вся моя семья!", seconds: 4, action: "Сжимаем кулачок и потом раскрываем" },
    ],
    parentTip: "Сначала играй на ручке ребёнка, потом учи делать самому. Развивает моторику, готовит руку к письму. После — можно спрашивать «А где папа?» — пусть показывает пальчик.",
  },
  {
    id: "myshki",
    title: "Мышки в норке",
    author: "УЧИСЬПРО",
    authorNote: "Авторский текст методиста платформы",
    original: true,
    category: "finger",
    ages: ["1-3", "3-5"],
    emoji: "🐭",
    color: "from-zinc-400 to-stone-500",
    tags: ["животные", "счёт", "звуки"],
    teaches: ["счёт до 5", "звукоподражание", "сжимать-разжимать пальчики"],
    lines: [
      { text: "Одна мышка в норке спит,", seconds: 3, action: "Прячем большой палец в кулачок" },
      { text: "Две — на кухне «пи-пи-пи»,", seconds: 3, action: "Показываем 2 пальчика" },
      { text: "Три — на полочке сидят,", seconds: 3, action: "Показываем 3 пальчика" },
      { text: "Сыр большой они едят.", seconds: 3, action: "Имитируем грызение" },
      { text: "Вот четыре в коридоре,", seconds: 3, action: "Показываем 4 пальчика" },
      { text: "А вот пять — играют в море!", seconds: 4, action: "Показываем ладошку и волны" },
      { text: "Где же кошка? Кошка — спит!", seconds: 4, action: "Складываем ладошки под щёчку" },
    ],
    parentTip: "Прекрасное упражнение перед сном — расслабляет ребёнка. Можно завершать игру шёпотом, постепенно затихая.",
  },
  {
    id: "kapustka",
    title: "Мы капустку рубим-рубим",
    author: "Русская народная потешка",
    authorNote: "Фольклор, общественное достояние",
    category: "finger",
    ages: ["3-5", "5-7"],
    emoji: "🥬",
    color: "from-emerald-400 to-green-500",
    tags: ["движения", "овощи", "координация"],
    teaches: ["крупная моторика", "разные движения руками", "ритм"],
    lines: [
      { text: "Мы капустку рубим-рубим,", seconds: 3, action: "Рубим ребром ладони по столу" },
      { text: "Мы капустку солим-солим,", seconds: 3, action: "Перетираем пальчиками" },
      { text: "Мы капустку трём-трём,", seconds: 3, action: "Трём кулак о кулак" },
      { text: "Мы капустку жмём-жмём!", seconds: 3, action: "Сжимаем-разжимаем кулачки" },
    ],
    parentTip: "Заводная игра — отлично подходит перед обедом или для разрядки между занятиями. Чередуй медленно и быстро, чтобы тренировать переключение.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // АВТОРСКИЕ ПЕСЕНКИ УЧИСЬПРО (про машинки, зверят и т.д.)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "krasniy-traktor",
    title: "Красный трактор",
    author: "УЧИСЬПРО",
    authorNote: "Авторская песенка методиста платформы",
    original: true,
    category: "song",
    ages: ["1-3", "3-5"],
    emoji: "🚜",
    color: "from-red-500 to-rose-500",
    tags: ["транспорт", "цвета", "звуки"],
    teaches: ["узнавать трактор", "звук «тр-тр»", "красный цвет"],
    lines: [
      { text: "Едет, едет красный трактор:", seconds: 3.5, action: "Имитируем руль" },
      { text: "«Тр-тр-тр, тр-тр-тр!»", seconds: 3, action: "Произносим «тр-тр»" },
      { text: "По полям, через дорогу", seconds: 3.5 },
      { text: "Тащит он большой ковёр.", seconds: 3.5 },
      { text: "Громко песенку поёт,", seconds: 3 },
      { text: "Всех зверят с собой зовёт:", seconds: 3.5 },
      { text: "«Ехать в поле — не пешком,", seconds: 3.5 },
      { text: "А на тракторе моём!»", seconds: 3.5 },
      { text: "Зайка, мишка, лисонька —", seconds: 3.5, action: "Загибаем пальчики на каждого" },
      { text: "Все уселись рядышком.", seconds: 3.5 },
      { text: "Красный трактор тарахтит,", seconds: 3.5 },
      { text: "В поле к солнышку спешит!", seconds: 4 },
    ],
    parentTip: "Песенка про любимую детьми технику — трактор. Учим звук «тр-тр» (полезно для речи) и красный цвет. Можно катать игрушечный трактор по полу в такт.",
  },
  {
    id: "veselye-mashinki",
    title: "Весёлые машинки",
    author: "УЧИСЬПРО",
    authorNote: "Авторская песенка методиста платформы",
    original: true,
    category: "song",
    ages: ["1-3", "3-5"],
    emoji: "🚗",
    color: "from-blue-500 to-indigo-500",
    tags: ["транспорт", "цвета", "звуки"],
    teaches: ["звуки транспорта", "цвета", "запоминание видов транспорта"],
    lines: [
      { text: "Красная машинка едет —", seconds: 3.5, action: "Показываем красный" },
      { text: "«Би-би-би, би-би-би!»", seconds: 3, action: "Сигналим" },
      { text: "Синий автобус торопится —", seconds: 3.5, action: "Показываем синий" },
      { text: "«У-у-у, у-у-у!»", seconds: 3, action: "Гудим как автобус" },
      { text: "Жёлтый самосвал работает —", seconds: 3.5, action: "Показываем жёлтый" },
      { text: "«Др-др-др, др-др-др!»", seconds: 3 },
      { text: "А зелёный поезд мчится —", seconds: 3.5, action: "Показываем зелёный" },
      { text: "«Ту-ту-ту, ту-ту-ту!»", seconds: 3, action: "Изображаем гудок" },
      { text: "Все машинки едут в гараж —", seconds: 4, action: "Прижимаем кулачки к груди" },
      { text: "Отдыхать пора уже!", seconds: 4 },
    ],
    parentTip: "Идеально учить цвета + звуки транспорта в одной песенке. Можно использовать игрушечные машинки соответствующих цветов и подавать каждую по очереди.",
  },
  {
    id: "korovka",
    title: "Коровка Мурёнка",
    author: "УЧИСЬПРО",
    authorNote: "Авторская песенка методиста платформы",
    original: true,
    category: "song",
    ages: ["1-3", "3-5"],
    emoji: "🐮",
    color: "from-pink-400 to-rose-400",
    tags: ["животные", "ферма", "звуки"],
    teaches: ["звуки животных", "что даёт корова", "название «телёнок»"],
    lines: [
      { text: "На лугу пасётся коровка,", seconds: 3.5 },
      { text: "Её зовут Мурёнка.", seconds: 3, action: "Показываем рожки" },
      { text: "Говорит коровка: «Му-у-у!", seconds: 3.5, action: "Произносим «му-у»" },
      { text: "Молочка я вам несу!»", seconds: 3.5 },
      { text: "Рядом маленький телёнок,", seconds: 3.5 },
      { text: "Он совсем ещё ребёнок.", seconds: 3.5 },
      { text: "Тихо ходит «му-му-му»,", seconds: 3 },
      { text: "Молочка просит к нему.", seconds: 3.5 },
      { text: "Мама даст ему попить,", seconds: 3.5 },
      { text: "Будет он расти и жить!", seconds: 4 },
    ],
    parentTip: "Учим называть детёныша животного — это сложная тема для малышей. Также объясняем, откуда молоко в стакане. После песенки можно показать в холодильнике настоящее молоко.",
  },
  {
    id: "myach",
    title: "Прыг-скок мячик",
    author: "УЧИСЬПРО",
    authorNote: "Авторская песенка методиста платформы",
    original: true,
    category: "song",
    ages: ["1-3", "3-5"],
    emoji: "⚽",
    color: "from-orange-400 to-yellow-500",
    tags: ["движения", "координация", "цвета"],
    teaches: ["прыжки", "счёт прыжков", "глаголы движения"],
    lines: [
      { text: "Прыг и скок, прыг и скок —", seconds: 3, action: "Прыгаем на месте" },
      { text: "Это мячик-колобок!", seconds: 3.5 },
      { text: "Раз — подпрыгнул высоко,", seconds: 3.5, action: "Прыжок повыше" },
      { text: "Два — упал он далеко,", seconds: 3.5 },
      { text: "Три — катается по полу,", seconds: 3.5, action: "Кружимся" },
      { text: "А четыре — снова в гору!", seconds: 3.5 },
      { text: "Пять — поймали мы его,", seconds: 3.5, action: "Хлопаем в ладоши" },
      { text: "Положили на окно.", seconds: 3.5 },
    ],
    parentTip: "Активная песенка — подходит как физкультминутка. Прыгайте вместе с малышом, считайте прыжки вслух. Развивает крупную моторику и счёт.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // СТИХИ-СЧИТАЛОЧКИ
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "raz-dva",
    title: "Раз, два — острова",
    author: "УЧИСЬПРО",
    authorNote: "Авторская считалочка методиста платформы",
    original: true,
    category: "poem",
    ages: ["3-5", "5-7"],
    emoji: "🔢",
    color: "from-violet-500 to-purple-500",
    tags: ["счёт", "слова", "ритм"],
    teaches: ["счёт до 10", "ритм считалочки", "рифмованные слова"],
    lines: [
      { text: "Раз, два — острова.", seconds: 3 },
      { text: "Три, четыре — мы поплыли.", seconds: 3.5 },
      { text: "Пять, шесть — будем есть.", seconds: 3 },
      { text: "Семь, восемь — листья косим.", seconds: 3.5 },
      { text: "Девять, десять — деньги весят!", seconds: 4 },
      { text: "А кому водить — выходи!", seconds: 4 },
    ],
    parentTip: "Считалочка с пятилеткой — отличный способ потренировать счёт. Можно использовать перед любой игрой, чтобы выбрать ведущего.",
  },
  {
    id: "vesna-prishla",
    title: "Весна пришла",
    author: "УЧИСЬПРО",
    authorNote: "Авторский стих методиста платформы",
    original: true,
    category: "poem",
    ages: ["3-5", "5-7"],
    emoji: "🌷",
    color: "from-green-400 to-emerald-500",
    tags: ["природа", "времена года", "слова"],
    teaches: ["признаки весны", "новые слова", "сезонность"],
    lines: [
      { text: "Снег растаял на дорожке,", seconds: 3.5 },
      { text: "Зеленеют все берёзки.", seconds: 3.5 },
      { text: "Птички весело поют,", seconds: 3 },
      { text: "В небе ласточки снуют.", seconds: 3.5 },
      { text: "Солнышко всё ярче греет,", seconds: 3.5 },
      { text: "Травка под ногой пестреет.", seconds: 3.5 },
      { text: "Это значит — к нам опять", seconds: 3.5 },
      { text: "В гости к нам пришла весна!", seconds: 4 },
    ],
    parentTip: "Лучше всего читать весной во время прогулки — обращай внимание на каждую примету: «Смотри, снег растаял! Помнишь, как в песенке?»",
  },
  {
    id: "moy-rasporyadok",
    title: "Мой день",
    author: "УЧИСЬПРО",
    authorNote: "Авторский стих методиста платформы",
    original: true,
    category: "poem",
    ages: ["3-5", "5-7"],
    emoji: "⏰",
    color: "from-sky-400 to-cyan-500",
    tags: ["режим дня", "действия", "слова"],
    teaches: ["распорядок дня", "глаголы", "понимание времени"],
    lines: [
      { text: "Утром я встаю с кроватки,", seconds: 3.5, action: "Потягиваемся" },
      { text: "Делаю свою зарядку.", seconds: 3.5, action: "Машем руками" },
      { text: "Умываюсь, ем и пью,", seconds: 3.5 },
      { text: "Маму крепко обниму!", seconds: 3.5, action: "Обнимаемся" },
      { text: "В сад иду я не спеша,", seconds: 3.5 },
      { text: "Там — друзья и тишина.", seconds: 3.5 },
      { text: "Вечер — мама заберёт,", seconds: 3.5 },
      { text: "Дома — сказка меня ждёт!", seconds: 4 },
    ],
    parentTip: "Стих помогает запомнить и принять распорядок дня. Можно повторять перед садом или после, обсуждая что сегодня было.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // КОЛЫБЕЛЬНЫЕ
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "bayu-bayushki",
    title: "Баю-баюшки-баю",
    author: "Русская народная колыбельная",
    authorNote: "Фольклор, общественное достояние",
    category: "lullaby",
    ages: ["1-3", "3-5"],
    emoji: "🌙",
    color: "from-indigo-500 to-purple-600",
    tags: ["сон", "колыбельная", "успокоение"],
    teaches: ["засыпание", "ритуал сна", "спокойный голос мамы"],
    lines: [
      { text: "Баю-баюшки-баю,", seconds: 4 },
      { text: "Не ложися на краю.", seconds: 4 },
      { text: "Придёт серенький волчок,", seconds: 4 },
      { text: "Он ухватит за бочок.", seconds: 4 },
      { text: "Он ухватит за бочок", seconds: 4 },
      { text: "И утащит во лесок,", seconds: 4 },
      { text: "Под ракитовый кусток.", seconds: 5 },
      { text: "К нам, волчок, не ходи,", seconds: 4 },
      { text: "Нашу детку не буди.", seconds: 5 },
    ],
    parentTip: "Самая известная русская колыбельная. Пой тихо, медленно, монотонно — голос должен «убаюкивать», смысл слов не важен. Идеально 5-7 минут перед сном.",
  },
  {
    id: "spat-pora",
    title: "Спать пора, малыш",
    author: "УЧИСЬПРО",
    authorNote: "Авторская колыбельная методиста платформы",
    original: true,
    category: "lullaby",
    ages: ["1-3", "3-5"],
    emoji: "💤",
    color: "from-slate-600 to-indigo-800",
    tags: ["сон", "колыбельная", "ритуал"],
    teaches: ["ритуал сна", "спокойствие", "переключение на ночь"],
    lines: [
      { text: "Тише, тише, ночь идёт,", seconds: 4 },
      { text: "Месяц по небу плывёт.", seconds: 4 },
      { text: "Все игрушки спать легли,", seconds: 4 },
      { text: "Зайки, мишки и слоны.", seconds: 4 },
      { text: "Тише, тише, спит трава,", seconds: 4 },
      { text: "Спит цветочек и звезда.", seconds: 4 },
      { text: "Засыпай скорей, малыш,", seconds: 4 },
      { text: "В уютной кроватке спишь.", seconds: 5 },
      { text: "Завтра солнышко взойдёт —", seconds: 4 },
      { text: "Новый день к нам в гости ждёт!", seconds: 5 },
    ],
    parentTip: "Современная мягкая колыбельная. Перечисление «всё спит» помогает ребёнку отпустить день и заснуть. Используй как часть ритуала: ванна → песенка → сон.",
  },
  {
    id: "pryg-skok-gribok",
    title: "Прыг-скок грибок",
    author: "УЧИСЬПРО",
    authorNote: "Оригинальная песня УЧИСЬПРО",
    category: "song",
    ages: ["3-5"],
    emoji: "🍄",
    color: "from-rose-400 to-red-500",
    tags: ["природа", "движения", "весёлая"],
    teaches: ["двигаться под музыку", "слушать ритм", "весёлое настроение"],
    lines: [
      { text: "Прыг-скок, прыг-скок — вырос в лесу грибок!", seconds: 6 },
      { text: "Слушай песенку и подпевай вместе с нами.", seconds: 6 },
    ],
    parentTip: "Включи песенку и попрыгайте вместе с малышом на месте в такт музыке — «как грибочек растёт». Отлично подходит для весёлой зарядки.",
    original: true,
    audioUrl:
      "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/bucket/songs/vocal-pryg-skok-gribok.mp3",
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export function filterSongs(
  category: SongCategory | "all",
  age: SongAge | "all",
): Song[] {
  return SONGS.filter((s) => {
    if (category !== "all" && s.category !== category) return false;
    if (age !== "all" && !s.ages.includes(age)) return false;
    return true;
  });
}

export function getSongById(id: string): Song | undefined {
  return SONGS.find((s) => s.id === id);
}

export function getTotalSongDuration(song: Song): number {
  return song.lines.reduce((sum, l) => sum + (l.seconds || 3), 0);
}