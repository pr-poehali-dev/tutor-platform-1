export const SILENT_AVATAR =
  "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/4fe00778-451f-4db1-bd0d-c14a2fed3078.jpg";

export const SILENT_COVER =
  "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/1789a20a-a76e-4832-a420-68053cf23338.jpg";

/** Реплика аватара-помощника: короткий текст + эмодзи-жест + подсказка-настроение. */
export interface AvatarLine {
  text: string;
  emoji: string;
  mood: "hello" | "point" | "cheer" | "think" | "bye";
}

/** Шаг урока: визуальный слайд с крупными субтитрами и репликой помощника. */
export interface LessonStep {
  id: number;
  /** Крупный заголовок-субтитр (то, что «говорится», текстом). */
  caption: string;
  /** Пояснение простыми словами. */
  detail: string;
  /** Эмодзи/пиктограмма для визуальной опоры. */
  visual: string;
  /** Реплика аватара-помощника (мотиватор/навигатор). */
  avatar: AvatarLine;
  /** Плейсхолдер под будущее РЖЯ-видео носителя языка. */
  signVideo?: boolean;
}

export interface Lesson {
  slug: string;
  title: string;
  subtitle: string;
  steps: LessonStep[];
}

export const DEMO_LESSON: Lesson = {
  slug: "privetstvie",
  title: "Урок 1. Знакомимся и здороваемся",
  subtitle: "Первые слова, которые пригодятся каждый день",
  steps: [
    {
      id: 1,
      caption: "Привет!",
      detail: "Так мы здороваемся, когда встречаем друга или заходим в класс.",
      visual: "👋",
      avatar: {
        text: "Привет! Я твой помощник. Мы будем учиться вместе — не спеши, всё получится.",
        emoji: "👋",
        mood: "hello",
      },
      signVideo: true,
    },
    {
      id: 2,
      caption: "Меня зовут…",
      detail: "Этими словами мы называем своё имя, когда знакомимся с новым человеком.",
      visual: "🙋",
      avatar: {
        text: "Смотри на картинку и на слова. Читай спокойно — картинка помогает понять смысл.",
        emoji: "👀",
        mood: "point",
      },
      signVideo: true,
    },
    {
      id: 3,
      caption: "Спасибо",
      detail: "Мы говорим это слово, когда нам помогли или подарили что-то приятное.",
      visual: "🙏",
      avatar: {
        text: "Отлично идёшь! «Спасибо» — очень важное и доброе слово.",
        emoji: "⭐",
        mood: "cheer",
      },
      signVideo: true,
    },
    {
      id: 4,
      caption: "Как тебя зовут?",
      detail: "Так мы спрашиваем имя у нового друга. Это вопрос — в конце стоит «?».",
      visual: "❓",
      avatar: {
        text: "Подумай: как бы ты ответил на этот вопрос? Проговори про себя своё имя.",
        emoji: "💭",
        mood: "think",
      },
      signVideo: false,
    },
    {
      id: 5,
      caption: "До свидания!",
      detail: "Этими словами мы прощаемся, когда уходим домой или заканчиваем урок.",
      visual: "🖐️",
      avatar: {
        text: "Ты молодец! Первый урок пройден. Возвращайся — дальше будет ещё интереснее!",
        emoji: "🎉",
        mood: "bye",
      },
      signVideo: true,
    },
  ],
};

