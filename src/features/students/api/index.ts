import type { Student } from "@/shared/lib/mockStore";
import type { NewStudent } from "./types";
import { registrationNumber, uid } from "@/shared/lib/format";
import { todayISO } from "@/shared/lib/date";
import { getDb, setDb } from "@/shared/lib/mockStore";

const plusHour = (hhmm: string): string => {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  return `${String((h + 1) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const listStudents = (groupId?: string): Student[] =>
  getDb().students.filter((s) =>
    groupId ? s.groupIds.includes(groupId) : true,
  );

export const listAllStudents = (): Student[] => getDb().students;

export const getStudent = (id: string): Student | undefined =>
  getDb().students.find((s) => s.id === id);

/** Bulk add - each new student gets a unique registration number for the group. */
export const addStudents = (groupId: string, rows: NewStudent[]): Student[] => {
  const db = getDb();
  const group = db.groups.find((g) => g.id === groupId);
  const sequence = group?.sequence ?? 1;
  let index = db.students.filter((s) => s.groupIds.includes(groupId)).length;
  const created = rows.map((row) => {
    index += 1;
    const hourOfPriesthood = row.hourOfPriesthood || undefined;
    return {
      id: uid("stu"),
      name: row.name.trim(),
      phone: row.phone.trim(),
      registrationNumber: registrationNumber(sequence, index),
      groupIds: [groupId],
      hourOfPriesthood,
      hourOfPriesthoodEnd: hourOfPriesthood
        ? row.hourOfPriesthoodEnd || plusHour(hourOfPriesthood)
        : undefined,
      dateJoined: todayISO(),
      isActive: true,
    } satisfies Student;
  });
  setDb((current) => ({
    ...current,
    students: [...current.students, ...created],
  }));
  return created;
};

/**
 * Creates brand-new students with no group at all - used when a facilitator sends new
 * students to the waiting list, or leaves them unassigned (redundant), instead of adding
 * them straight to their own group.
 */
export const createStudentsInPool = (rows: NewStudent[]): Student[] => {
  const db = getDb();
  let index = db.students.filter((s) => s.groupIds.length === 0).length;
  const created = rows.map((row) => {
    index += 1;
    const hourOfPriesthood = row.hourOfPriesthood || undefined;
    return {
      id: uid("stu"),
      name: row.name.trim(),
      phone: row.phone.trim(),
      registrationNumber: registrationNumber(0, index),
      groupIds: [],
      hourOfPriesthood,
      hourOfPriesthoodEnd: hourOfPriesthood
        ? row.hourOfPriesthoodEnd || plusHour(hourOfPriesthood)
        : undefined,
      dateJoined: todayISO(),
      isActive: true,
    } satisfies Student;
  });
  setDb((current) => ({
    ...current,
    students: [...current.students, ...created],
  }));
  return created;
};

export const updateStudent = (id: string, patch: Partial<Student>): void =>
  setDb((db) => ({
    ...db,
    students: db.students.map((s) => (s.id === id ? { ...s, ...patch } : s)),
  }));

export const toggleActive = (id: string): void =>
  setDb((db) => ({
    ...db,
    students: db.students.map((s) =>
      s.id === id ? { ...s, isActive: !s.isActive } : s,
    ),
  }));

/**
 * A student can be in several groups, but never two groups in the same cohort -
 * throws if the target group's cohort already has a group they belong to, so the
 * caller must remove them from the conflicting group first.
 */
export const addStudentToGroup = (studentId: string, groupId: string): void => {
  const db = getDb();
  const targetGroup = db.groups.find((g) => g.id === groupId);
  if (!targetGroup) throw new Error("Group not found.");
  const student = db.students.find((s) => s.id === studentId);
  if (!student) throw new Error("Student not found.");
  if (student.groupIds.includes(groupId)) return;
  const conflict = student.groupIds
    .map((gid) => db.groups.find((g) => g.id === gid))
    .find((g) => g && g.cohortId === targetGroup.cohortId);
  if (conflict) {
    throw new Error(
      `${student.name} is already in "${conflict.name}" for this cohort. Remove them from it first.`,
    );
  }
  setDb((current) => ({
    ...current,
    students: current.students.map((s) =>
      s.id === studentId ? { ...s, groupIds: [...s.groupIds, groupId] } : s,
    ),
  }));
};

export const removeStudentFromGroup = (
  studentId: string,
  groupId: string,
): void =>
  setDb((db) => ({
    ...db,
    students: db.students.map((s) =>
      s.id === studentId
        ? { ...s, groupIds: s.groupIds.filter((g) => g !== groupId) }
        : s,
    ),
  }));

export const activeStudents = (groupId: string): Student[] =>
  listStudents(groupId).filter((s) => s.isActive);

/** Permanently removes a student and every record that references them. */
export const deleteStudent = (id: string): void =>
  setDb((db) => ({
    ...db,
    students: db.students.filter((s) => s.id !== id),
    signInOuts: db.signInOuts.filter((r) => r.studentId !== id),
    attendanceRecords: db.attendanceRecords.filter((r) => r.studentId !== id),
    submissions: db.submissions.filter((s) => s.studentId !== id),
    payments: db.payments.filter((p) => p.studentId !== id),
    retreatAttendance: db.retreatAttendance.filter((r) => r.studentId !== id),
    weeklyClassAttendance: db.weeklyClassAttendance.filter(
      (r) => r.studentId !== id,
    ),
    feedback: db.feedback.filter((f) => f.studentId !== id),
    attendanceEvents: db.attendanceEvents.map((e) => ({
      ...e,
      studentIds: e.studentIds.filter((s) => s !== id),
    })),
    assignments: db.assignments.map((a) => ({
      ...a,
      studentIds: a.studentIds.filter((s) => s !== id),
    })),
    retreats: db.retreats.map((r) => ({
      ...r,
      studentIds: r.studentIds.filter((s) => s !== id),
    })),
    weeklyClasses: db.weeklyClasses.map((c) => ({
      ...c,
      studentIds: c.studentIds.filter((s) => s !== id),
    })),
    waitingLists: db.waitingLists.map((w) => ({
      ...w,
      studentIds: w.studentIds.filter((s) => s !== id),
    })),
    cohorts: db.cohorts.map((cohort) => ({
      ...cohort,
      studentIds: cohort.studentIds.filter((s) => s !== id),
    })),
  }));
