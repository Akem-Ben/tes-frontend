export const todayISO = (): string => new Date().toISOString().slice(0, 10);

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const nowTime = (): string => new Date().toTimeString().slice(0, 5);

/** Inclusive date-range check on YYYY-MM-DD strings. */
export const inRange = (date: string, from: string, to: string): boolean =>
  date >= from && date <= to;

export type TimeFilter = "weekly" | "monthly" | "session";

/** Start date (YYYY-MM-DD) for a time filter. "session" means all time. */
export const filterStart = (filter: TimeFilter): string => {
  if (filter === "session") return "0000-01-01";
  const d = new Date();
  d.setDate(d.getDate() - (filter === "weekly" ? 7 : 30));
  return d.toISOString().slice(0, 10);
};

export const addDays = (iso: string, days: number): string => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

/** Monday-Sunday boundaries (YYYY-MM-DD) for the week containing `date`. */
export const getWeekRange = (
  date: Date = new Date(),
): { start: string; end: string } => {
  const day = date.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: monday.toISOString().slice(0, 10),
    end: sunday.toISOString().slice(0, 10),
  };
};

/** ISO-ish week key ("2026-W08") used to identify a period for recurrence and payments. */
export const weekKeyOf = (iso: string): string => {
  const date = new Date(iso);
  const target = new Date(date.getTime());
  target.setHours(0, 0, 0, 0);
  // Thursday-based ISO week number.
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const week =
    1 +
    Math.round(
      ((target.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getDay() + 6) % 7)) /
        7,
    );
  return `${target.getFullYear()}-W${String(week).padStart(2, "0")}`;
};

export const currentWeekKey = (): string => weekKeyOf(todayISO());

/** True once `iso` (a date or datetime string) is strictly in the past. */
export const isPast = (iso: string): boolean =>
  new Date(iso).getTime() < Date.now();

export const monthKeyOf = (iso: string): string => iso.slice(0, 7); // YYYY-MM
