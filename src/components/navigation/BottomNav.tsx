import { Link } from "@tanstack/react-router";
import { NAV_ITEMS } from "./nav-items";

export function BottomNav() {
  return (
    <nav className="glass-panel fixed inset-x-3 bottom-3 z-40 grid grid-cols-3 gap-2 p-2 shadow-brutal lg:hidden">
      {NAV_ITEMS.map(({ to, short, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className="flex min-h-14 flex-col items-center justify-center gap-1 border-2 border-transparent text-xs font-bold"
          activeProps={{ className: "!border-ink bg-primary text-primary-foreground" }}
        >
          <Icon className="size-5" />
          {short}
        </Link>
      ))}
    </nav>
  );
}
