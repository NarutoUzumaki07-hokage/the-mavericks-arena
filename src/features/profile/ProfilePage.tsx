import { PageTitle, ShellCard } from "@/components/layout/AppShell";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { useCurrentMember, useMembers } from "@/hooks/use-members";
import { getMemberTheme } from "@/types/member";
import { cn } from "@/lib/utils";

export function ProfilePage() {
  const member = useCurrentMember();
  const members = useMembers();
  const theme = getMemberTheme(member.display_name);
  const since = new Date(member.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  return (
    <>
      <PageTitle kicker="Your corner" title="My Profile" />
      <div className="brutal mb-5 flex flex-col items-start gap-4 bg-card p-6 sm:flex-row sm:items-center">
        <MemberAvatar
          member={member}
          index={members.findIndex((m) => m.id === member.id)}
          className="size-20 text-3xl shadow-brutal"
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate font-display text-3xl uppercase">{member.display_name}</h2>
            <span className={cn("border-2 border-ink px-2 py-0.5 text-xs font-bold uppercase", theme.badgeClasses)}>
              {theme.colorName}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Maverick since {since}</p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <ShellCard title="Personal stats" tone="primary">Streaks, totals and best days are coming soon.</ShellCard>
        <ShellCard title="Achievements" tone="success">Earned badges will show up here.</ShellCard>
      </div>
    </>
  );
}
