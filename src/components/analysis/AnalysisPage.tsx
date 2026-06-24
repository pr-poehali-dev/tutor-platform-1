import { useEffect, useRef, useState } from "react";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import { AnalysisData, ANALYSIS_SECTIONS } from "./types";
import AnalysisHero, { AnalysisSidebar } from "./AnalysisHero";
import AnalysisContent from "./AnalysisContent";

export default function AnalysisPage({ data }: { data: AnalysisData }) {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState<string>("about");
  const [tocOpen, setTocOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const onScroll = () => {
      const el = contentRef.current;
      if (!el) return;
      const total = el.scrollHeight - window.innerHeight;
      const scrolled = Math.min(1, Math.max(0, window.scrollY / (total || 1)));
      setProgress(scrolled * 100);

      let current = ANALYSIS_SECTIONS[0].id;
      for (const s of ANALYSIS_SECTIONS) {
        const node = document.getElementById(s.id);
        if (node && node.getBoundingClientRect().top <= 140) current = s.id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setTocOpen(false);
    const node = document.getElementById(id);
    if (node) {
      const y = node.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `«${data.title}» ${data.author} — полный разбор произведения`,
      description: data.jsonLdDescription,
      datePublished: data.datePublished,
      author: { "@type": "Organization", name: "УЧИСЬПРО" },
      publisher: {
        "@type": "Organization",
        name: "УЧИСЬПРО",
        logo: {
          "@type": "ImageObject",
          url: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/17bc9252-13b8-4e83-af00-e904346aa5a9.jpg",
        },
      },
      image: data.cover ? [data.cover] : undefined,
      url: data.canonical,
      mainEntityOfPage: { "@type": "WebPage", "@id": data.canonical },
      inLanguage: "ru",
      articleSection: "Разборы произведений",
      keywords: `${data.title}, ${data.author}, разбор, анализ, краткое содержание, характеристика героев, сочинение`,
      isAccessibleForFree: true,
      about: {
        "@type": "Book",
        name: data.title,
        author: { "@type": "Person", name: data.author },
      },
    },
  ];

  return (
    <div ref={contentRef} className="min-h-screen bg-[#0b1020] font-golos text-white selection:bg-amber-400/30">
      <Seo
        title={data.seoTitle}
        description={data.seoDescription}
        canonical={data.canonical}
        image={data.cover}
        type="article"
        jsonLd={jsonLd}
      />

      <AnalysisHero
        data={data}
        progress={progress}
        tocOpen={tocOpen}
        setTocOpen={setTocOpen}
        scrollTo={scrollTo}
      />

      <div className="max-w-6xl mx-auto px-5 md:px-8 pt-6">
        <Breadcrumbs items={[
          { label: "Главная", href: "/" },
          { label: "Лента", href: "/feed" },
          { label: "Разборы произведений", href: "/feed" },
          { label: `«${data.title}»` },
        ]} />
      </div>

      <div className="max-w-6xl mx-auto px-5 md:px-8 py-6 lg:py-10 grid lg:grid-cols-[260px_1fr] gap-10">
        <AnalysisSidebar active={active} scrollTo={scrollTo} />
        <AnalysisContent data={data} />
      </div>

      <SiteFooter />
    </div>
  );
}