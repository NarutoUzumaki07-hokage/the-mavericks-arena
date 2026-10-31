import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, ChevronDown, Pencil, Trash2, FolderOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProgressMap, useRoadmap, useRoadmapMutation } from "@/hooks/use-learning";
import { useMembers } from "@/hooks/use-members";
import { appDate, dayState, type DayWithContent } from "@/lib/learning";
import { cn } from "@/lib/utils";
import { Checklist } from "./Checklist";
import { DayEditor } from "./DayEditor";
import { ResourceList } from "./Resources";
import { ProgressBar, StatusBadge } from "./StatusBadge";

export function dayLabel(index: number) {
  return `Day ${String(index + 1).padStart(2, "0")}`;
}

export function ListView() {
  const days = useRoadmap();
  return (
    <div className="space-y-4">
      {days.map((d, i) => (
        <DaySection key={d.id} day={d} index={i} prev={days[i - 1]} next={days[i + 1]} />
      ))}
    </div>
  );
}

function DaySection({ day, index, prev, next }: { day: DayWithContent; index: number; prev: DayWithContent | undefined; next: DayWithContent | undefined }) {
  const progress = useProgressMap();
  const members = useMembers();
  const st = dayState(day, progress, appDate());
  const [open, setOpen] = useState(index === 0 || st.pending);
  const [editing, setEditing] = useState(false);
  const name = (id: string | null) => members.find((m) => m.id === id)?.display_name ?? "—";

  const swap = useRoadmapMutation(async (other: DayWithContent) => {
    const a = await supabase.from("learning_days").update({ position: other.position }).eq("id", day.id);
    if (a.error) throw a.error;
    const pos = other.position === day.position ? day.position + (other === next ? 1 : -1) : day.position;
    return supabase.from("learning_days").update({ position: pos }).eq("id", other.id);
  });
  const del = useRoadmapMutation(() => supabase.from("learning_days").delete().eq("id", day.id), "Learning day deleted");

  return (
    <section className={cn("brutal bg-card", st.pending && "shadow-[4px_4px_0_0_var(--destructive)]")}>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-start gap-3 p-4 text-left sm:p-5">
        <div className={cn("grid size-12 shrink-0 place-items-center border-2 border-ink font-display text-sm leading-none", st.status === "completed" ? "bg-success text-success-foreground" : st.pending ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground")}>
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 font-display text-lg uppercase leading-tight">{day.title}</h3>
            <StatusBadge state={st} />
          </div>
          <p className="mt-1 text-xs font-bold text-muted-foreground">
            {dayLabel(index)} · {new Date(day.scheduled_date + "T00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ~{day.estimated_minutes} min · {st.done}/{st.total} done · {st.total - st.done} pending · {day.learning_resources.length} resources
          </p>
          <div className="mt-2 max-w-sm"><ProgressBar percent={st.percent} /></div>
        </div>
        <ChevronDown className={cn("mt-1 size-5 shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="space-y-5 border-t-2 border-ink p-4 sm:p-5">
          {day.description && <p className="text-sm">{day.description}</p>}
          <div>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-widest">My checklist</h4>
            <Checklist day={day} />
          </div>
          <div>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-widest">Resources</h4>
            <ResourceList day={day} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/learning/$dayId" params={{ dayId: day.id }} className="brutal-press flex h-10 items-center gap-2 border-2 border-ink bg-primary px-3 text-sm font-bold text-primary-foreground shadow-brutal-sm">
              <FolderOpen className="size-4" /> Open workspace
            </Link>
            <button onClick={() => setEditing(true)} className="brutal-press flex h-10 items-center gap-2 border-2 border-ink bg-background px-3 text-sm font-bold shadow-brutal-sm">
              <Pencil className="size-4" /> Edit
            </button>
            <button disabled={!prev} onClick={() => prev && swap.mutate(prev)} aria-label="Move up" className="brutal-press grid size-10 place-items-center border-2 border-ink bg-background shadow-brutal-sm disabled:opacity-40">
              <ArrowUp className="size-4" />
            </button>
            <button disabled={!next} onClick={() => next && swap.mutate(next)} aria-label="Move down" className="brutal-press grid size-10 place-items-center border-2 border-ink bg-background shadow-brutal-sm disabled:opacity-40">
              <ArrowDown className="size-4" />
            </button>
            <button
              onClick={() => confirm(`Delete "${day.title}" for the whole team? This removes its checklist, resources and everyone's progress.`) && del.mutate(undefined)}
              className="brutal-press ml-auto flex h-10 items-center gap-2 border-2 border-ink bg-background px-3 text-sm font-bold text-destructive shadow-brutal-sm"
            >
              <Trash2 className="size-4" /> Delete
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Created by {name(day.created_by)} · {new Date(day.created_at).toLocaleString()} — last edited by {name(day.updated_by)} · {new Date(day.updated_at).toLocaleString()}
          </p>
        </div>
      )}
      {editing && <DayEditor open={editing} onOpenChange={setEditing} day={day} />}
    </section>
  );
}
