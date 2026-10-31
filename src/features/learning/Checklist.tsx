import { Check } from "lucide-react";
import { useProgressMap, useSetTaskStatus } from "@/hooks/use-learning";
import { taskStatus, type DayWithContent, type TaskStatus } from "@/lib/learning";
import { cn } from "@/lib/utils";

const NEXT: Record<TaskStatus, TaskStatus> = { todo: "completed", in_progress: "completed", completed: "todo" };

/** Checklist showing ONLY the signed-in member's own progress. */
export function Checklist({ day }: { day: DayWithContent }) {
  const progress = useProgressMap();
  const set = useSetTaskStatus();
  if (!day.learning_tasks.length) return <p className="text-sm text-muted-foreground">No checklist items yet — edit the day to add some.</p>;
  return (
    <ul className="space-y-2">
      {day.learning_tasks.map((t) => {
        const st = taskStatus(progress, t.id);
        return (
          <li key={t.id} className="flex items-center gap-3 border-2 border-ink bg-background px-3 py-2.5">
            <button
              role="checkbox"
              aria-checked={st === "completed"}
              aria-label={t.title}
              onClick={() => set.mutate([{ taskId: t.id, status: NEXT[st] }])}
              className={cn(
                "grid size-7 shrink-0 place-items-center border-2 border-ink",
                st === "completed" ? "bg-success text-success-foreground" : "bg-background",
              )}
            >
              {st === "completed" && <Check className="size-4" strokeWidth={3} />}
            </button>
            <span className={cn("min-w-0 flex-1 text-sm", st === "completed" && "line-through text-muted-foreground")}>{t.title}</span>
            <select
              aria-label={`Status for ${t.title}`}
              value={st}
              onChange={(e) => set.mutate([{ taskId: t.id, status: e.target.value as TaskStatus }])}
              className={cn(
                "h-8 shrink-0 border-2 border-ink px-1 text-xs font-bold",
                st === "in_progress" ? "bg-primary text-primary-foreground" : "bg-background",
              )}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </li>
        );
      })}
    </ul>
  );
}
