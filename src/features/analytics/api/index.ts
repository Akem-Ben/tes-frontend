import { getDb } from "@/shared/lib/mockStore";
import { filterStart, type TimeFilter } from "@/shared/lib/date";
import { percent } from "@/shared/lib/format";
import type {
  FacilitatorPerformance,
  GroupAverages,
  StudentSummary,
  TypeBreakdown,
} from "./types";

/** Everything the student profile and analytics screens need for one student. */
export const studentSummary = (
  studentId: string,
  filter: TimeFilter,
): StudentSummary | null => {
  const db = getDb();
  const student = db.students.find((s) => s.id === studentId);
  if (!student) return null;
  const from = filterStart(filter);

  const records = db.attendanceRecords.filter(
    (r) => r.studentId === studentId && r.date >= from,
  );
  const classRecords = db.weeklyClassAttendance.filter(
    (r) => r.studentId === studentId && r.date >= from,
  );
  const byType = new Map<string, { attended: number; total: number }>();
  records.forEach((r) => {
    const event = db.attendanceEvents.find((e) => e.id === r.attendanceEventId);
    const type = event?.type ?? "Other";
    const entry = byType.get(type) ?? { attended: 0, total: 0 };
    entry.total += 1;
    if (r.attended) entry.attended += 1;
    byType.set(type, entry);
  });
  classRecords.forEach((r) => {
    const weeklyClass = db.weeklyClasses.find((c) => c.id === r.weeklyClassId);
    const type = weeklyClass?.name ?? "Weekly Class";
    const entry = byType.get(type) ?? { attended: 0, total: 0 };
    entry.total += 1;
    if (r.attended) entry.attended += 1;
    byType.set(type, entry);
  });
  const attendanceByType: TypeBreakdown[] = Array.from(byType.entries()).map(
    ([type, v]) => ({
      type,
      attended: v.attended,
      total: v.total,
      rate: percent(v.attended, v.total),
    }),
  );
  const attendedTotal =
    records.filter((r) => r.attended).length +
    classRecords.filter((r) => r.attended).length;
  const totalAttendanceRecords = records.length + classRecords.length;

  const subs = db.submissions.filter((s) => s.studentId === studentId);
  const relevant = subs.filter((s) => {
    const assignment = db.assignments.find((a) => a.id === s.assignmentId);
    return assignment ? assignment.dueDate >= from : false;
  });
  const submitted = relevant.filter((s) => s.submitted).length;

  const sio = db.signInOuts.filter(
    (s) => s.studentId === studentId && s.date >= from,
  );
  const signedIn = sio.filter((s) => s.signedIn).length;
  const signedOut = sio.filter((s) => s.signedOut).length;

  return {
    student,
    attendanceRate: percent(attendedTotal, totalAttendanceRecords),
    attendanceByType,
    submissionRate: percent(submitted, relevant.length),
    submitted,
    assignmentsTotal: relevant.length,
    signInRate: percent(signedIn, sio.length),
    signOutRate: percent(signedOut, sio.length),
    daysExpected: sio.length,
  };
};

export const groupSummaries = (
  groupId: string,
  filter: TimeFilter,
): StudentSummary[] =>
  getDb()
    .students.filter((s) => s.groupIds.includes(groupId))
    .map((s) => studentSummary(s.id, filter))
    .filter((s): s is StudentSummary => s !== null);

/** Every student across every facilitator - for president/admin org-wide analytics. */
export const orgSummaries = (
  filter: TimeFilter,
  facilitatorId?: string,
): StudentSummary[] => {
  const db = getDb();
  const groupIds = facilitatorId
    ? db.groups
        .filter((g) => g.facilitatorIds.includes(facilitatorId))
        .map((g) => g.id)
    : db.groups.map((g) => g.id);
  return db.students
    .filter((s) => s.groupIds.some((g) => groupIds.includes(g)))
    .map((s) => studentSummary(s.id, filter))
    .filter((s): s is StudentSummary => s !== null);
};

export const groupAverages = (summaries: StudentSummary[]): GroupAverages => {
  const avg = (values: number[]): number =>
    values.length === 0
      ? 0
      : Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  return {
    attendance: avg(summaries.map((s) => s.attendanceRate)),
    submissions: avg(summaries.map((s) => s.submissionRate)),
    signIn: avg(summaries.map((s) => s.signInRate)),
    signOut: avg(summaries.map((s) => s.signOutRate)),
  };
};

/** One row per facilitator - used on the president/admin facilitators & dashboard pages. */
export const facilitatorPerformance = (
  filter: TimeFilter,
): FacilitatorPerformance[] => {
  const db = getDb();
  return db.facilitators.map((f) => {
    const groups = db.groups.filter((g) => g.facilitatorIds.includes(f.id));
    const studentCount = db.students.filter((s) =>
      s.groupIds.some((gid) => groups.some((g) => g.id === gid)),
    ).length;
    const summaries = orgSummaries(filter, f.id);
    return {
      facilitatorId: f.id,
      facilitatorName: f.name,
      groupCount: groups.length,
      studentCount,
      averages: groupAverages(summaries),
    };
  });
};
