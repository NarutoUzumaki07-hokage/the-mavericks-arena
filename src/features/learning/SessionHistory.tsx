import { useState } from "react";
import { useCorrectSession, useMySessions, useRoadmap } from "@/hooks/use-learning";
import { formatDuration } from "@/lib/learning";

export function SessionHistory() {
  const sessions = useMySessions().filter((s) => s.status === "completed").slice(0, 12);
  const days = useRoadmap();
  const correct = useCorrectSession();
  const [editing, setEditing] = useState<string | null>(null);
  const [minutes, setMinutes] = useState("");
  const [reason, setReason] = useState("");

  return (
    <div className="brutal bg-card p-5">
      <h2 className="font-display text-lg uppercase">Session history</h2>
      {sessions.length === 0 && <p className="mt-2 text-sm text-muted-foreground">No saved sessions yet. Start the timer to log focus time.</p>}
      <ul className="mt-3 space-y-2">
        {sessions.map((s) => (
          <li key={s.id} className="border-2 border-ink bg-background p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate font-bold">{days.find((d) => d.id === s.learning_day_id)?.title ?? "Removed topic"}</span>
              <span className="shrink-0 font-display">{formatDuration(s.focused_seconds)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Credited {s.credited_date}</span>
              <button onClick={() => (setEditing(editing === s.id ? null : s.id), setMinutes(String(Math.floor(s.focused_seconds / 60))), setReason(""))} className="font-bold underline">
                Correct
              </button>
            </div>
            {editing === s.id && (
              <form
                className="mt-2 space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  correct.mutate({ id: s.id, newSeconds: Math.max(0, parseInt(minutes, 10) || 0) * 60, reason }, { onSuccess: () => setEditing(null) });
                }}
              >
                <p className="text-xs text-muted-foreground">You can only reduce recorded time. Every correction is logged.</p>
                <input className="h-9 w-full border-2 border-ink px-2" inputMode="numeric" value={minutes} onChange={(e) => setMinutes(e.target.value.replace(/\D/g, ""))} aria-label="Corrected minutes" />
                <input className="h-9 w-full border-2 border-ink px-2" placeholder="Reason (e.g. forgot to stop)" value={reason} onChange={(e) => setReason(e.target.value)} />
                <button className="h-9 w-full border-2 border-ink bg-destructive font-bold text-destructive-foreground">Save correction</button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
