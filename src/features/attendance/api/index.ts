import type { AttendanceEvent, AttendanceRecord } from "@/shared/lib/mockStore";
import { uid } from "@/shared/lib/format";
import { isPast, todayISO } from "@/shared/lib/date";
import { getDb, setDb } from "@/shared/lib/mockStore";

export const listEvents = (groupId: string): AttendanceEvent[] =>
  getDb()
    .attendanceEvents.filter((e) => e.groupId === groupId)
    .sort((a, b) => b.date.localeCompare(a.date));

/** Every event across every facilitator - for president/admin org-wide views. */
export const listAllEvents = (): AttendanceEvent[] => getDb().attendanceEvents;

export const getEvent = (id: string): AttendanceEvent | undefined =>
  getDb().attendanceEvents.find((e) => e.id === id);

export const eventTypes = (groupId: string): string[] =>
  Array.from(new Set(listEvents(groupId).map((e) => e.type)));

export const createEvent = (
  input: Omit<AttendanceEvent, "id" | "seriesId">,
): AttendanceEvent => {
  const id = uid("att");
  const event: AttendanceEvent = { ...input, id, seriesId: id };
  setDb((db) => ({ ...db, attendanceEvents: [...db.attendanceEvents, event] }));
  return event;
};

/** General field edits (name, type, date, recurrence) - blocked once the week is finished. */
export const updateEvent = (
  id: string,
  patch: Partial<AttendanceEvent>,
): void =>
  setDb((db) => ({
    ...db,
    attendanceEvents: db.attendanceEvents.map((e) =>
      e.id === id && !e.finishedAt ? { ...e, ...patch } : e,
    ),
  }));

/** Adding students is only allowed up until the event's start time passes. */
export const addStudentsToEvent = (id: string, studentIds: string[]): void =>
  setDb((db) => ({
    ...db,
    attendanceEvents: db.attendanceEvents.map((e) => {
      if (e.id !== id || e.finishedAt || isPast(e.date)) return e;
      return {
        ...e,
        studentIds: Array.from(new Set([...e.studentIds, ...studentIds])),
      };
    }),
  }));

export const removeStudentFromEvent = (id: string, studentId: string): void =>
  setDb((db) => ({
    ...db,
    attendanceEvents: db.attendanceEvents.map((e) =>
      e.id === id && !e.finishedAt
        ? { ...e, studentIds: e.studentIds.filter((s) => s !== studentId) }
        : e,
    ),
  }));

/** Locks the week - facilitator/president/admin only (every signed-in role in this app). */
export const finishEvent = (id: string): void =>
  setDb((db) => ({
    ...db,
    attendanceEvents: db.attendanceEvents.map((e) =>
      e.id === id ? { ...e, finishedAt: todayISO() } : e,
    ),
  }));

export const deleteEvent = (id: string): void =>
  setDb((db) => ({
    ...db,
    attendanceEvents: db.attendanceEvents.filter((e) => e.id !== id),
    attendanceRecords: db.attendanceRecords.filter(
      (r) => r.attendanceEventId !== id,
    ),
  }));

export const listRecords = (eventId: string): AttendanceRecord[] =>
  getDb().attendanceRecords.filter((r) => r.attendanceEventId === eventId);

export const recordsForStudent = (studentId: string): AttendanceRecord[] =>
  getDb().attendanceRecords.filter((r) => r.studentId === studentId);

export const mark = (
  eventId: string,
  studentId: string,
  attended: boolean,
): void =>
  setDb((db) => {
    const event = db.attendanceEvents.find((e) => e.id === eventId);
    const date = (event?.date ?? "").slice(0, 10);
    const existing = db.attendanceRecords.find(
      (r) => r.attendanceEventId === eventId && r.studentId === studentId,
    );
    if (existing) {
      return {
        ...db,
        attendanceRecords: db.attendanceRecords.map((r) =>
          r.id === existing.id ? { ...r, attended } : r,
        ),
      };
    }
    const record: AttendanceRecord = {
      id: uid("rec"),
      attendanceEventId: eventId,
      studentId,
      date,
      attended,
    };
    return { ...db, attendanceRecords: [...db.attendanceRecords, record] };
  });

export const markAllPresent = (eventId: string): void => {
  const event = getEvent(eventId);
  if (!event) return;
  event.studentIds.forEach((studentId) => mark(eventId, studentId, true));
};
