/**
 * Сборка карты сайта — общий модуль.
 *
 * Тот же код используют два потребителя:
 *   • api/sitemap.ts        — edge-функция (когда хостинг умеет функции);
 *   • vite.config.ts плагин — запись dist/sitemap.xml на этапе сборки.
 *
 * Зачем оба. Сайт раздаётся как статика, функции из /api не поднимаются,
 * поэтому /sitemap.xml отвечал 404 — при том что robots.txt на него прямо
 * ссылается. Для поиска это значит: карты нет, обходим сайт наугад по
 * ссылкам. Файл в сборке закрывает дыру и работает на любом хостинге,
 * а функция остаётся как более свежий вариант там, где она доступна.
 */

import { COURSES } from "../src/components/courses/coursesData";
import { courseUrl } from "../src/components/courses/courseSlug";
import { GRADE_LANDINGS } from "../src/components/tutor/gradeLandingData";
import { SUBJECT_TUTORS } from "../src/components/tutor/subjectTutorData";
import { SUBJECTS_SEO } from "../src/components/courses/subjectsSeo";
import { SIGN_LIBRARY } from "../src/components/silent/signLibrary";
import { LESSONS as SILENT_LESSONS } from "../src/components/silent/silentCourseData";
import { DRAW_LESSONS } from "../src/components/draw/drawData";
import { AGES } from "../src/components/kids/kidsData";
import { KIDS_TOPICS } from "../src/components/kids/kidsTopicData";
import { LIBRARY } from "../src/components/kids/libraryData";
import { KIDS_GAMES } from "../src/components/kids/games/gamesData";
import { MY_RUSSIA } from "../src/components/kids/myRussiaData";

export const SITE = "https://учисьпро.рф";
const FEED_API =
  "https://functions.poehali.dev/b9f58dbe-702c-46d3-a9b1-02d5076735ef";

export interface Entry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

