import type { Assignment, AssignmentSubmission } from "@/shared/lib/mockStore";
import { uid } from "@/shared/lib/format";
import { todayISO } from "@/shared/lib/date";
import { getDb, setDb } from "@/shared/lib/mockStore";

export const listAssignments = (groupId: string): Assignment[] =>
  getDb()
    .assignments.filter((a) => a.groupId === groupId)
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate));

/** Every assignment across every facilitator - for president/admin org-wide views. */
export const listAllAssignments = (): Assignment[] => getDb().assignments;

export const getAssignment = (id: string): Assignment | undefined =>
  getDb().assignments.find((a) => a.id === id);

export const assignmentTypes = (groupId: string): string[] =>
  Array.from(new Set(listAssignments(groupId).map((a) => a.type)));

export const createAssignment = (
  input: Omit<Assignment, "id" | "seriesId">,
): Assignment => {
  const id = uid("asg");
  const assignment: Assignment = { ...input, id, seriesId: id };
  setDb((db) => ({ ...db, assignments: [...db.assignments, assignment] }));
  return assignment;
};

export const updateAssignment = (
  id: string,
  patch: Partial<Assignment>,
): void =>
  setDb((db) => ({
    ...db,
    assignments: db.assignments.map((a) =>
      a.id === id && !a.finishedAt ? { ...a, ...patch } : a,
    ),
  }));

/** Locks the week - facilitator/president/admin only (every signed-in role in this app). */
export const finishAssignment = (id: string): void =>
  setDb((db) => ({
    ...db,
    assignments: db.assignments.map((a) =>
      a.id === id ? { ...a, finishedAt: todayISO() } : a,
    ),
  }));

export const deleteAssignment = (id: string): void =>
  setDb((db) => ({
    ...db,
    assignments: db.assignments.filter((a) => a.id !== id),
    submissions: db.submissions.filter((s) => s.assignmentId !== id),
  }));

export const listSubmissions = (assignmentId: string): AssignmentSubmission[] =>
  getDb().submissions.filter((s) => s.assignmentId === assignmentId);

export const submissionsForStudent = (
  studentId: string,
): AssignmentSubmission[] =>
  getDb().submissions.filter((s) => s.studentId === studentId);

export const setSubmission = (
  assignmentId: string,
  studentId: string,
  patch: Partial<AssignmentSubmission>,
): void =>
  setDb((db) => {
    const existing = db.submissions.find(
      (s) => s.assignmentId === assignmentId && s.studentId === studentId,
    );
    if (existing) {
      return {
        ...db,
        submissions: db.submissions.map((s) =>
          s.id === existing.id ? { ...s, ...patch } : s,
        ),
      };
    }
    const submission: AssignmentSubmission = {
      id: uid("sub"),
      assignmentId,
      studentId,
      submitted: false,
      ...patch,
    };
    return { ...db, submissions: [...db.submissions, submission] };
  });
