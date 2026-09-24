import { getDb } from "./mockStore";
import type { Student } from "./mockStore";

/**
 * A student is "redundant" only when they have no group, aren't in any waiting list, and
 * aren't in any cohort's pool - the moment any of those happens they drop out of this
 * list, so it's computed rather than stored.
 */
export const isRedundant = (student: Student): boolean => {
  const db = getDb();
  if (student.groupIds.length > 0) return false;
  if (db.waitingLists.some((w) => w.studentIds.includes(student.id)))
    return false;
  if (db.cohorts.some((s) => s.studentIds.includes(student.id))) return false;
  return true;
};

export const listRedundantStudents = (): Student[] =>
  getDb().students.filter(isRedundant);
