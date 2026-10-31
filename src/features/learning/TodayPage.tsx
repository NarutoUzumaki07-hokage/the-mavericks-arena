import { useState } from "react";
import { Plus, LayoutList, Columns3 } from "lucide-react";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { useCurrentMember, useMembers } from "@/hooks/use-members";
import { useDailyStats, useRoadmap } from "@/hooks/use-learning";
import { DAILY_GOAL_SECONDS, formatDuration } from "@/lib/learning";
import { cn } from "@/lib/utils";
import { ListView } from "./ListView";
import { KanbanView } from "./KanbanView";
import { DayEditor } from "./DayEditor";
import { TimerPanel } from "./TimerPanel";
import { SessionHistory } from "./SessionHistory";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export function TodayPage() {
  const member = useCurrentMember();
  const members = useMembers();
  const days = useRoadmap();
  const stats = useDailyStats();
  const [view, setView] = useState<"list" | "kanban">("list");
  const [creating, setCreating] = useState(false);
  const goalMet = stats.todaySeconds >= DAILY_GOAL_SECONDS;
  const remaining = Math.max(0, DAILY_GOAL_SECONDS - stats.todaySeconds);
  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <>
      <div className="mb-6 flex min-w-0 items-center gap-4">
        <MemberAvatar member={member} index={members.findIndex((m) => m.id === member.id)} className="size-14 text-2xl shadow-brutal" />
        <div className="min-w-0">
          <p className="inline-block border-2 border-ink bg-background px-2 py-0.5 text-xs font-bold uppercase tracking-widest">{dateLabel}</p>
          <h1 className="mt-2 font-display text-2xl uppercase leading-none sm:text-4xl">{greeting()}, {member.display_name}!</h1>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Today's focus" value={`${Math.floor(stats.todaySeconds / 60)} / 30 min`} tone={goalMet ? "success" : "primary"} />
        <Stat label="Daily goal" value={goalMet ? "Completed" : `${Math.ceil(remaining / 60)} min left`} tone={goalMet ? "success" : "default"} />
        <Stat label="Current streak" value={`${stats.streak} ${stats.streak === 1 ? "day" : "days"}`} tone="default" />
        <Stat label="Pending topics" value={String(stats.pending)} tone={stats.pending ? "destructive" : "default"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div role="tablist" className="flex border-2 border-ink shadow-brutal-sm">
              {([
                ["list", "List View", LayoutList],
                ["kanban", "Kanban View", Columns3],
              ] as const).map(([id, label, Icon]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={view === id}
                  onClick={() => setView(id)}
                  className={cn("flex h-11 items-center gap-2 px-4 text-sm font-bold", view === id ? "bg-primary text-primary-foreground" : "bg-background")}
                >
                  <Icon className="size-4" /> {label}
                </button>
              ))}
            </div>
            <button onClick={() => setCreating(true)} className="brutal brutal-press flex h-11 items-center gap-2 bg-background px-4 text-sm font-bold">
              <Plus className="size-4" /> New day
            </button>
          </div>

          {days.length === 0 ? (
            <div className="brutal bg-card p-8 text-center">
              <p className="font-display text-xl uppercase">The roadmap is empty</p>
              <p className="mt-2 text-sm text-muted-foreground">Create Day 01 to kick things off for the whole team.</p>
              <button onClick={() => setCreating(true)} className="brutal brutal-press mt-4 h-11 bg-primary px-5 font-bold text-primary-foreground">
                Create first day
              </button>
            </div>
          ) : view === "list" ? (
            <ListView />
          ) : (
            <KanbanView />
          )}
        </div>
        <aside className="space-y-6">
          <TimerPanel />
          <SessionHistory />
        </aside>
      </div>
      {creating && <DayEditor open={creating} onOpenChange={setCreating} />}
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "default" | "primary" | "success" | "destructive" }) {
  return (
    <div
      className={cn(
        "brutal p-3 sm:p-4",
        tone === "default" && "bg-card",
        tone === "primary" && "bg-primary text-primary-foreground",
        tone === "success" && "bg-success text-success-foreground",
        tone === "destructive" && "bg-destructive text-destructive-foreground",
      )}
    >
      <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">{label}</p>
      <p className="mt-1 font-display text-lg leading-tight sm:text-2xl">{value}</p>
    </div>
  );
}

export { formatDuration };
