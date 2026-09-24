/**
 * Simulates the daily/weekly cron a real backend would run: recurring attendance
 * events and assignments automatically continue into the next week once their
 * current instance's time has passed. Idempotent - safe to call on every app load.
 */
import { getDb, setDb } from "./mockStore";
import { addDays, isPast } from "./date";

export const ensureRecurringAttendance = (): void => {
  const db = getDb();
  const bySeries = new Map<string, (typeof db.attendanceEvents)[number][]>();
  db.attendanceEvents.forEach((e) => {
    const list = bySeries.get(e.seriesId) ?? [];
    list.push(e);
    bySeries.set(e.seriesId, list);
  });

  const additions: (typeof db.attendanceEvents)[number][] = [];
  bySeries.forEach((instances) => {
    const latest = instances.reduce((a, b) => (a.date > b.date ? a : b));
    if (
      latest.recurrence === "weekly" &&
      isPast(latest.date) &&
      !latest.finishedAt
    ) {
      additions.push({
        ...latest,
        id: `${latest.seriesId}_${Date.now().toString(36)}`,
        date: `${addDays(latest.date.slice(0, 10), 7)}T${latest.date.slice(11)}`,
      });
    }
  });

  if (additions.length > 0) {
    setDb((current) => ({
      ...current,
      attendanceEvents: [...current.attendanceEvents, ...additions],
    }));
  }
};

export const ensureRecurringAssignments = (): void => {
  const db = getDb();
  const bySeries = new Map<string, (typeof db.assignments)[number][]>();
  db.assignments.forEach((a) => {
    const list = bySeries.get(a.seriesId) ?? [];
    list.push(a);
    bySeries.set(a.seriesId, list);
  });

  const additions: (typeof db.assignments)[number][] = [];
  bySeries.forEach((instances) => {
    const latest = instances.reduce((a, b) => (a.dueDate > b.dueDate ? a : b));
    if (
      latest.recurrence === "weekly" &&
      isPast(latest.dueDate) &&
      !latest.finishedAt
    ) {
      additions.push({
        ...latest,
        id: `${latest.seriesId}_${Date.now().toString(36)}`,
        dueDate: addDays(latest.dueDate, 7),
      });
    }
  });

  if (additions.length > 0) {
    setDb((current) => ({
      ...current,
      assignments: [...current.assignments, ...additions],
    }));
  }
};

/** Call once on app start, after hydrate(). */
export const ensureAllRecurring = (): void => {
  ensureRecurringAttendance();
  ensureRecurringAssignments();
};
