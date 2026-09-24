import type { RetreatAttendance, RetreatEvent } from "@/shared/lib/mockStore";
import { getDb, setDb } from "@/shared/lib/mockStore";
import { uid } from "@/shared/lib/format";
import { todayISO } from "@/shared/lib/date";

export const listRetreats = (groupId: string): RetreatEvent[] =>
  getDb()
    .retreats.filter((r) => r.groupId === groupId)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

export const listAllRetreats = (): RetreatEvent[] => getDb().retreats;

export const getRetreat = (id: string): RetreatEvent | undefined =>
  getDb().retreats.find((r) => r.id === id);

export const createRetreat = (
  input: Omit<RetreatEvent, "id">,
): RetreatEvent => {
  const retreat: RetreatEvent = { ...input, id: uid("ret") };
  setDb((db) => ({ ...db, retreats: [...db.retreats, retreat] }));
  return retreat;
};

export const updateRetreat = (id: string, patch: Partial<RetreatEvent>): void =>
  setDb((db) => ({
    ...db,
    retreats: db.retreats.map((r) =>
      r.id === id && !r.finishedAt ? { ...r, ...patch } : r,
    ),
  }));

export const finishRetreat = (id: string): void =>
  setDb((db) => ({
    ...db,
    retreats: db.retreats.map((r) =>
      r.id === id ? { ...r, finishedAt: todayISO() } : r,
    ),
  }));

export const deleteRetreat = (id: string): void =>
  setDb((db) => ({
    ...db,
    retreats: db.retreats.filter((r) => r.id !== id),
    retreatAttendance: db.retreatAttendance.filter((a) => a.retreatId !== id),
  }));

export const retreatAttendance = (retreatId: string): RetreatAttendance[] =>
  getDb().retreatAttendance.filter((a) => a.retreatId === retreatId);

export const markRetreatAttendance = (
  retreatId: string,
  studentId: string,
  attended: boolean,
): void =>
  setDb((db) => {
    const existing = db.retreatAttendance.find(
      (a) => a.retreatId === retreatId && a.studentId === studentId,
    );
    if (existing) {
      return {
        ...db,
        retreatAttendance: db.retreatAttendance.map((a) =>
          a.id === existing.id ? { ...a, attended } : a,
        ),
      };
    }
    const record: RetreatAttendance = {
      id: uid("rta"),
      retreatId,
      studentId,
      attended,
    };
    return { ...db, retreatAttendance: [...db.retreatAttendance, record] };
  });