export const COLORS_LESSON: Lesson = {
  slug: "cveta",
  title: "Урок 2. Учим цвета",
  subtitle: "Четыре главных цвета вокруг нас",
  steps: [
    {
      id: 1,
      caption: "Цвет",
      detail: "Цвет — это то, каким мы видим предмет. Небо, трава, солнце — у всего свой цвет.",
      visual: "🎨",
      avatar: {
        text: "Снова привет! Сегодня учим цвета. Смотри на кружок — его цвет и есть подсказка.",
        emoji: "🌈",
        mood: "hello",
      },
      signVideo: true,
    },
    {
      id: 2,
      caption: "Красный",
      detail: "Красный — цвет клубники, помидора и пожарной машины.",
      visual: "🔴",
      avatar: {
        text: "Красный — яркий и тёплый. Найди вокруг себя что-нибудь красное!",
        emoji: "👀",
        mood: "point",
      },
      signVideo: true,
    },
    {
      id: 3,
      caption: "Жёлтый",
      detail: "Жёлтый — цвет солнышка, банана и цыплёнка.",
      visual: "🟡",
      avatar: {
        text: "Жёлтый — солнечный и весёлый. У тебя отлично получается!",
        emoji: "⭐",
        mood: "cheer",
      },
      signVideo: true,
    },
    {
      id: 4,
      caption: "Зелёный",
      detail: "Зелёный — цвет травы, листьев и огурца.",
      visual: "🟢",
      avatar: {
        text: "Подумай: что ещё бывает зелёным? Ёлка, лягушка, яблоко…",
        emoji: "💭",
        mood: "think",
      },
      signVideo: true,
    },
    {
      id: 5,
      caption: "Синий",
      detail: "Синий — цвет неба, моря и воды.",
      visual: "🔵",
      avatar: {
        text: "Ты выучил четыре цвета! Ты большой молодец. До новой встречи!",
        emoji: "🎉",
        mood: "bye",
      },
      signVideo: true,
    },
  ],
};

export const FAMILY_LESSON: Lesson = {
  slug: "semya",
  title: "Урок 3. Моя семья",
  subtitle: "Самые близкие люди рядом с нами",
  steps: [
    { id: 1, caption: "Семья", detail: "Семья — это самые близкие люди, которые любят и заботятся о тебе.", visual: "👨‍👩‍👧‍👦", avatar: { text: "Сегодня учим слова про семью. Это самые тёплые слова!", emoji: "❤️", mood: "hello" }, signVideo: true },
    { id: 2, caption: "Мама", detail: "Мама — самый родной человек, который всегда рядом.", visual: "👩", avatar: { text: "Мама — очень доброе слово. Покажи жест вместе со мной.", emoji: "🤗", mood: "point" }, signVideo: true },
    { id: 3, caption: "Папа", detail: "Папа — сильный и заботливый, он тоже очень любит тебя.", visual: "👨", avatar: { text: "Отлично! Папа — надёжный и добрый.", emoji: "⭐", mood: "cheer" }, signVideo: true },
    { id: 4, caption: "Бабушка", detail: "Бабушка — мама твоей мамы или папы. С ней тепло и уютно.", visual: "👵", avatar: { text: "Подумай: как ты покажешь «бабушка»?", emoji: "💭", mood: "think" }, signVideo: true },
    { id: 5, caption: "Дедушка", detail: "Дедушка — папа твоей мамы или папы. Он много знает и любит рассказывать.", visual: "👴", avatar: { text: "Ты выучил всю семью! Ты большой молодец!", emoji: "🎉", mood: "bye" }, signVideo: true },
  ],
};

export const NUMBERS_LESSON: Lesson = {
  slug: "cifry",
  title: "Урок 4. Считаем от 1 до 5",
  subtitle: "Первые цифры на пальцах",
  steps: [
    { id: 1, caption: "Один", detail: "Один — это когда предмет всего один. Подними один палец.", visual: "1️⃣", avatar: { text: "Учимся считать! Показывай цифры на пальцах вместе со мной.", emoji: "✋", mood: "hello" }, signVideo: true },
    { id: 2, caption: "Два", detail: "Два — это пара. Например, два глаза или две руки.", visual: "2️⃣", avatar: { text: "Два пальца — отлично!", emoji: "👀", mood: "point" }, signVideo: true },
    { id: 3, caption: "Три", detail: "Три — это на один больше, чем два.", visual: "3️⃣", avatar: { text: "Здорово получается!", emoji: "⭐", mood: "cheer" }, signVideo: true },
    { id: 4, caption: "Четыре", detail: "Четыре пальца — почти вся ладонь.", visual: "4️⃣", avatar: { text: "Сколько пальцев осталось до пяти? Подумай!", emoji: "💭", mood: "think" }, signVideo: true },
    { id: 5, caption: "Пять", detail: "Пять — это вся ладонь целиком. Ты сосчитал до пяти!", visual: "5️⃣", avatar: { text: "Ты умеешь считать до пяти! Молодец!", emoji: "🎉", mood: "bye" }, signVideo: true },
  ],
};

