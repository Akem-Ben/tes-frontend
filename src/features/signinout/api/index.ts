import type { SignInOut, Student } from "@/shared/lib/mockStore";
import { getDb, setDb } from "@/shared/lib/mockStore";
import { uid } from "@/shared/lib/format";
import { nowTime, todayISO } from "@/shared/lib/date";
import type { WindowStatus } from "./types";

export const listForDate = (date: string): SignInOut[] =>
  getDb().signInOuts.filter((s) => s.date === date);

export const listForStudent = (studentId: string): SignInOut[] =>
  getDb()
    .signInOuts.filter((s) => s.studentId === studentId)
    .sort((a, b) => b.date.localeCompare(a.date));

export const getRecord = (
  studentId: string,
  date: string,
): SignInOut | undefined =>
  getDb().signInOuts.find((s) => s.studentId === studentId && s.date === date);

/**
 * The daily priesthood-hour "slot" a facilitator sets for a student becomes active
 * automatically, every day, once the clock reaches its start time, and closes at its
 * end time - there is no separate row to pre-create, the window is just computed live.
 */
export const windowStatus = (
  student: Student,
  at: string = nowTime(),
): WindowStatus => {
  if (!student.hourOfPriesthood) return "none";
  const end = student.hourOfPriesthoodEnd ?? student.hourOfPriesthood;
  if (at < student.hourOfPriesthood) return "before";
  if (at > end) return "closed";
  return "active";
};

export const isWindowActive = (
  student: Student,
  at: string = nowTime(),
): boolean => windowStatus(student, at) === "active";

export const markSignIn = (
  studentId: string,
  date: string,
  time: string,
): void => upsert(studentId, date, { signedIn: true, timeIn: time });

export const markSignOut = (
  studentId: string,
  date: string,
  time: string,
): void => upsert(studentId, date, { signedOut: true, timeOut: time });

export const clearMark = (
  studentId: string,
  date: string,
  which: "in" | "out",
): void =>
  upsert(
    studentId,
    date,
    which === "in"
      ? { signedIn: false, timeIn: undefined }
      : { signedOut: false, timeOut: undefined },
  );

const upsert = (
  studentId: string,
  date: string,
  patch: Partial<SignInOut>,
): void =>
  setDb((db) => {
    const existing = db.signInOuts.find(
      (s) => s.studentId === studentId && s.date === date,
    );
    if (existing) {
      return {
        ...db,
        signInOuts: db.signInOuts.map((s) =>
          s.id === existing.id ? { ...s, ...patch } : s,
        ),
      };
    }
    const record: SignInOut = {
      id: uid("sio"),
      studentId,
      date: date || todayISO(),
      signedIn: false,
      signedOut: false,
      ...patch,
    };
    return { ...db, signInOuts: [...db.signInOuts, record] };
  });
