import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Flame, Timer, LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCurrentMember, useMembers } from "@/hooks/use-members";
import { useDailyStats, useOpenSession } from "@/hooks/use-learning";
import { signOutMember } from "@/lib/session";
import { DAILY_GOAL_SECONDS, formatDuration } from "@/lib/learning";
import { TimerPanel } from "@/features/learning/TimerPanel";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const member = useCurrentMember();
  const members = useMembers();
  const stats = useDailyStats();
  const open = useOpenSession();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await signOutMember();
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
          <Stat icon={<Flame className="size-4" />} label="Streak" value={`${stats.streak}d`} />
          <Sheet>
            <SheetTrigger asChild>
              <button
                aria-label="Open focus timer"
                className={cn(
                  "brutal-press flex items-center gap-2 border-2 border-ink px-2 py-1.5 shadow-brutal-sm",
                  open?.status === "running" ? "bg-primary text-primary-foreground" : stats.todaySeconds >= DAILY_GOAL_SECONDS ? "bg-success text-success-foreground" : "bg-background",
                )}
              >
                <Timer className="size-4" />
                <div className="hidden text-left leading-none sm:block">
                  <p className="text-[10px] font-bold uppercase opacity-80">{open ? `Timer ${open.status}` : "Focused today"}</p>
                  <p className="text-sm font-bold">{formatDuration(stats.todaySeconds)}</p>
                </div>
              </button>
            </SheetTrigger>
            <SheetContent className="w-full overflow-y-auto border-l-2 border-ink sm:max-w-md">
              <SheetHeader><SheetTitle className="font-display uppercase">Focus</SheetTitle></SheetHeader>
              <div className="px-4 pb-6"><TimerPanel compact /></div>
            </SheetContent>
          </Sheet>
          <MemberAvatar member={member} index={members.findIndex((m) => m.id === member.id)} />
          <button onClick={signOut} aria-label="Sign out" className="brutal-press grid size-10 place-items-center border-2 border-ink bg-background shadow-brutal-sm">
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 border-2 border-ink bg-background px-2 py-1.5">
      {icon}
      <div className="leading-none">
        <p className="text-[10px] font-bold uppercase text-muted-foreground">{label}</p>
        <p className="text-sm font-bold">{value}</p>
      </div>
    </div>
  );
}