/** Постоянные разделы сайта. Ленту добавляем отдельно — она живая. */
const STATIC: Entry[] = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/courses", changefreq: "daily", priority: "0.9" },
  { loc: "/pricing", changefreq: "weekly", priority: "0.9" },
  { loc: "/kursy-dlya-vzroslyh", changefreq: "weekly", priority: "0.9" },
  { loc: "/order", changefreq: "monthly", priority: "0.7" },
  { loc: "/free-courses", changefreq: "weekly", priority: "0.8" },
  { loc: "/super-courses", changefreq: "weekly", priority: "0.8" },
  { loc: "/mini-course", changefreq: "weekly", priority: "0.9" },
  // Главные точки входа из поиска — приоритет наравне с каталогом.
  { loc: "/zarabotok-na-neirosetyah", changefreq: "weekly", priority: "1.0" },
  { loc: "/internet-marketing-s-nulya", changefreq: "weekly", priority: "1.0" },
  { loc: "/kadrovye-dokumenty-proverka", changefreq: "weekly", priority: "1.0" },
  { loc: "/feed", changefreq: "daily", priority: "0.9" },
  { loc: "/business-2026", changefreq: "weekly", priority: "0.9" },
  { loc: "/exam-bank", changefreq: "weekly", priority: "0.9" },
  { loc: "/exam-checklist", changefreq: "monthly", priority: "0.7" },
  { loc: "/score-calculator", changefreq: "monthly", priority: "0.8" },
  { loc: "/homework", changefreq: "weekly", priority: "0.8" },
  { loc: "/math-problems", changefreq: "weekly", priority: "0.8" },
  { loc: "/biology-problems", changefreq: "weekly", priority: "0.8" },
  { loc: "/chemistry-problems", changefreq: "weekly", priority: "0.8" },
  { loc: "/tutor", changefreq: "weekly", priority: "0.8" },
  { loc: "/graduate", changefreq: "weekly", priority: "0.8" },
  { loc: "/graduates", changefreq: "monthly", priority: "0.7" },
  { loc: "/mgu-track", changefreq: "monthly", priority: "0.7" },
  { loc: "/writing-craft", changefreq: "monthly", priority: "0.7" },
  { loc: "/know-yourself", changefreq: "monthly", priority: "0.7" },
  { loc: "/psychology", changefreq: "monthly", priority: "0.7" },
  { loc: "/klinicheskiy-psiholog", changefreq: "monthly", priority: "0.7" },
  { loc: "/nlp-master", changefreq: "monthly", priority: "0.7" },
  { loc: "/personal-brand", changefreq: "monthly", priority: "0.7" },
  { loc: "/expert-content", changefreq: "monthly", priority: "0.7" },
  { loc: "/remote-professions", changefreq: "monthly", priority: "0.7" },
  { loc: "/career-pro", changefreq: "monthly", priority: "0.7" },
  { loc: "/business-coach", changefreq: "monthly", priority: "0.7" },
  { loc: "/fin-advisor", changefreq: "monthly", priority: "0.7" },
  { loc: "/bizlab", changefreq: "weekly", priority: "0.8" },
  { loc: "/biz-report", changefreq: "weekly", priority: "0.9" },
  { loc: "/for-managers", changefreq: "weekly", priority: "0.9" },
  { loc: "/instrumenty-rukovoditelya", changefreq: "monthly", priority: "0.8" },
  { loc: "/orchestrator", changefreq: "weekly", priority: "1.0" },
  { loc: "/ai-assistant", changefreq: "monthly", priority: "0.7" },
  { loc: "/ai-persona", changefreq: "monthly", priority: "0.7" },
  { loc: "/tech-trends", changefreq: "monthly", priority: "0.7" },
  { loc: "/intensive", changefreq: "monthly", priority: "0.7" },
  { loc: "/for-business", changefreq: "weekly", priority: "0.8" },
  { loc: "/for-schools", changefreq: "monthly", priority: "0.7" },
  { loc: "/corporate", changefreq: "monthly", priority: "0.7" },
  { loc: "/partners", changefreq: "monthly", priority: "0.7" },
  { loc: "/edtech-jobs", changefreq: "monthly", priority: "0.6" },
  { loc: "/school-builder", changefreq: "weekly", priority: "1.0" },
  { loc: "/repetitoram", changefreq: "weekly", priority: "0.9" },
  { loc: "/grants", changefreq: "weekly", priority: "0.8" },
  { loc: "/draw", changefreq: "monthly", priority: "0.7" },
  { loc: "/silent", changefreq: "monthly", priority: "0.7" },
  { loc: "/dictionary", changefreq: "monthly", priority: "0.7" },
  { loc: "/olympiad", changefreq: "monthly", priority: "0.7" },
  { loc: "/znaika", changefreq: "monthly", priority: "0.7" },
  { loc: "/kids", changefreq: "weekly", priority: "0.9" },
  { loc: "/kids/about", changefreq: "monthly", priority: "0.7" },
  { loc: "/kids/test", changefreq: "monthly", priority: "0.8" },
  { loc: "/kids/library", changefreq: "weekly", priority: "0.8" },
  { loc: "/kids/songs", changefreq: "weekly", priority: "0.8" },
  { loc: "/kids/poznavashka", changefreq: "weekly", priority: "0.8" },
  { loc: "/kids/reading", changefreq: "weekly", priority: "0.8" },
  { loc: "/kids/games", changefreq: "weekly", priority: "0.8" },
  { loc: "/kids/my-russia", changefreq: "weekly", priority: "0.8" },
  { loc: "/app", changefreq: "monthly", priority: "0.7" },
  { loc: "/reviews", changefreq: "weekly", priority: "0.7" },
  { loc: "/help", changefreq: "monthly", priority: "0.6" },
  { loc: "/contacts", changefreq: "monthly", priority: "0.6" },
  { loc: "/referral", changefreq: "monthly", priority: "0.6" },
  { loc: "/search", changefreq: "monthly", priority: "0.5" },
];

/**
 * Предметные лендинги каталога.
 *
 * Список берём прямо из SUBJECTS_SEO — источника, по которому эти страницы
 * и рисуются. Раньше 35 слагов были переписаны вторым списком руками:
 * два списка неизбежно расходятся, и новый предмет либо не попадал в карту
 * (страница есть, робот её не видит), либо попадал раньше страницы —
 * тогда карта вела на 404.
 */
const SUBJECTS = SUBJECTS_SEO.map((s) => s.slug);

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function urlTag(e: Entry, today: string): string {
  return `  <url>
    <loc>${esc(SITE + e.loc)}</loc>
    <lastmod>${e.lastmod || today}</lastmod>
    <changefreq>${e.changefreq || "monthly"}</changefreq>
    <priority>${e.priority || "0.7"}</priority>
  </url>`;
}

