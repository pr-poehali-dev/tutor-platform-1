import { createFileRoute } from "@tanstack/react-router";
import SpyLanguage from "@/pages/SpyLanguage";

const TITLE = "Иностранный язык за 30 дней: ядро 1000 слов по методике ускоренной подготовки";
const DESCRIPTION =
  "Интенсив на 30 дней: 1000 самых частотных слов, интервальные повторения, ежедневный зачёт и ИИ-инструктор. 8 языков: английский, немецкий, французский, испанский, итальянский, китайский, турецкий, арабский.";
const OG =
  "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/d435b2a2-944d-4162-9a6c-791ad982d397.jpg";

export const Route = createFileRoute("/yazyk-za-30-dney")({
  head: () => ({
    meta: [
      { title: `${TITLE} · УЧИСЬПРО` },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: OG },
    ],
    links: [{ rel: "canonical", href: "https://учисьпро.рф/yazyk-za-30-dney" }],
  }),
  component: SpyLanguage,
});
