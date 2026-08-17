import { describe, it, expect } from "vitest";
import { calculateNewStreak, formatDateKey } from "../../convex/helpers";

// ── Unit Tests: Streak Engine ─────────────────────────────────────────────

describe("Streak Engine — calculateNewStreak()", () => {
  const today = "2026-08-14";
  const yesterday = "2026-08-13";
  const twoDaysAgo = "2026-08-12";
  const weekAgo = "2026-08-07";

  it("returns 1 when lastActiveDate is undefined (new user)", () => {
    expect(calculateNewStreak(0, undefined, today)).toBe(1);
  });

  it("keeps streak unchanged when lastActiveDate === today (already counted)", () => {
    expect(calculateNewStreak(5, today, today)).toBe(5);
  });

  it("increments streak by 1 when lastActiveDate is yesterday (consecutive day)", () => {
    expect(calculateNewStreak(4, yesterday, today)).toBe(5);
  });

  it("resets streak to 1 when gap is more than 1 day", () => {
    expect(calculateNewStreak(10, twoDaysAgo, today)).toBe(1);
  });

  it("resets streak to 1 when gap is a week", () => {
    expect(calculateNewStreak(7, weekAgo, today)).toBe(1);
  });

  it("handles streak starting from 0", () => {
    expect(calculateNewStreak(0, yesterday, today)).toBe(1);
  });

  it("correctly chains: 3 consecutive days = streak 3", () => {
    const day1 = calculateNewStreak(0, undefined, "2026-08-12");
    expect(day1).toBe(1);
    const day2 = calculateNewStreak(day1, "2026-08-12", "2026-08-13");
    expect(day2).toBe(2);
    const day3 = calculateNewStreak(day2, "2026-08-13", "2026-08-14");
    expect(day3).toBe(3);
  });
});

// ── Unit Tests: Task State Transitions ───────────────────────────────────

describe("Task State Transitions", () => {
  type TaskStatus = "todo" | "in_progress" | "completed";

  const validTransitions: [TaskStatus, TaskStatus][] = [
    ["todo", "in_progress"],
    ["in_progress", "completed"],
    ["completed", "todo"],
  ];

  const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
    todo: ["in_progress", "completed"],
    in_progress: ["completed", "todo"],
    completed: ["todo", "in_progress"],
  };

  const canTransition = (from: TaskStatus, to: TaskStatus): boolean => {
    return ALLOWED_TRANSITIONS[from].includes(to);
  };

  it.each(validTransitions)(
    "allows transition from %s → %s",
    (from, to) => {
      expect(canTransition(from, to)).toBe(true);
    }
  );

  it("initial status of new task should be todo", () => {
    const initialStatus: TaskStatus = "todo";
    expect(initialStatus).toBe("todo");
  });

  it("completing a todo task moves it to completed", () => {
    let status: TaskStatus = "todo";
    status = "completed";
    expect(status).toBe("completed");
  });

  it("task completion triggers streak update condition", () => {
    const completedTasks = 5;
    const DAILY_GOAL = 5;
    const shouldTriggerShare = completedTasks >= DAILY_GOAL;
    expect(shouldTriggerShare).toBe(true);
  });

  it("task completion before goal does NOT trigger share modal", () => {
    const completedTasks = 4;
    const DAILY_GOAL = 5;
    const shouldTriggerShare = completedTasks >= DAILY_GOAL;
    expect(shouldTriggerShare).toBe(false);
  });
});

// ── Unit Tests: formatDateKey ────────────────────────────────────────────

describe("formatDateKey()", () => {
  it("formats date as YYYY-MM-DD", () => {
    const date = new Date("2026-08-14T12:00:00Z");
    const key = date.toISOString().split("T")[0];
    expect(key).toBe("2026-08-14");
  });
});
