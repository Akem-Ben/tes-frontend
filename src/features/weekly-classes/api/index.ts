import type {
  WeeklyClass,
  WeeklyClassAttendance,
} from "@/shared/lib/mockStore";
import { getDb, setDb } from "@/shared/lib/mockStore";
import { uid } from "@/shared/lib/format";

export const listClasses = (groupId: string): WeeklyClass[] =>
  getDb()
    .weeklyClasses.filter((c) => c.groupId === groupId)
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek);

/** Every weekly class across every facilitator - for president/admin org-wide views. */
export const listAllClasses = (): WeeklyClass[] => getDb().weeklyClasses;

export const getClass = (id: string): WeeklyClass | undefined =>
  getDb().weeklyClasses.find((c) => c.id === id);

export const createClass = (
  input: Omit<WeeklyClass, "id" | "isActive">,
): WeeklyClass => {
  const weeklyClass: WeeklyClass = { ...input, id: uid("wc"), isActive: true };
  setDb((db) => ({ ...db, weeklyClasses: [...db.weeklyClasses, weeklyClass] }));
  return weeklyClass;
};

export const updateClass = (id: string, patch: Partial<WeeklyClass>): void =>
  setDb((db) => ({
    ...db,
    weeklyClasses: db.weeklyClasses.map((c) =>
      c.id === id ? { ...c, ...patch } : c,
    ),
  }));

export const deleteClass = (id: string): void =>
  setDb((db) => ({
    ...db,
    weeklyClasses: db.weeklyClasses.filter((c) => c.id !== id),
    weeklyClassAttendance: db.weeklyClassAttendance.filter(
      (r) => r.weeklyClassId !== id,
    ),
  }));

export const attendanceForClassDate = (
  classId: string,
  date: string,
): WeeklyClassAttendance[] =>
  getDb().weeklyClassAttendance.filter(
    (r) => r.weeklyClassId === classId && r.date === date,
  );

export const attendanceForStudent = (
  studentId: string,
): WeeklyClassAttendance[] =>
  getDb().weeklyClassAttendance.filter((r) => r.studentId === studentId);

export const markAttendance = (
  classId: string,
  studentId: string,
  date: string,
  attended: boolean,
): void =>
  setDb((db) => {
    const existing = db.weeklyClassAttendance.find(
      (r) =>
        r.weeklyClassId === classId &&
        r.studentId === studentId &&
        r.date === date,
    );
    if (existing) {
      return {
        ...db,
        weeklyClassAttendance: db.weeklyClassAttendance.map((r) =>
          r.id === existing.id ? { ...r, attended } : r,
        ),
      };
    }
    const record: WeeklyClassAttendance = {
      id: uid("wca"),
      weeklyClassId: classId,
      studentId,
      date,
      attended,
    };
    return {
      ...db,
      weeklyClassAttendance: [...db.weeklyClassAttendance, record],
    };
  });

export const markAllPresent = (classId: string, date: string): void => {
  const weeklyClass = getClass(classId);
  if (!weeklyClass) return;
  weeklyClass.studentIds.forEach((studentId) =>
    markAttendance(classId, studentId, date, true),
  );
};
