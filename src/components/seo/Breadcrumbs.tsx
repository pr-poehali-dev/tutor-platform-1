import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

export interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  items: Crumb[];
  className?: string;
}

const SITE_URL = "https://учисьпро.рф";

/** Полный абсолютный URL для крошки (для JSON-LD item) */
function absUrl(href?: string): string {
  if (!href) return "";
  return href.startsWith("http") ? href : `${SITE_URL}${href}`;
}

/**
 * Хлебные крошки + автоматический BreadcrumbList в JSON-LD для Google/Яндекс.
 * Пример: <Breadcrumbs items={[{label: "Главная", href: "/"}, {label: "Курсы", href: "/?#courses"}, {label: "Математика"}]} />
 */
export default function Breadcrumbs({ items, className = "" }: Props) {
  if (!items.length) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      // item указываем у всех элементов (Google рекомендует, в т.ч. для последнего)
      ...(c.href ? { item: absUrl(c.href) } : {}),
    })),
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <nav aria-label="Хлебные крошки" className={`flex items-center gap-1.5 text-xs md:text-sm ${className}`}>
        <ol className="flex items-center gap-1.5 flex-wrap" itemScope itemType="https://schema.org/BreadcrumbList">
          {items.map((c, i) => {
            const isLast = i === items.length - 1;
            return (
              <li
                key={i}
                className="flex items-center gap-1.5"
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                {i > 0 && (
                  <Icon name="ChevronRight" size={12} className="text-white/30 flex-shrink-0" />
                )}
                {c.href && !isLast ? (
                  <Link
                    to={c.href}
                    className="text-white/55 hover:text-white transition-colors"
                    itemProp="item"
                  >
                    <span itemProp="name">
                      {i === 0 && <Icon name="Home" size={12} className="inline mr-1 -mt-0.5" />}
                      {c.label}
                    </span>
                  </Link>
                ) : (
                  <span
                    className={isLast ? "text-white font-medium" : "text-white/55"}
                    itemProp="name"
                    aria-current={isLast ? "page" : undefined}
                  >
                    {i === 0 && !c.href && <Icon name="Home" size={12} className="inline mr-1 -mt-0.5" />}
                    {c.label}
                  </span>
                )}
                <meta itemProp="position" content={String(i + 1)} />
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}