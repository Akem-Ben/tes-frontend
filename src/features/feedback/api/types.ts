export type { Feedback } from "@/shared/lib/mockStore";

export interface NewFeedback {
  studentId: string;
  groupId: string;
  facilitatorId: string;
  date: string;
  message: string;
}