export const ANIMALS_LESSON: Lesson = {
  slug: "zhivotnye",
  title: "Урок 5. Животные",
  subtitle: "Кто живёт рядом с нами",
  steps: [
    { id: 1, caption: "Кошка", detail: "Кошка — мягкая и пушистая, говорит «мяу».", visual: "🐱", avatar: { text: "Сегодня учим животных! Начнём с кошки.", emoji: "🐾", mood: "hello" }, signVideo: true },
    { id: 2, caption: "Собака", detail: "Собака — верный друг, она виляет хвостом.", visual: "🐶", avatar: { text: "Собака — добрый друг человека!", emoji: "👀", mood: "point" }, signVideo: true },
    { id: 3, caption: "Птица", detail: "Птица умеет летать и петь. У неё есть клюв и крылья.", visual: "🐦", avatar: { text: "Как красиво летают птицы! Молодец.", emoji: "⭐", mood: "cheer" }, signVideo: true },
    { id: 4, caption: "Рыба", detail: "Рыба живёт в воде и умеет плавать.", visual: "🐟", avatar: { text: "Подумай: где живёт рыба?", emoji: "💭", mood: "think" }, signVideo: true },
    { id: 5, caption: "Медведь", detail: "Медведь большой и сильный, живёт в лесу.", visual: "🐻", avatar: { text: "Ты выучил пять животных! Отлично!", emoji: "🎉", mood: "bye" }, signVideo: true },
  ],
};

export const FOOD_LESSON: Lesson = {
  slug: "eda",
  title: "Урок 6. Еда и напитки",
  subtitle: "Что мы едим и пьём каждый день",
  steps: [
    { id: 1, caption: "Еда", detail: "Еда даёт нам силы. Мы едим, когда хотим кушать.", visual: "🍽️", avatar: { text: "Сегодня про еду. Это важные и вкусные слова!", emoji: "😋", mood: "hello" }, signVideo: true },
    { id: 2, caption: "Вода", detail: "Воду мы пьём, когда хотим пить. Без воды нельзя.", visual: "💧", avatar: { text: "Вода очень нужна каждому!", emoji: "👀", mood: "point" }, signVideo: true },
    { id: 3, caption: "Хлеб", detail: "Хлеб — мягкий и вкусный, его едят почти каждый день.", visual: "🍞", avatar: { text: "Хлеб — всему голова. Здорово!", emoji: "⭐", mood: "cheer" }, signVideo: true },
    { id: 4, caption: "Молоко", detail: "Молоко белое и полезное, его любят дети.", visual: "🥛", avatar: { text: "Подумай: какого цвета молоко?", emoji: "💭", mood: "think" }, signVideo: true },
    { id: 5, caption: "Яблоко", detail: "Яблоко — сладкий и сочный фрукт.", visual: "🍎", avatar: { text: "Ты выучил слова про еду! Молодец!", emoji: "🎉", mood: "bye" }, signVideo: true },
  ],
};

export const EMOTIONS_LESSON: Lesson = {
  slug: "emocii",
  title: "Урок 7. Наши чувства",
  subtitle: "Как мы себя чувствуем",
  steps: [
    { id: 1, caption: "Радость", detail: "Радость — когда весело и хорошо. Мы улыбаемся.", visual: "😀", avatar: { text: "Сегодня про чувства. Смотри и на лицо тоже — оно важно!", emoji: "😊", mood: "hello" }, signVideo: true },
    { id: 2, caption: "Грусть", detail: "Грусть — когда немного печально. Так бывает, и это нормально.", visual: "😢", avatar: { text: "Иногда грустно — и это тоже нормально.", emoji: "👀", mood: "point" }, signVideo: true },
    { id: 3, caption: "Страх", detail: "Страх — когда что-то пугает. Тогда можно попросить помощи.", visual: "😨", avatar: { text: "Если страшно — рядом всегда есть взрослый. Молодец!", emoji: "⭐", mood: "cheer" }, signVideo: true },
    { id: 4, caption: "Злость", detail: "Злость — когда что-то очень не нравится. Её можно спокойно выразить.", visual: "😠", avatar: { text: "Подумай: что помогает успокоиться, когда злишься?", emoji: "💭", mood: "think" }, signVideo: true },
    { id: 5, caption: "Любовь", detail: "Любовь — самое тёплое чувство к близким людям.", visual: "❤️", avatar: { text: "Любовь — самое доброе чувство. Ты справился!", emoji: "🎉", mood: "bye" }, signVideo: true },
  ],
};

