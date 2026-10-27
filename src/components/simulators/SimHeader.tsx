import { Link, NavLink } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";

const NAV = [
  { to: "/trenazhery", label: "Каталог", icon: "LayoutGrid" },
  { to: "/trenazhery/konstruktor", label: "Конструктор", icon: "Blocks" },
  { to: "/trenazhery/moi", label: "Мои", icon: "FolderOpen" },
];

/** Шапка раздела 3D/VR-тренажёров. */
export default function SimHeader() {
  return (
    <div className="sticky top-0 z-40 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 text-lg">🎓</div>
          <span className="font-montserrat text-base font-black gradient-text-purple">УЧИСЬПРО</span>
          <span className="hidden rounded-lg border border-white/15 px-2 py-0.5 text-[11px] text-white/45 sm:inline">3D/VR-тренажёры</span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition ${
                  isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
                }`
              }
            >
              <Icon name={n.icon} size={15} />
              <span className="hidden sm:inline">{n.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
