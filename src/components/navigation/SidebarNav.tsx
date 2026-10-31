import { Link } from "@tanstack/react-router";
import { NAV_ITEMS } from "./nav-items";
import { Logo } from "@/components/layout/Logo";

export function SidebarNav() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r-2 border-ink bg-background p-5 lg:flex">
      <Logo />
      <nav className="mt-10 flex flex-col gap-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="brutal-press flex items-center gap-3 border-2 border-ink bg-background px-4 py-3 font-bold shadow-brutal-sm hover:bg-secondary"
            activeProps={{ className: "!bg-primary text-primary-foreground shadow-brutal" }}
          >
            <Icon className="size-5 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto border-2 border-dashed border-ink p-3 text-xs font-medium text-muted-foreground">
        Four members. One arena. Show up daily.
      </div>
    </aside>
  );
}
