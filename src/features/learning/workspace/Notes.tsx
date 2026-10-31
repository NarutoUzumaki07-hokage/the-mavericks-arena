import { useEffect, useRef, useState } from "react";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

type Note = Tables<"personal_notes">;

export const notesQuery = (dayId: string) =>
  queryOptions({
    queryKey: ["notes", dayId],
    queryFn: async (): Promise<Note[]> => {
      const { data, error } = await supabase.from("personal_notes").select("*").eq("learning_day_id", dayId).order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export function Notes({ dayId }: { dayId: string }) {
  const notes = useSuspenseQuery(notesQuery(dayId)).data;
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(notes[0]?.id ?? null);
  const active = notes.find((n) => n.id === activeId) ?? null;

  const create = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from("personal_notes").insert({ learning_day_id: dayId, title: "Untitled note" }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (n) => {
      qc.setQueryData<Note[]>(["notes", dayId], (x) => [n, ...(x ?? [])]);
      setActiveId(n.id);
    },
    onError: (e) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("personal_notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      setActiveId(null);
      qc.invalidateQueries({ queryKey: ["notes", dayId] });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
      <div className="space-y-2">
        <button onClick={() => create.mutate()} className="brutal brutal-press flex h-11 w-full items-center justify-center gap-2 bg-primary font-bold text-primary-foreground">
          <Plus className="size-4" /> New note
        </button>
        {notes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet. Only you can see your notes.</p>}
        {notes.map((n) => (
          <button
            key={n.id}
            onClick={() => setActiveId(n.id)}
            className={cn("block w-full border-2 border-ink px-3 py-2 text-left text-sm", n.id === activeId ? "bg-primary text-primary-foreground" : "bg-background")}
          >
            <span className="block truncate font-bold">{n.title || "Untitled note"}</span>
            <span className="block text-[11px] opacity-75">{new Date(n.updated_at).toLocaleString()}</span>
          </button>
        ))}
      </div>
      {active ? (
        <NoteEditor key={active.id} note={active} dayId={dayId} onDelete={() => confirm("Delete this note?") && remove.mutate(active.id)} />
      ) : (
        <div className="grid min-h-48 place-items-center border-2 border-dashed border-ink p-6 text-sm text-muted-foreground">Select or create a note.</div>
      )}
    </div>
  );
}

function NoteEditor({ note, dayId, onDelete }: { note: Note; dayId: string; onDelete: () => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [status, setStatus] = useState<"saved" | "unsaved" | "saving" | "error">("saved");
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setStatus("unsaved");
    const t = setTimeout(async () => {
      setStatus("saving");
      const { data, error } = await supabase.from("personal_notes").update({ title, body }).eq("id", note.id).select().single();
      if (error) return setStatus("error");
      setStatus("saved");
      qc.setQueryData<Note[]>(["notes", dayId], (x) => x?.map((n) => (n.id === data.id ? data : n)));
    }, 800);
    return () => clearTimeout(t);
  }, [title, body, note.id, dayId, qc]);

  return (
    <div className="brutal bg-card p-4">
      <div className="flex items-center gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Note title" className="h-11 min-w-0 flex-1 border-2 border-ink bg-background px-3 font-bold" />
        <button onClick={onDelete} aria-label="Delete note" className="grid size-11 shrink-0 place-items-center border-2 border-ink text-destructive"><Trash2 className="size-4" /></button>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={14}
        aria-label="Note body"
        placeholder="Write what you learned…"
        className="mt-3 w-full border-2 border-ink bg-background p-3 font-sans outline-none focus:border-primary"
      />
      <p className={cn("mt-1 text-xs font-bold", status === "error" ? "text-destructive" : status === "saved" ? "text-success" : "text-muted-foreground")}>
        {{ saved: "All changes saved", unsaved: "Unsaved changes…", saving: "Saving…", error: "Couldn't save — check your connection" }[status]}
      </p>
    </div>
  );
}
