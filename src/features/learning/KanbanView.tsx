import { useState, type DragEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useProgressMap, useRoadmap, useSetTaskStatus } from "@/hooks/use-learning";
import { appDate, dayState, kanbanMoveUpdates, type TaskStatus } from "@/lib/learning";
import { cn } from "@/lib/utils";
import { ProgressBar, STATUS_LABEL, StatusBadge } from "./StatusBadge";
import { dayLabel } from "./ListView";

const COLUMNS: { id: TaskStatus; bar: string }[] = [
  { id: "todo", bar: "bg-ink" },
  { id: "in_progress", bar: "bg-primary" },
  { id: "completed", bar: "bg-success" },
];

/** Cards are the shared days; columns reflect ONLY the signed-in member's progress. */
export function KanbanView() {
  const days = useRoadmap();
  const progress = useProgressMap();
  const set = useSetTaskStatus();
  const today = appDate();
  const [over, setOver] = useState<TaskStatus | null>(null);

  const move = (dayId: string, target: TaskStatus) => {
    const day = days.find((d) => d.id === dayId);
    if (!day) return;
    if (!day.learning_tasks.length) return;
    set.mutate(kanbanMoveUpdates(day.learning_tasks, progress, target));
  };

  const cards = days.map((d, i) => ({ d, i, st: dayState(d, progress, today) }));

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
      <div className="grid min-w-[780px] grid-cols-3 gap-4">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            onDragOver={(e) => (e.preventDefault(), setOver(col.id))}
            onDragLeave={() => setOver(null)}
            onDrop={(e: DragEvent) => {
              setOver(null);
              move(e.dataTransfer.getData("text/plain"), col.id);
            }}
            className={cn("glass-panel min-h-64 p-3", over === col.id && "outline-4 outline-primary")}
          >
            <div className={cn("mb-3 h-2", col.bar)} />
            <h3 className="mb-3 font-display uppercase">
              {STATUS_LABEL[col.id]} <span className="text-muted-foreground">({cards.filter((c) => c.st.status === col.id).length})</span>
            </h3>
            <div className="space-y-3">
              {cards
                .filter((c) => c.st.status === col.id)
                .map(({ d, i, st }) => (
                  <article
                    key={d.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", d.id)}
                    className={cn("brutal cursor-grab bg-card p-3", st.pending && "border-destructive")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase text-muted-foreground">{dayLabel(i)}</span>
                      <StatusBadge state={st} />
                    </div>
                    <Link to="/learning/$dayId" params={{ dayId: d.id }} className="mt-1 block font-display uppercase leading-tight hover:underline">
                      {d.title}
                    </Link>
                    <div className="mt-2"><ProgressBar percent={st.percent} tone={col.id === "in_progress" ? "primary" : "success"} /></div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {st.done}/{st.total} items · ~{d.estimated_minutes} min · {d.learning_resources.length} resources
                    </p>
                    <label className="mt-2 flex items-center gap-2 text-xs font-bold">
                      Move to
                      <select
                        value={st.status}
                        onChange={(e) => move(d.id, e.target.value as TaskStatus)}
                        disabled={!d.learning_tasks.length}
                        className="h-8 flex-1 border-2 border-ink bg-background px-1"
                      >
                        {COLUMNS.map((c) => (
                          <option key={c.id} value={c.id}>{STATUS_LABEL[c.id]}</option>
                        ))}
                      </select>
                    </label>
                  </article>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
