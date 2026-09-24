import { getDb } from "@/shared/lib/mockStore";
import type { ExportSheet } from "@/shared/lib/excelExport";

export interface ReportScope {
  /** Restrict to one facilitator's groups; omit for every facilitator (president/admin). */
  facilitatorId?: string | undefined;
  /** Restrict to one specific group. */
  groupId?: string | undefined;
  /** Restrict to every group in one cohort. */
  cohortId?: string | undefined;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}

const scopedGroupIds = (
  scope: Pick<ReportScope, "facilitatorId" | "groupId" | "cohortId">,
): string[] => {
  const db = getDb();
  let groups = db.groups;
  if (scope.facilitatorId)
    groups = groups.filter((g) =>
      g.facilitatorIds.includes(scope.facilitatorId!),
    );
  if (scope.cohortId)
    groups = groups.filter((g) => g.cohortId === scope.cohortId);
  if (scope.groupId) groups = groups.filter((g) => g.id === scope.groupId);
  return groups.map((g) => g.id);
};

const inScope = (studentGroupIds: string[], groupIds: string[]): boolean =>
  studentGroupIds.some((g) => groupIds.includes(g));

export const signInOutSheet = (scope: ReportScope): ExportSheet => {
  const db = getDb();
  const groupIds = scopedGroupIds(scope);
  const studentsById = new Map(db.students.map((s) => [s.id, s]));
  const rows = db.signInOuts
    .filter((r) => r.date >= scope.from && r.date <= scope.to)
    .filter((r) =>
      inScope(studentsById.get(r.studentId)?.groupIds ?? [], groupIds),
    )
    .map((r) => {
      const student = studentsById.get(r.studentId);
      const group = db.groups.find((g) => student?.groupIds.includes(g.id));
      return {
        Date: r.date,
        Student: student?.name ?? "—",
        Group: group?.name ?? "—",
        "Signed In": r.signedIn ? "Yes" : "No",
        "Time In": r.timeIn ?? "",
        "Signed Out": r.signedOut ? "Yes" : "No",
        "Time Out": r.timeOut ?? "",
      };
    });
  return { name: "Sign In-Out", rows };
};

export const attendanceSheet = (scope: ReportScope): ExportSheet => {
  const db = getDb();
  const groupIds = scopedGroupIds(scope);
  const studentsById = new Map(db.students.map((s) => [s.id, s]));
  const rows = db.attendanceRecords
    .filter((r) => r.date >= scope.from && r.date <= scope.to)
    .filter((r) =>
      inScope(studentsById.get(r.studentId)?.groupIds ?? [], groupIds),
    )
    .map((r) => {
      const event = db.attendanceEvents.find(
        (e) => e.id === r.attendanceEventId,
      );
      const student = studentsById.get(r.studentId);
      const group = db.groups.find((g) => g.id === event?.groupId);
      return {
        Date: r.date,
        Event: event?.name ?? "—",
        Type: event?.type ?? "—",
        Group: group?.name ?? "—",
        Student: student?.name ?? "—",
        Attended: r.attended ? "Yes" : "No",
      };
    });
  return { name: "Attendance", rows };
};

export const weeklyClassSheet = (scope: ReportScope): ExportSheet => {
  const db = getDb();
  const groupIds = scopedGroupIds(scope);
  const studentsById = new Map(db.students.map((s) => [s.id, s]));
  const rows = db.weeklyClassAttendance
    .filter((r) => r.date >= scope.from && r.date <= scope.to)
    .filter((r) =>
      inScope(studentsById.get(r.studentId)?.groupIds ?? [], groupIds),
    )
    .map((r) => {
      const weeklyClass = db.weeklyClasses.find(
        (c) => c.id === r.weeklyClassId,
      );
      const student = studentsById.get(r.studentId);
      const group = db.groups.find((g) => g.id === weeklyClass?.groupId);
      return {
        Date: r.date,
        Class: weeklyClass?.name ?? "—",
        Group: group?.name ?? "—",
        Student: student?.name ?? "—",
        Attended: r.attended ? "Yes" : "No",
      };
    });
  return { name: "Weekly Classes", rows };
};

export const assignmentSheet = (scope: ReportScope): ExportSheet => {
  const db = getDb();
  const groupIds = scopedGroupIds(scope);
  const assignments = db.assignments.filter(
    (a) =>
      groupIds.includes(a.groupId) &&
      a.dueDate >= scope.from &&
      a.dueDate <= scope.to,
  );
  const studentsById = new Map(db.students.map((s) => [s.id, s]));
  const rows = db.submissions
    .filter((s) => assignments.some((a) => a.id === s.assignmentId))
    .map((s) => {
      const assignment = assignments.find((a) => a.id === s.assignmentId);
      const group = db.groups.find((g) => g.id === assignment?.groupId);
      return {
        Assignment: assignment?.title ?? "—",
        Type: assignment?.type ?? "—",
        Group: group?.name ?? "—",
        "Due Date": assignment?.dueDate ?? "",
        Student: studentsById.get(s.studentId)?.name ?? "—",
        Submitted: s.submitted ? "Yes" : "No",
        Grade: s.grade ?? "",
      };
    });
  return { name: "Assignments", rows };
};

export const feedbackSheet = (scope: ReportScope): ExportSheet => {
  const db = getDb();
  const groupIds = scopedGroupIds(scope);
  const studentsById = new Map(db.students.map((s) => [s.id, s]));
  const facilitatorsById = new Map(db.facilitators.map((f) => [f.id, f]));
  const rows = db.feedback
    .filter((f) => f.date >= scope.from && f.date <= scope.to)
    .filter((f) => groupIds.includes(f.groupId))
    .map((f) => {
      const group = db.groups.find((g) => g.id === f.groupId);
      return {
        Date: f.date,
        Student: studentsById.get(f.studentId)?.name ?? "—",
        Group: group?.name ?? "—",
        Facilitator: facilitatorsById.get(f.facilitatorId)?.name ?? "—",
        Feedback: f.message,
      };
    });
  return { name: "Feedback", rows };
};

export const paymentsSheet = (
  scope: Pick<ReportScope, "facilitatorId" | "groupId" | "cohortId">,
): ExportSheet => {
  const db = getDb();
  const groupIds = scopedGroupIds(scope);
  const studentsById = new Map(db.students.map((s) => [s.id, s]));
  const rows = db.payments
    .filter((p) => groupIds.includes(p.groupId))
    .map((p) => {
      const group = db.groups.find((g) => g.id === p.groupId);
      return {
        Period: p.period,
        Student: studentsById.get(p.studentId)?.name ?? "—",
        Group: group?.name ?? "—",
        "Amount Due": p.amountDue,
        "Amount Paid": p.amountPaid,
        Status: p.status,
      };
    });
  return { name: "Payments", rows };
};
