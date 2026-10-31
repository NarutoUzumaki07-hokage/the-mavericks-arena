import type { Tables, Enums } from "@/integrations/supabase/types";

export const APP_TIMEZONE = "Asia/Kolkata";
export const DAILY_GOAL_SECONDS = 30 * 60;

export type LearningDay = Tables<"learning_days">;
export type LearningTask = Tables<"learning_tasks">;
export type LearningResource = Tables<"learning_resources">;
export type TaskProgress = Tables<"member_task_progress">;
export type LearningSession = Tables<"learning_sessions">;
export type TaskStatus = Enums<"task_status">;

export type DayWithContent = LearningDay & {
  learning_tasks: LearningTask[];
  learning_resources: LearningResource[];
};

/** Calendar date (YYYY-MM-DD) of an instant in the app timezone. */
export function appDate(d: Date | string = new Date()): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function addDays(isoDate: string, n: number): string {
  const [y = 1970, m = 1, d = 1] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

export function taskStatus(progress: Map<string, TaskProgress>, taskId: string): TaskStatus {
  return progress.get(taskId)?.status ?? "todo";
}

export type DayState = {
  status: TaskStatus;
  done: number;
  total: number;
  percent: number;
  /** Intended date passed and the member hasn't finished it. */
  pending: boolean;
  /** Finished after its intended date. */
  late: boolean;
  completedAt: string | null;
};

export function dayState(
  day: DayWithContent,
  progress: Map<string, TaskProgress>,
  today: string,
): DayState {
  const tasks = day.learning_tasks;
  const total = tasks.length;
  const statuses = tasks.map((t) => taskStatus(progress, t.id));
  const done = statuses.filter((s) => s === "completed").length;
  let status: TaskStatus = "todo";
  if (total > 0 && done === total) status = "completed";
  else if (statuses.some((s) => s !== "todo")) status = "in_progress";

  let completedAt: string | null = null;
  if (status === "completed") {
    for (const t of tasks) {
      const c = progress.get(t.id)?.completed_at;
      if (c && (!completedAt || c > completedAt)) completedAt = c;
    }
  }
  const late = status === "completed" && !!completedAt && appDate(completedAt) > day.scheduled_date;
  const pending = status !== "completed" && day.scheduled_date < today;
  return { status, done, total, percent: total ? Math.round((done / total) * 100) : 0, pending, late, completedAt };
}

/** Seconds of saved focus per calendar date (credited date, never the topic's date). */
export function secondsByDate(sessions: Pick<LearningSession, "status" | "credited_date" | "focused_seconds">[]) {
  const map = new Map<string, number>();
  for (const s of sessions) {
    if (s.status !== "completed" || !s.credited_date) continue;
    map.set(s.credited_date, (map.get(s.credited_date) ?? 0) + s.focused_seconds);
  }
  return map;
}

/**
 * Consecutive dates meeting the daily goal, ending today. If today's goal is
 * not met yet, the streak still counts up to yesterday (today isn't missed yet).
 */
export function currentStreak(byDate: Map<string, number>, today: string): number {
  const met = (d: string) => (byDate.get(d) ?? 0) >= DAILY_GOAL_SECONDS;
  let cursor = met(today) ? today : addDays(today, -1);
  let streak = 0;
  while (met(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Live elapsed seconds for an open session, computed from stored timestamps. */
export function sessionElapsed(s: Pick<LearningSession, "accumulated_seconds" | "resumed_at" | "planned_seconds">, now = Date.now()) {
  const live = s.resumed_at ? Math.max(0, Math.floor((now - new Date(s.resumed_at).getTime()) / 1000)) : 0;
  return Math.min(s.accumulated_seconds + live, s.planned_seconds);
}

/** Which task statuses to write when a day card is moved to a Kanban column. */
export function kanbanMoveUpdates(
  tasks: LearningTask[],
  progress: Map<string, TaskProgress>,
  target: TaskStatus,
): { taskId: string; status: TaskStatus }[] {
  if (target === "completed") return tasks.map((t) => ({ taskId: t.id, status: "completed" }));
  if (target === "todo") return tasks.map((t) => ({ taskId: t.id, status: "todo" }));
  const statuses = tasks.map((t) => taskStatus(progress, t.id));
  if (statuses.some((s) => s === "in_progress")) return [];
  if (statuses.every((s) => s === "completed") && tasks.length) {
    const last = tasks[tasks.length - 1]!;
    return [{ taskId: last.id, status: "in_progress" }];
  }
  const firstTodo = tasks.find((t) => taskStatus(progress, t.id) === "todo");
  return firstTodo ? [{ taskId: firstTodo.id, status: "in_progress" }] : [];
}

export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h ? `${h}h ${m.toString().padStart(2, "0")}m` : `${m} min`;
}

export function isValidUrl(url: string) {
  try {
    const u = new URL(url);
    return (u.protocol === "http:" || u.protocol === "https:") && u.hostname.includes(".");
  } catch {
    return false;
  }
}

export function guessResourceType(url: string): Enums<"resource_type"> {
  if (/youtube\.com|youtu\.be/i.test(url)) return "youtube";
  if (/docs?\.|developer\.|mdn|\/docs\//i.test(url)) return "documentation";
  return "website";
}
