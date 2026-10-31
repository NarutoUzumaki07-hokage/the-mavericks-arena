import { cn } from "@/lib/utils";
import type { DayState, TaskStatus } from "@/lib/learning";

export function StatusBadge({ state }: { state: DayState }) {
  let label = "Not started";
  let cls = "bg-background";
  if (state.status === "completed") {
    label = state.late ? "Completed late" : "Completed";
    cls = state.late ? "bg-success/20 text-foreground" : "bg-success text-success-foreground";
  } else if (state.pending) {
    label = "Pending";
    cls = "bg-destructive text-destructive-foreground";
  } else if (state.status === "in_progress") {
    label = "In progress";
    cls = "bg-primary text-primary-foreground";
  }
  return <span className={cn("shrink-0 border-2 border-ink px-2 py-0.5 text-[11px] font-bold uppercase", cls)}>{label}</span>;
}

export const STATUS_LABEL: Record<TaskStatus, string> = { todo: "To Do", in_progress: "In Progress", completed: "Completed" };

export function ProgressBar({ percent, tone = "success" }: { percent: number; tone?: "success" | "primary" }) {
  return (
    <div className="h-3 w-full border-2 border-ink bg-background">
      <div className={cn("h-full", tone === "success" ? "bg-success" : "bg-primary")} style={{ width: `${percent}%` }} />
    </div>
  );
}
