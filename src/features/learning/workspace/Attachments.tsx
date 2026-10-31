import { useRef, useState } from "react";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Download, Eye, Pencil, Trash2, Upload, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { ownFolder, signedUrl, uploadWithProgress } from "./storage";

type Attachment = Tables<"attachments">;
const BUCKET = "attachments";
const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED = [".pdf", ".png", ".jpg", ".jpeg", ".doc", ".docx", ".txt"];
const PREVIEWABLE = /^(image\/|application\/pdf|text\/plain)/;

const attachmentsQuery = (dayId: string) =>
  queryOptions({
    queryKey: ["attachments", dayId],
    queryFn: async (): Promise<Attachment[]> => {
      const { data, error } = await supabase.from("attachments").select("*").eq("learning_day_id", dayId).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

const size = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.ceil(b / 1024)} KB`);

export function Attachments({ dayId }: { dayId: string }) {
  const files = useSuspenseQuery(attachmentsQuery(dayId)).data;
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["attachments", dayId] });
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const onFile = async (file: File) => {
    const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
    if (!ALLOWED.includes(ext)) return toast.error("Allowed: PDF, PNG, JPG, DOC, DOCX, TXT");
    if (file.size > MAX_BYTES) return toast.error("Files must be 20 MB or smaller");
    try {
      setProgress(0);
      const path = `${await ownFolder()}/${dayId}/${crypto.randomUUID()}${ext}`;
      await uploadWithProgress(BUCKET, path, file, setProgress);
      const { error } = await supabase.from("attachments").insert({
        learning_day_id: dayId, file_path: path, file_name: file.name, mime_type: file.type || "application/octet-stream", size_bytes: file.size,
      });
      if (error) throw error;
      toast.success("File uploaded");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  };

  const open = async (f: Attachment, download: boolean) => {
    try {
      window.open(await signedUrl(BUCKET, f.file_path, download ? f.file_name : undefined), "_blank", "noopener");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open file");
    }
  };
  const rename = async (f: Attachment) => {
    const name = prompt("Rename file", f.file_name)?.trim();
    if (!name) return;
    const { error } = await supabase.from("attachments").update({ file_name: name }).eq("id", f.id);
    if (error) return toast.error(error.message);
    refresh();
  };
  const remove = async (f: Attachment) => {
    if (!confirm(`Delete "${f.file_name}"?`)) return;
    await supabase.storage.from(BUCKET).remove([f.file_path]);
    const { error } = await supabase.from("attachments").delete().eq("id", f.id);
    if (error) return toast.error(error.message);
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="brutal bg-card p-4">
        <input ref={input} type="file" accept={ALLOWED.join(",")} className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        <button disabled={progress !== null} onClick={() => input.current?.click()} className="brutal brutal-press flex h-11 items-center gap-2 bg-primary px-4 font-bold text-primary-foreground disabled:opacity-60">
          <Upload className="size-4" /> Upload file
        </button>
        {progress !== null && (
          <div className="mt-3">
            <div className="h-3 border-2 border-ink"><div className="h-full bg-primary" style={{ width: `${progress}%` }} /></div>
            <p className="mt-1 text-xs font-bold">{progress}%</p>
          </div>
        )}
        <p className="mt-2 text-xs text-muted-foreground">PDF, PNG, JPG, DOC, DOCX or TXT · up to 20 MB · private to you.</p>
      </div>
      {files.length === 0 && <p className="text-sm text-muted-foreground">No attachments yet.</p>}
      <ul className="space-y-2">
        {files.map((f) => (
          <li key={f.id} className="flex items-center gap-2 border-2 border-ink bg-background p-3">
            <FileText className="size-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{f.file_name}</p>
              <p className="text-xs text-muted-foreground">{size(f.size_bytes)} · {new Date(f.created_at).toLocaleString()}</p>
            </div>
            {PREVIEWABLE.test(f.mime_type) && (
              <button onClick={() => open(f, false)} aria-label="Preview" className="grid size-9 shrink-0 place-items-center border-2 border-ink"><Eye className="size-4" /></button>
            )}
            <button onClick={() => open(f, true)} aria-label="Download" className="grid size-9 shrink-0 place-items-center border-2 border-ink"><Download className="size-4" /></button>
            <button onClick={() => rename(f)} aria-label="Rename" className="grid size-9 shrink-0 place-items-center border-2 border-ink"><Pencil className="size-4" /></button>
            <button onClick={() => remove(f)} aria-label="Delete" className="grid size-9 shrink-0 place-items-center border-2 border-ink text-destructive"><Trash2 className="size-4" /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}