export const POLITE_LESSON: Lesson = {
  slug: "vezhlivye-slova",
  title: "Урок 8. Вежливые слова",
  subtitle: "Слова, которые помогают дружить",
  steps: [
    { id: 1, caption: "Пожалуйста", detail: "«Пожалуйста» говорят, когда о чём-то просят.", visual: "🙏", avatar: { text: "Учим вежливые слова — с ними приятно общаться!", emoji: "😊", mood: "hello" }, signVideo: true },
    { id: 2, caption: "Извини", detail: "«Извини» говорят, когда нечаянно кого-то обидели.", visual: "🤝", avatar: { text: "Уметь извиняться — очень важно и по-доброму.", emoji: "👀", mood: "point" }, signVideo: true },
    { id: 3, caption: "Да", detail: "«Да» — когда мы соглашаемся.", visual: "✅", avatar: { text: "Отлично! «Да» — простой и важный жест.", emoji: "⭐", mood: "cheer" }, signVideo: true },
    { id: 4, caption: "Нет", detail: "«Нет» — когда мы не соглашаемся. Отказывать тоже можно вежливо.", visual: "❌", avatar: { text: "Подумай: как вежливо сказать «нет»?", emoji: "💭", mood: "think" }, signVideo: true },
    { id: 5, caption: "Помоги", detail: "«Помоги» говорят, когда нужна помощь. Просить помощь — это нормально.", visual: "🆘", avatar: { text: "Ты выучил вежливые слова! Ты настоящий молодец!", emoji: "🎉", mood: "bye" }, signVideo: true },
  ],
};

/** Все уроки курса по порядку. */
export const LESSONS: Lesson[] = [
  DEMO_LESSON,
  COLORS_LESSON,
  FAMILY_LESSON,
  NUMBERS_LESSON,
  ANIMALS_LESSON,
  FOOD_LESSON,
  EMOTIONS_LESSON,
  POLITE_LESSON,
];

/** Найти урок по slug (или первый по умолчанию). */
export function findLesson(slug?: string): Lesson {
  if (!slug) return LESSONS[0];
  return LESSONS.find((l) => l.slug === slug) || LESSONS[0];
}

export const COURSE_FEATURES = [
  {
    icon: "Captions",
    title: "Полные субтитры",
    text: "Каждое слово и подсказка — крупным понятным текстом. Ничего не нужно слушать.",
  },
  {
    icon: "Eye",
    title: "Визуальная подача",
    text: "Картинки, пиктограммы и цвета помогают понять смысл без звука.",
  },
  {
    icon: "Sparkles",
    title: "Аватар-помощник",
    text: "Добрый персонаж ведёт по уроку, подбадривает и подсказывает, что делать дальше.",
  },
  {
    icon: "Hand",
    title: "РЖЯ-видео (скоро)",
    text: "К ключевым урокам добавим видео на русском жестовом языке с носителем языка.",
  },
];

export const COURSE_FAQ = [
  {
    q: "Это бесплатно?",
    a: "Да. Пилотный курс полностью бесплатный — мы делаем его как социальный проект и хотим, чтобы обучение было доступно каждому ребёнку.",
  },
  {
    q: "Нужно ли включать звук?",
    a: "Нет. Курс построен так, что звук не нужен вообще: всё дублируется крупным текстом и картинками.",
  },
  {
    q: "Что такое РЖЯ-видео?",
    a: "Русский жестовый язык — это отдельный язык глухих. К ключевым урокам мы добавим видео, где носитель языка показывает материал жестами. Сейчас идёт запись с участием сообщества.",
  },
  {
    q: "Для какого возраста курс?",
    a: "Пилот рассчитан на младших школьников, но подойдёт всем, кто начинает знакомиться с материалом. Темп — свой, без спешки.",
  },
];