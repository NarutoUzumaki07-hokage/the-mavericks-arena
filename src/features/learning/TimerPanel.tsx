import { useEffect, useRef, useState } from "react";
import { Pause, Play, Save, Square, Trash2 } from "lucide-react";
import { useOpenSession, useRoadmap, useSessionAction } from "@/hooks/use-learning";
import { formatDuration, sessionElapsed } from "@/lib/learning";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PRESETS = [30, 45, 60, 90];

function FlipDigit({ value }: { value: string }) {
  return (
    <div className="relative grid h-16 w-11 place-items-center overflow-hidden border-2 border-ink bg-ink font-display text-4xl text-primary-foreground shadow-brutal-sm sm:h-24 sm:w-16 sm:text-6xl">
      <span className="relative z-10 tabular-nums">{value}</span>
      <div aria-hidden className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-background/40" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-1/2 bg-background/10" />
    </div>
  );
}

export function FlipClock({ seconds }: { seconds: number }) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const groups = [...(h ? [String(h).padStart(2, "0")] : []), String(m).padStart(2, "0"), String(s).padStart(2, "0")];
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2" role="timer" aria-label={`${h}h ${m}m ${s}s remaining`}>
      {groups.map((g, gi) => (
        <div key={gi} className="flex items-center gap-1 sm:gap-1.5">
          {gi > 0 && <span className="font-display text-3xl sm:text-5xl">:</span>}
          {g.split("").map((d, i) => (
            <FlipDigit key={i} value={d} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function TimerPanel({ defaultDayId, compact }: { defaultDayId?: string; compact?: boolean }) {
  const days = useRoadmap();
  const open = useOpenSession();
  const act = useSessionAction();
  const [dayId, setDayId] = useState(defaultDayId ?? "");
  const [minutes, setMinutes] = useState(30);
  const [custom, setCustom] = useState("");
  const [, tick] = useState(0);
  const autoStopped = useRef<string | null>(null);

  useEffect(() => {
    if (open?.status !== "running") return;
    const t = setInterval(() => tick((n) => n + 1), 500);
    return () => clearInterval(t);
  }, [open?.status]);

  const elapsed = open ? (open.status === "stopped" ? open.focused_seconds : sessionElapsed(open)) : 0;
  const planned = open ? open.planned_seconds : minutes * 60;
  const remaining = Math.max(0, planned - elapsed);

  useEffect(() => {
    if (open?.status === "running" && remaining === 0 && autoStopped.current !== open.id) {
      autoStopped.current = open.id;
      act.mutate({ action: "stop", id: open.id });
      toast.success("Session complete! Review and save it.");
    }
  }, [open, remaining, act]);

  const openDay = open ? days.find((d) => d.id === open.learning_day_id) : null;
  const busy = act.isPending;

  const applyCustom = () => {
    const n = parseInt(custom, 10);
    if (!Number.isFinite(n) || n < 1 || n > 720) return toast.error("Enter between 1 and 720 minutes");
    setMinutes(n);
  };

  return (
    <div className={cn("brutal bg-card", compact ? "p-4" : "p-5 sm:p-6")}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-display text-lg uppercase">Focus timer</h2>
        <span
          className={cn(
            "border-2 border-ink px-2 py-0.5 text-xs font-bold uppercase",
            open?.status === "running" && "bg-primary text-primary-foreground",
            open?.status === "paused" && "bg-secondary",
            open?.status === "stopped" && "bg-success text-success-foreground",
          )}
        >
          {open ? open.status : "ready"}
        </span>
      </div>

      <FlipClock seconds={remaining} />
      <p className="mt-3 text-center text-sm font-bold text-muted-foreground">
        Session length {formatDuration(planned)}
        {openDay && <> · {openDay.title}</>}
      </p>

      {!open && (
        <div className="mt-5 space-y-3">
          <label className="block text-sm font-bold" htmlFor="timer-topic">Learning topic</label>
          <select
            id="timer-topic"
            value={dayId}
            onChange={(e) => setDayId(e.target.value)}
            className="h-12 w-full border-2 border-ink bg-background px-3 font-bold"
          >
            <option value="">Choose a topic…</option>
            {days.map((d, i) => (
              <option key={d.id} value={d.id}>
                Day {String(i + 1).padStart(2, "0")} — {d.title}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setMinutes(p)}
                className={cn(
                  "brutal-press h-11 border-2 border-ink font-bold shadow-brutal-sm",
                  minutes === p ? "bg-primary text-primary-foreground" : "bg-background",
                )}
              >
                {p}m
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              inputMode="numeric"
              placeholder="Custom minutes (e.g. 120)"
              value={custom}
              onChange={(e) => setCustom(e.target.value.replace(/\D/g, ""))}
              className="h-11 min-w-0 flex-1 border-2 border-ink bg-background px-3"
            />
            <button onClick={applyCustom} className="brutal-press h-11 border-2 border-ink bg-background px-4 font-bold shadow-brutal-sm">
              Set
            </button>
          </div>
          <button
            disabled={!dayId || busy}
            onClick={() => act.mutate({ action: "start", dayId, plannedSeconds: minutes * 60 })}
            className="brutal brutal-press flex h-14 w-full items-center justify-center gap-2 bg-primary font-display uppercase text-primary-foreground disabled:opacity-50"
          >
            <Play className="size-5" /> Start
          </button>
        </div>
      )}

      {open && open.status !== "stopped" && (
        <div className="mt-5 grid grid-cols-2 gap-2">
          {open.status === "running" ? (
            <button disabled={busy} onClick={() => act.mutate({ action: "pause", id: open.id })} className="brutal brutal-press flex h-12 items-center justify-center gap-2 bg-background font-bold">
              <Pause className="size-4" /> Pause
            </button>
          ) : (
            <button disabled={busy} onClick={() => act.mutate({ action: "resume", id: open.id })} className="brutal brutal-press flex h-12 items-center justify-center gap-2 bg-primary font-bold text-primary-foreground">
              <Play className="size-4" /> Resume
            </button>
          )}
          <button disabled={busy} onClick={() => act.mutate({ action: "stop", id: open.id })} className="brutal brutal-press flex h-12 items-center justify-center gap-2 bg-destructive font-bold text-destructive-foreground">
            <Square className="size-4" /> Stop
          </button>
        </div>
      )}

      {open?.status === "stopped" && (
        <div className="mt-5 border-2 border-ink bg-secondary p-4">
          <p className="text-xs font-bold uppercase text-muted-foreground">Session summary</p>
          <p className="mt-1 font-display text-2xl">{formatDuration(open.focused_seconds)} focused</p>
          <p className="text-sm text-muted-foreground">
            {openDay?.title ?? "Topic"} · started{" "}
            {new Date(open.started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              disabled={busy || open.focused_seconds === 0}
              onClick={() => act.mutate({ action: "save", id: open.id }, { onSuccess: () => toast.success("Session saved") })}
              className="brutal brutal-press flex h-12 items-center justify-center gap-2 bg-success font-bold text-success-foreground disabled:opacity-50"
            >
              <Save className="size-4" /> Save session
            </button>
            <button
              disabled={busy}
              onClick={() => confirm("Discard this session? Its time will not count.") && act.mutate({ action: "discard", id: open.id })}
              className="brutal brutal-press flex h-12 items-center justify-center gap-2 bg-background font-bold"
            >
              <Trash2 className="size-4" /> Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
