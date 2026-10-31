import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Flame, Timer, LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { useCurrentMember, useMembers } from "@/hooks/use-members";
import { clearSession } from "@/lib/session";
import { SAMPLE, formatMinutes } from "@/features/sample-data";

export function AppHeader() {
  const member = useCurrentMember();
  const members = useMembers();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const signOut = () => {
    clearSession();
    qc.clear();
    navigate({ to: "/", replace: true });
  };

  return (
    <header className="glass-panel sticky top-0 z-30 border-x-0 border-t-0">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Logo compact className="lg:hidden" />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">In the arena</p>
            <p className="truncate font-display text-lg leading-tight">{member.display_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Stat icon={<Flame className="size-4" />} label="Streak" value={`${SAMPLE.streakDays}d`} />
          <Stat
            icon={<Timer className="size-4" />}
            label="Focused"
            value={formatMinutes(SAMPLE.focusedMinutesToday)}
            className="hidden sm:flex"
          />
          <MemberAvatar member={member} index={members.findIndex((m) => m.id === member.id)} />
          <button
            onClick={signOut}
            aria-label="Switch member"
            className="brutal-press grid size-10 place-items-center border-2 border-ink bg-background shadow-brutal-sm"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

function Stat({
  icon,
  label,
  value,
  className = "flex",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`${className} items-center gap-2 border-2 border-ink bg-background px-2 py-1.5`} title={`${label} (placeholder)`}>
      {icon}
      <div className="leading-none">
        <p className="text-[10px] font-bold uppercase text-muted-foreground">{label}</p>
        <p className="text-sm font-bold">{value}</p>
      </div>
    </div>
  );
}
