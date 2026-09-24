import type { Feedback } from "@/shared/lib/mockStore";
import { getDb, setDb } from "@/shared/lib/mockStore";
import { uid } from "@/shared/lib/format";
import type { NewFeedback } from "./types";

const byDateDesc = (a: Feedback, b: Feedback): number =>
  b.date.localeCompare(a.date);

export const listFeedbackForStudent = (studentId: string): Feedback[] =>
  getDb()
    .feedback.filter((f) => f.studentId === studentId)
    .sort(byDateDesc);

export const listFeedbackForGroups = (groupIds: string[]): Feedback[] =>
  getDb()
    .feedback.filter((f) => groupIds.includes(f.groupId))
    .sort(byDateDesc);

/** Every facilitator's feedback - for president/admin org-wide views. */
export const listAllFeedback = (): Feedback[] =>
  [...getDb().feedback].sort(byDateDesc);

export const createFeedback = (input: NewFeedback): Feedback => {
  const feedback: Feedback = {
    id: uid("fbk"),
    ...input,
    createdAt: new Date().toISOString(),
  };
  setDb((db) => ({ ...db, feedback: [...db.feedback, feedback] }));
  return feedback;
};

export const updateFeedback = (id: string, patch: Partial<Feedback>): void =>
  setDb((db) => ({
    ...db,
    feedback: db.feedback.map((f) => (f.id === id ? { ...f, ...patch } : f)),
  }));

export const deleteFeedback = (id: string): void =>
  setDb((db) => ({ ...db, feedback: db.feedback.filter((f) => f.id !== id) }));
