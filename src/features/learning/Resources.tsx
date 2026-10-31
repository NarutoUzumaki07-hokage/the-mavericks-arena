import { useState } from "react";
import { ExternalLink, Trash2, Youtube, BookText, Globe, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRoadmapMutation } from "@/hooks/use-learning";
import { useMembers } from "@/hooks/use-members";
import { guessResourceType, isValidUrl, type DayWithContent } from "@/lib/learning";
import { toast } from "sonner";

const ICONS = { youtube: Youtube, documentation: BookText, website: Globe, other: Link2 } as const;

export function ResourceList({ day, editable = true }: { day: DayWithContent; editable?: boolean }) {
  const members = useMembers();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const add = useRoadmapMutation(async () => {
    const u = url.trim();
    if (!isValidUrl(u)) throw new Error("Please enter a valid http(s) link");
    const { error } = await supabase
      .from("learning_resources")
      .insert({ day_id: day.id, title: title.trim() || new URL(u).hostname, url: u, resource_type: guessResourceType(u) });
    if (error) throw error;
  }, "Resource added");
  const remove = useRoadmapMutation((id: string) => supabase.from("learning_resources").delete().eq("id", id), "Resource removed");

  return (
    <div>
      {day.learning_resources.length === 0 && <p className="text-sm text-muted-foreground">No resources yet.</p>}
      <ul className="space-y-2">
        {day.learning_resources.map((r) => {
          const Icon = ICONS[r.resource_type];
          const by = members.find((m) => m.id === r.added_by)?.display_name;
          return (
            <li key={r.id} className="flex items-center gap-3 border-2 border-ink bg-background px-3 py-2">
              <Icon className="size-4 shrink-0" />
              {/* Opening a link never starts the timer. */}
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 hover:underline">
                <span className="block truncate font-bold">{r.title}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {r.resource_type} · added by {by ?? "—"}
                </span>
              </a>
              <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
              {editable && (
                <button aria-label={`Remove ${r.title}`} onClick={() => confirm("Remove this resource for everyone?") && remove.mutate(r.id)} className="shrink-0 text-destructive">
                  <Trash2 className="size-4" />
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {editable && (
        <form
          className="mt-3 grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            if (!isValidUrl(url.trim())) return toast.error("Please enter a valid http(s) link");
            add.mutate(undefined, { onSuccess: () => (setTitle(""), setUrl("")) });
          }}
        >
          <input className="h-11 min-w-0 border-2 border-ink bg-background px-3" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="h-11 min-w-0 border-2 border-ink bg-background px-3" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} />
          <button disabled={add.isPending} className="brutal-press h-11 border-2 border-ink bg-primary px-4 font-bold text-primary-foreground shadow-brutal-sm">
            Add
          </button>
        </form>
      )}
    </div>
  );
}
