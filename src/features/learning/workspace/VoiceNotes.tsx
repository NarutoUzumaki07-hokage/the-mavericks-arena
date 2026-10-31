import { useEffect, useRef, useState } from "react";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Mic, Pause, Play, Square, Download, Trash2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { ownFolder, signedUrl } from "./storage";

type Voice = Tables<"voice_notes">;
const BUCKET = "voice-notes";

const voiceQuery = (dayId: string) =>
  queryOptions({
    queryKey: ["voice", dayId],
    queryFn: async (): Promise<Voice[]> => {
      const { data, error } = await supabase.from("voice_notes").select("*").eq("learning_day_id", dayId).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function VoiceNotes({ dayId }: { dayId: string }) {
  const notes = useSuspenseQuery(voiceQuery(dayId)).data;
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["voice", dayId] });
  const [state, setState] = useState<"idle" | "recording" | "paused" | "uploading">("idle");
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timing = useRef({ acc: 0, since: 0 });

  const supported = typeof window !== "undefined" && "MediaRecorder" in window && !!navigator.mediaDevices?.getUserMedia;

  useEffect(() => {
    if (state !== "recording") return;
    const t = setInterval(() => setElapsed(Math.floor((timing.current.acc + Date.now() - timing.current.since) / 1000)), 250);
    return () => clearInterval(t);
  }, [state]);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find((m) => MediaRecorder.isTypeSupported(m));
      const r = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunks.current = [];
      r.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        void upload(new Blob(chunks.current, { type: r.mimeType || "audio/webm" }));
      };
      r.start(1000);
      rec.current = r;
      timing.current = { acc: 0, since: Date.now() };
      setElapsed(0);
      setState("recording");
    } catch (e) {
      setError(e instanceof DOMException && e.name === "NotAllowedError" ? "Microphone access was denied. Allow it in your browser settings to record." : "Couldn't start the microphone.");
    }
  };
  const pause = () => {
    rec.current?.pause();
    timing.current.acc += Date.now() - timing.current.since;
    setState("paused");
  };
  const resume = () => {
    rec.current?.resume();
    timing.current.since = Date.now();
    setState("recording");
  };
  const stop = () => {
    if (state === "recording") timing.current.acc += Date.now() - timing.current.since;
    setElapsed(Math.floor(timing.current.acc / 1000));
    setState("uploading");
    rec.current?.stop();
  };

  const upload = async (blob: Blob) => {
    try {
      const folder = await ownFolder();
      const ext = blob.type.includes("mp4") ? "m4a" : blob.type.includes("ogg") ? "ogg" : "webm";
      const path = `${folder}/${dayId}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: blob.type });
      if (up.error) throw up.error;
      const name = `Recording ${new Date().toLocaleString()}`;
      const { error } = await supabase.from("voice_notes").insert({
        learning_day_id: dayId, file_path: path, file_name: name, mime_type: blob.type,
        duration_seconds: Math.max(1, Math.floor(timing.current.acc / 1000)),
      });
      if (error) throw error;
      toast.success("Voice note saved");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setState("idle");
    }
  };

  return (
    <div className="space-y-4">
      <div className="brutal bg-card p-4">
        {!supported ? (
          <p className="text-sm font-bold text-destructive">Voice recording isn't supported in this browser.</p>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 font-display text-2xl tabular-nums">
              {state === "recording" && <span className="size-3 animate-pulse rounded-full bg-destructive" />}
              {fmt(elapsed)}
            </div>
            {state === "idle" && (
              <button onClick={start} className="brutal brutal-press flex h-11 items-center gap-2 bg-destructive px-4 font-bold text-destructive-foreground"><Mic className="size-4" /> Record</button>
            )}
            {state === "recording" && (
              <button onClick={pause} className="brutal brutal-press flex h-11 items-center gap-2 bg-background px-4 font-bold"><Pause className="size-4" /> Pause</button>
            )}
            {state === "paused" && (
              <button onClick={resume} className="brutal brutal-press flex h-11 items-center gap-2 bg-primary px-4 font-bold text-primary-foreground"><Play className="size-4" /> Resume</button>
            )}
            {(state === "recording" || state === "paused") && (
              <button onClick={stop} className="brutal brutal-press flex h-11 items-center gap-2 bg-ink px-4 font-bold text-primary-foreground"><Square className="size-4" /> Stop &amp; save</button>
            )}
            {state === "uploading" && <span className="text-sm font-bold">Saving…</span>}
          </div>
        )}
        {error && <p role="alert" className="mt-2 text-sm font-bold text-destructive">{error}</p>}
        <p className="mt-2 text-xs text-muted-foreground">Recordings are private to you.</p>
      </div>

      {notes.length === 0 && <p className="text-sm text-muted-foreground">No voice notes yet.</p>}
      <ul className="space-y-3">
        {notes.map((n) => (
          <VoiceItem key={n.id} note={n} onChange={refresh} />
        ))}
      </ul>
    </div>
  );
}

function VoiceItem({ note, onChange }: { note: Voice; onChange: () => void }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    signedUrl(BUCKET, note.file_path).then(setSrc).catch(() => setSrc(null));
  }, [note.file_path]);

  const rename = async () => {
    const name = prompt("Rename recording", note.file_name)?.trim();
    if (!name) return;
    const { error } = await supabase.from("voice_notes").update({ file_name: name }).eq("id", note.id);
    if (error) return toast.error(error.message);
    onChange();
  };
  const remove = async () => {
    if (!confirm("Delete this recording?")) return;
    await supabase.storage.from(BUCKET).remove([note.file_path]);
    const { error } = await supabase.from("voice_notes").delete().eq("id", note.id);
    if (error) return toast.error(error.message);
    onChange();
  };
  const download = async () => {
    const ext = note.file_path.split(".").pop();
    window.open(await signedUrl(BUCKET, note.file_path, `${note.file_name}.${ext}`), "_blank");
  };

  return (
    <li className="border-2 border-ink bg-background p-3">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{note.file_name}</p>
          <p className="text-xs text-muted-foreground">{fmt(note.duration_seconds)} · {new Date(note.created_at).toLocaleString()}</p>
        </div>
        <button onClick={rename} aria-label="Rename" className="grid size-9 shrink-0 place-items-center border-2 border-ink"><Pencil className="size-4" /></button>
        <button onClick={download} aria-label="Download" className="grid size-9 shrink-0 place-items-center border-2 border-ink"><Download className="size-4" /></button>
        <button onClick={remove} aria-label="Delete" className="grid size-9 shrink-0 place-items-center border-2 border-ink text-destructive"><Trash2 className="size-4" /></button>
      </div>
      {src && <audio controls src={src} className="mt-2 w-full" preload="metadata" />}
    </li>
  );
}
