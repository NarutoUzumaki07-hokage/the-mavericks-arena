import { PageTitle, ShellCard } from "@/components/layout/AppShell";

export function TodayPage() {
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  return (
    <>
      <PageTitle kicker={today} title="Today's Learning">
        Your daily tasks and focus sessions will live here.
      </PageTitle>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <ShellCard title="Today's tasks" tone="primary">No tasks yet — coming in the next build.</ShellCard>
        <ShellCard title="Focus timer" tone="success">Start a focused study session.</ShellCard>
        <ShellCard title="Overdue" tone="destructive">Missed targets will be flagged here.</ShellCard>
      </div>
    </>
  );
}
