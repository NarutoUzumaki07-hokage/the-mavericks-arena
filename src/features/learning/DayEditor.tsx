import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useRoadmap, useRoadmapMutation } from "@/hooks/use-learning";
import { addDays, appDate, type DayWithContent } from "@/lib/learning";

const field = "w-full border-2 border-ink bg-background px-3 py-2.5 outline-none focus:border-primary";

export function DayEditor({
  open,
  onOpenChange,
  day,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  day?: DayWithContent;
}) {
  const days = useRoadmap();
  const last = days[days.length - 1];
  const [title, setTitle] = useState(day?.title ?? "");
  const [description, setDescription] = useState(day?.description ?? "");
  const [minutes, setMinutes] = useState(String(day?.estimated_minutes ?? 30));
  const [date, setDate] = useState(day?.scheduled_date ?? (last ? addDays(last.scheduled_date, 1) : appDate()));
  const [newItems, setNewItems] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  const save = useRoadmapMutation(async () => {
    const est = Math.max(1, parseInt(minutes, 10) || 30);
    const fields = { title: title.trim(), description: description.trim(), estimated_minutes: est, scheduled_date: date };
    let dayId = day?.id;
    if (dayId) {
      const { error } = await supabase.from("learning_days").update(fields).eq("id", dayId);
      if (error) throw error;
    } else {
      const position = (last?.position ?? 0) + 1;
      const { data, error } = await supabase.from("learning_days").insert({ ...fields, position }).select("id").single();
      if (error) throw error;
      dayId = data.id;
    }
    const items = [...newItems, draft].map((t) => t.trim()).filter(Boolean);
    if (items.length) {
      const base = day?.learning_tasks.length ?? 0;
      const { error } = await supabase
        .from("learning_tasks")
        .insert(items.map((t, i) => ({ day_id: dayId!, title: t, position: base + i })));
      if (error) throw error;
    }
  }, day ? "Learning day updated" : "Learning day created");

  const removeTask = useRoadmapMutation(
    (id: string) => supabase.from("learning_tasks").delete().eq("id", id),
    "Checklist item removed",
  );

  const addDraft = () => {
    if (!draft.trim()) return;
    setNewItems((x) => [...x, draft.trim()]);
    setDraft("");
  };

  const submit = () =>
    save.mutate(undefined, {
      onSuccess: () => {
        setNewItems([]);
        setDraft("");
        onOpenChange(false);
      },
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-none border-2 border-ink shadow-brutal-lg sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display uppercase">{day ? "Edit learning day" : "New learning day"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <label className="block text-sm font-bold">
            Topic title
            <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="JavaScript Fundamentals" />
          </label>
          <label className="block text-sm font-bold">
            Short description
            <textarea className={field} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-bold">
              Estimated minutes
              <input className={field} inputMode="numeric" value={minutes} onChange={(e) => setMinutes(e.target.value.replace(/\D/g, ""))} />
            </label>
            <label className="block text-sm font-bold">
              Intended date
              <input className={field} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
          </div>

          <div>
            <p className="text-sm font-bold">Checklist</p>
            <ul className="mt-2 space-y-1.5">
              {day?.learning_tasks.map((t) => (
                <li key={t.id} className="flex items-center gap-2 border-2 border-ink bg-secondary px-3 py-2 text-sm">
                  <span className="min-w-0 flex-1">{t.title}</span>
                  <button
                    aria-label={`Remove ${t.title}`}
                    onClick={() => confirm(`Remove "${t.title}"? Everyone's progress on it is removed too.`) && removeTask.mutate(t.id)}
                    className="shrink-0 text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
              {newItems.map((t, i) => (
                <li key={i} className="flex items-center gap-2 border-2 border-dashed border-ink px-3 py-2 text-sm">
                  <span className="min-w-0 flex-1">{t}</span>
                  <button aria-label="Remove" onClick={() => setNewItems((x) => x.filter((_, j) => j !== i))}>
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex gap-2">
              <input
                className={field}
                value={draft}
                placeholder="Add checklist item"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDraft())}
              />
              <button onClick={addDraft} aria-label="Add item" className="brutal-press shrink-0 border-2 border-ink bg-background px-3 shadow-brutal-sm">
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          <button
            disabled={!title.trim() || !date || save.isPending}
            onClick={submit}
            className="brutal brutal-press h-12 w-full bg-primary font-display uppercase text-primary-foreground disabled:opacity-50"
          >
            {save.isPending ? "Saving…" : day ? "Save changes" : "Create day"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
