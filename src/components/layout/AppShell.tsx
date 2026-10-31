import type { ReactNode } from "react";
import { SidebarNav } from "@/components/navigation/SidebarNav";
import { BottomNav } from "@/components/navigation/BottomNav";
import { AppHeader } from "./AppHeader";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid-paper flex min-h-screen overflow-x-hidden">
      <SidebarNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 lg:pb-10">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}

export function PageTitle({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-6">
      <p className="inline-block border-2 border-ink bg-background px-2 py-0.5 text-xs font-bold uppercase tracking-widest">
        {kicker}
      </p>
      <h1 className="mt-3 font-display text-3xl uppercase leading-none sm:text-5xl">{title}</h1>
      {children && <p className="mt-3 max-w-2xl text-muted-foreground">{children}</p>}
    </div>
  );
}

export function ShellCard({
  title,
  tone = "default",
  children,
}: {
  title: string;
  tone?: "default" | "primary" | "success" | "destructive";
  children: ReactNode;
}) {
  const bar = {
    default: "bg-ink",
    primary: "bg-primary",
    success: "bg-success",
    destructive: "bg-destructive",
  }[tone];
  return (
    <section className="brutal bg-card">
      <div className={`h-2 ${bar}`} />
      <div className="p-5">
        <h2 className="font-display text-lg uppercase">{title}</h2>
        <div className="mt-2 text-sm text-muted-foreground">{children}</div>
      </div>
    </section>
  );
}
