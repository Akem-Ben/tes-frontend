import type { Student } from "@/shared/lib/mockStore";

export interface TypeBreakdown {
  type: string;
  attended: number;
  total: number;
  rate: number;
}

export interface StudentSummary {
  student: Student;
  attendanceRate: number;
  attendanceByType: TypeBreakdown[];
  submissionRate: number;
  submitted: number;
  assignmentsTotal: number;
  signInRate: number;
  signOutRate: number;
  daysExpected: number;
}

export interface GroupAverages {
  attendance: number;
  submissions: number;
  signIn: number;
  signOut: number;
}

export interface FacilitatorPerformance {
  facilitatorId: string;
  facilitatorName: string;
  groupCount: number;
  studentCount: number;
  averages: GroupAverages;
}
