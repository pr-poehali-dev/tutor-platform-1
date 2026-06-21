import { useEffect, useRef, useState } from "react";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import { COVER, CANONICAL, SECTIONS } from "@/components/revizor/revizorData";
import RevizorHero, { RevizorSidebar } from "@/components/revizor/RevizorHero";
import RevizorContent from "@/components/revizor/RevizorContent";

export default function PremiumRevizor() {
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

      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
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
      headline: "«Ревизор» Н. В. Гоголя — полный разбор произведения",
      description:
        "Эталонный разбор комедии «Ревизор» Гоголя: история создания, сюжет по действиям, система образов, темы, цитаты с пояснениями, смысл финала и подготовка к ЕГЭ и ОГЭ.",
      datePublished: "2026-06-21",
      author: { "@type": "Organization", name: "УЧИСЬПРО" },
      publisher: {
        "@type": "Organization",
        name: "УЧИСЬПРО",
        logo: {
          "@type": "ImageObject",
          url: "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/17bc9252-13b8-4e83-af00-e904346aa5a9.jpg",
        },
      },
      image: COVER,
      mainEntityOfPage: CANONICAL,
      inLanguage: "ru",
      articleSection: "Разборы произведений",
    },
  ];

  return (
    <div ref={contentRef} className="min-h-screen bg-[#0b1020] font-golos text-white selection:bg-amber-400/30">
      <Seo
        title="«Ревизор» Гоголя — полный разбор произведения | УЧИСЬПРО"
        description="Глубокий разбор «Ревизора» Гоголя: сюжет по действиям, система образов, темы, цитаты с пояснениями, смысл, подготовка к ЕГЭ и ОГЭ. Эталонный материал."
        canonical={CANONICAL}
        image={COVER}
        type="article"
        jsonLd={jsonLd}
      />

      <RevizorHero
        progress={progress}
        active={active}
        tocOpen={tocOpen}
        setTocOpen={setTocOpen}
        scrollTo={scrollTo}
      />

      <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 lg:py-14 grid lg:grid-cols-[260px_1fr] gap-10">
        {/* Боковое оглавление */}
        <RevizorSidebar active={active} scrollTo={scrollTo} />

        {/* Контент */}
        <RevizorContent />
      </div>

      <SiteFooter />
    </div>
  );
}
