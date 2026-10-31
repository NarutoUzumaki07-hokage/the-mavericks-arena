import { PageTitle, ShellCard } from "@/components/layout/AppShell";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { useMembers } from "@/hooks/use-members";
import { getMemberTheme } from "@/types/member";
import { cn } from "@/lib/utils";

export function TeamProgressPage() {
  const members = useMembers();
  return (
    <>
      <PageTitle kicker="The squad" title="Team Progress">
        See how every Maverick is showing up.
      </PageTitle>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {members.map((m, i) => {
          const theme = getMemberTheme(m.display_name, i);
          return (
            <div key={m.id} className="brutal flex items-center gap-3 bg-card p-4">
              <MemberAvatar member={m} index={i} className="size-12 shadow-brutal-sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="truncate font-display uppercase">{m.display_name}</p>
                  <span
                    className={cn(
                      "border border-ink px-1.5 py-0.5 text-[10px] font-bold uppercase",
                      theme.badgeClasses,
                    )}
                  >
                    {theme.colorName}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">No sessions logged yet</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <ShellCard title="Weekly focus hours" tone="primary">Team chart arrives with session tracking.</ShellCard>
        <ShellCard title="Consistency board" tone="success">Streaks and completion rates will appear here.</ShellCard>
      </div>
    </>
  );
}
