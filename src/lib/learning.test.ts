import { describe, expect, it } from "vitest";
import { currentStreak, dayState, kanbanMoveUpdates, secondsByDate, sessionElapsed, type DayWithContent, type TaskProgress } from "./learning";

const day = (scheduled: string, ids: string[]): DayWithContent =>
  ({
    id: "d", scheduled_date: scheduled, learning_resources: [],
    learning_tasks: ids.map((id, i) => ({ id, day_id: "d", position: i, title: id })),
  }) as unknown as DayWithContent;
const prog = (rows: Partial<TaskProgress>[]) => new Map(rows.map((r) => [r.task_id!, r as TaskProgress]));

describe("learning rules", () => {
  it("completing a day after its intended date marks it Completed Late", () => {
    const s = dayState(day("2026-10-30", ["a"]), prog([{ task_id: "a", status: "completed", completed_at: "2026-10-31T06:00:00Z" }]), "2026-10-31");
    expect(s.status).toBe("completed");
    expect(s.late).toBe(true);
  });

  it("an unfinished day from an earlier date stays pending", () => {
    const s = dayState(day("2026-10-30", ["a", "b"]), prog([{ task_id: "a", status: "completed", completed_at: "2026-10-30T06:00:00Z" }]), "2026-10-31");
    expect(s.pending).toBe(true);
    expect(s.status).toBe("in_progress");
  });

  it("minutes are credited to the date studied, not the topic date", () => {
    const m = secondsByDate([
      { status: "completed", credited_date: "2026-10-31", focused_seconds: 1200 },
      { status: "completed", credited_date: "2026-10-31", focused_seconds: 1500 },
      { status: "discarded", credited_date: null, focused_seconds: 0 },
    ]);
    expect(m.get("2026-10-31")).toBe(2700);
    expect(m.get("2026-10-30")).toBeUndefined();
  });

  it("streak counts consecutive days with at least 30 minutes and resets on a miss", () => {
    const m = new Map([["2026-10-31", 1800], ["2026-10-30", 2400], ["2026-10-28", 3600]]);
    expect(currentStreak(m, "2026-10-31")).toBe(2);
    expect(currentStreak(new Map([["2026-10-31", 1799]]), "2026-10-31")).toBe(0);
  });

  it("paused time is not counted", () => {
    expect(sessionElapsed({ accumulated_seconds: 600, resumed_at: null, planned_seconds: 1800 }, Date.now() + 999_999)).toBe(600);
  });

  it("moving a card to Completed only writes the given tasks", () => {
    expect(kanbanMoveUpdates(day("2026-10-30", ["a", "b"]).learning_tasks, new Map(), "completed")).toHaveLength(2);
  });
});