/** Разделы и страницы, которые полностью описаны кодом проекта. */
export function staticEntries(): Entry[] {
  return [
    ...STATIC,
    ...SUBJECTS.map((s) => ({
      loc: `/courses/${s}`,
      changefreq: "weekly",
      priority: "0.8",
    })),
    // Витрины курсов — берём из того же каталога, что и сайт, чтобы адреса
    // не расходились с реальными при добавлении или переименовании курса.
    ...COURSES.map((c) => ({
      loc: courseUrl(c),
      changefreq: "weekly",
      priority: c.grade === "adult" ? "0.9" : "0.8",
    })),

    // Динамические разделы. Списки берём из тех же данных, по которым
    // страницы рисуются, — карта не может разойтись с сайтом.
    ...GRADE_LANDINGS.map((g) => ({
      loc: `/repetitor/${g.grade}-klass`,
      changefreq: "monthly",
      priority: "0.8",
    })),
    ...SUBJECT_TUTORS.map((s) => ({
      loc: `/repetitor-online/${s.slug}`,
      changefreq: "monthly",
      priority: "0.8",
    })),
    // Ключи словаря кириллические — обязательно кодируем для валидного XML.
    ...Object.keys(SIGN_LIBRARY).map((k) => ({
      loc: `/dictionary/${encodeURIComponent(k)}`,
      changefreq: "monthly",
      priority: "0.6",
    })),
    ...SILENT_LESSONS.map((l) => ({
      loc: `/silent/lesson/${l.slug}`,
      changefreq: "monthly",
      priority: "0.7",
    })),
    ...DRAW_LESSONS.map((l) => ({
      loc: `/draw/${l.id}`,
      changefreq: "monthly",
      priority: "0.7",
    })),
    ...AGES.map((a) => ({
      loc: `/kids/${a.slug}`,
      changefreq: "weekly",
      priority: "0.8",
    })),
    ...KIDS_TOPICS.map((t) => ({
      loc: `/kids/vopros/${t.slug}`,
      changefreq: "monthly",
      priority: "0.8",
    })),
    ...LIBRARY.map((i) => ({
      loc: `/kids/library/${i.id}`,
      changefreq: "monthly",
      priority: "0.7",
    })),
    ...KIDS_GAMES.map((g) => ({
      loc: `/kids/games/${g.slug}`,
      changefreq: "monthly",
      priority: "0.7",
    })),
    ...MY_RUSSIA.map((i) => ({
      loc: `/kids/my-russia/${i.id}`,
      changefreq: "monthly",
      priority: "0.7",
    })),
  ];
}

/** Все опубликованные статьи Ленты — постранично, пока не кончатся. */
export async function fetchArticles(): Promise<Entry[]> {
  const out: Entry[] = [];
  const seen = new Set<string>();
  // Лента растёт каждый день. Лимит в 40 страниц был рассчитан на то, что
  // бэкенд отдаёт по 50 статей за раз, а он отдавал по 12 — то есть карта
  // обрывалась на 480 статьях. Запас берём с большим потолком и выходим
  // по фактическому признаку конца (has_more / пустая страница).
  for (let page = 1; page <= 200; page++) {
    const res = await fetch(`${FEED_API}?page=${page}&limit=50`);
    if (!res.ok) break;
    const data = await res.json();
    const items = data?.items || [];
    if (!items.length) break;
    for (const a of items) {
      if (!a?.slug || seen.has(a.slug)) continue;
      // Короткие заметки в карту не кладём. Страница статьи помечает такие
      // адреса noindex (см. FeedArticle.tsx), и звать на них робота — значит
      // самим себе создавать конфликт: карта говорит «индексируй», страница
      // отвечает «не надо». Объём определяем по времени чтения: оно
      // пересчитано от фактического текста, минута ≈ 1000 знаков.
      if ((a.reading_time_min || 0) < 2) continue;
      seen.add(a.slug);
      out.push({
        loc: `/feed/${a.slug}`,
        lastmod: (a.published_at || a.created_at || "").slice(0, 10) || undefined,
        changefreq: "monthly",
        priority: "0.7",
      });
    }
    if (!data?.has_more) break;
  }
  return out;
}

/** Готовый XML карты. Один и тот же результат для функции и для сборки. */
export function buildXml(entries: Entry[]): string {
  const today = new Date().toISOString().slice(0, 10);
  // Один адрес мог прийти из двух источников (например, статья и раздел) —
  // повтор <loc> делает карту невалидной, поэтому схлопываем по адресу.
  const unique = new Map<string, Entry>();
  for (const e of entries) if (!unique.has(e.loc)) unique.set(e.loc, e);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...unique.values()].map((e) => urlTag(e, today)).join("\n")}
</urlset>`;
}
