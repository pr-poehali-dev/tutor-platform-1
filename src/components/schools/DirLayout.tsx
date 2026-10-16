import { ReactNode } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";

interface Props {
  crumbs: { label: string; href?: string }[];
  children: ReactNode;
}

export default function DirLayout({ crumbs, children }: Props) {
  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary font-bold">У</span>
            <span className="text-lg font-bold tracking-tight">УЧИСЬПРО</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/shkoly" className="text-white/60 hover:text-white">Справочник</Link>
            <Link to="/shkoly/reyting" className="flex items-center gap-1 text-white/60 hover:text-white">
              <Icon name="Trophy" size={14} />
              Рейтинг
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Breadcrumbs items={crumbs} />
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
