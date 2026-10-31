import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  appDate,
  currentStreak,
  dayState,
  secondsByDate,
  type DayWithContent,
  type LearningSession,
  type TaskProgress,
  type TaskStatus,
} from "@/lib/learning";

export const roadmapQuery = queryOptions({
  queryKey: ["roadmap"],
  queryFn: async (): Promise<DayWithContent[]> => {
    const { data, error } = await supabase
      .from("learning_days")
      .select("*, learning_tasks(*), learning_resources(*)")
      .order("position")
      .order("created_at");
    if (error) throw error;
    return (data as DayWithContent[]).map((d) => ({
      ...d,
      learning_tasks: [...d.learning_tasks].sort((a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at)),
      learning_resources: [...d.learning_resources].sort((a, b) => a.created_at.localeCompare(b.created_at)),
    }));
  },
});

/** RLS returns only the signed-in member's own rows. */
export const myProgressQuery = queryOptions({
  queryKey: ["my-progress"],
  queryFn: async (): Promise<TaskProgress[]> => {
    const { data, error } = await supabase.from("member_task_progress").select("*");
    if (error) throw error;
    return data;
  },
});

export const mySessionsQuery = queryOptions({
  queryKey: ["my-sessions"],
  queryFn: async (): Promise<LearningSession[]> => {
    const { data, error } = await supabase
      .from("learning_sessions")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(1000);
    if (error) throw error;
    return data;
  },
});

export function useRoadmap() {
  return useSuspenseQuery(roadmapQuery).data;
}

export function useProgressMap() {
  const rows = useSuspenseQuery(myProgressQuery).data;
  return useMemo(() => new Map(rows.map((r) => [r.task_id, r])), [rows]);
}

export function useMySessions() {
  return useSuspenseQuery(mySessionsQuery).data;
}

export function useOpenSession() {
  const sessions = useMySessions();
  return sessions.find((s) => s.status === "running" || s.status === "paused" || s.status === "stopped") ?? null;
}

export function useDailyStats() {
  const sessions = useMySessions();
  const days = useRoadmap();
  const progress = useProgressMap();
  const today = appDate();
  return useMemo(() => {
    const byDate = secondsByDate(sessions);
    const pending = days.filter((d) => dayState(d, progress, today).pending).length;
    return {
      today,
      todaySeconds: byDate.get(today) ?? 0,
      streak: currentStreak(byDate, today),
      pending,
      byDate,
    };
  }, [sessions, days, progress, today]);
}

function errMsg(e: unknown) {
  return e instanceof Error ? e.message : (e as { message?: string })?.message ?? "Something went wrong";
}

export function useSetTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: { taskId: string; status: TaskStatus }[]) => {
      if (!updates.length) return;
      const { error } = await supabase.from("member_task_progress").upsert(
        updates.map((u) => ({ task_id: u.taskId, status: u.status })),
        { onConflict: "member_id,task_id" },
      );
      if (error) throw error;
    },
    onMutate: async (updates) => {
      await qc.cancelQueries({ queryKey: ["my-progress"] });
      const prev = qc.getQueryData<TaskProgress[]>(["my-progress"]);
      if (prev) {
        const map = new Map(prev.map((p) => [p.task_id, p]));
        for (const u of updates) {
          const existing = map.get(u.taskId);
          map.set(u.taskId, {
            ...(existing ?? { id: `tmp-${u.taskId}`, member_id: "", task_id: u.taskId, updated_at: new Date().toISOString() }),
            status: u.status,
            completed_at: u.status === "completed" ? existing?.completed_at ?? new Date().toISOString() : null,
          } as TaskProgress);
        }
        qc.setQueryData(["my-progress"], [...map.values()]);
      }
      return { prev };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["my-progress"], ctx.prev);
      toast.error(errMsg(e));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["my-progress"] }),
  });
}

/** Generic roadmap write that refreshes the shared roadmap afterwards. */
export function useRoadmapMutation<T>(fn: (input: T) => Promise<unknown>, success?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: T) => {
      const res = (await fn(input)) as { error?: unknown } | undefined;
      if (res && res.error) throw res.error;
    },
    onSuccess: () => success && toast.success(success),
    onError: (e) => toast.error(errMsg(e)),
    onSettled: () => qc.invalidateQueries({ queryKey: ["roadmap"] }),
  });
}

type SessionAction = "start" | "pause" | "resume" | "stop" | "save" | "discard";

export function useSessionAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (a: { action: SessionAction; id?: string; dayId?: string | null; plannedSeconds?: number }) => {
      let res;
      switch (a.action) {
        case "start":
          res = await supabase.rpc("start_session", { _day_id: a.dayId as string, _planned_seconds: a.plannedSeconds! });
          break;
        case "pause":
          res = await supabase.rpc("pause_session", { _id: a.id! });
          break;
        case "resume":
          res = await supabase.rpc("resume_session", { _id: a.id! });
          break;
        case "stop":
          res = await supabase.rpc("stop_session", { _id: a.id! });
          break;
        case "save":
          res = await supabase.rpc("save_session", { _id: a.id! });
          break;
        case "discard":
          res = await supabase.rpc("discard_session", { _id: a.id! });
          break;
      }
      if (res.error) throw res.error;
    },
    onError: (e) => toast.error(errMsg(e)),
    onSettled: () => qc.invalidateQueries({ queryKey: ["my-sessions"] }),
  });
}

export function useCorrectSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (a: { id: string; newSeconds: number; reason: string }) => {
      const { error } = await supabase.rpc("correct_session", { _id: a.id, _new_seconds: a.newSeconds, _reason: a.reason });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Session corrected"),
    onError: (e) => toast.error(errMsg(e)),
    onSettled: () => qc.invalidateQueries({ queryKey: ["my-sessions"] }),
  });
}
