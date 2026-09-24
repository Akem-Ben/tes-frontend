import type { Cohort, CohortStatus } from "@/shared/lib/mockStore";
import { uid } from "@/shared/lib/format";
import { getDb, setDb } from "@/shared/lib/mockStore";

export const listCohorts = (facilitatorId: string): Cohort[] =>
  getDb().cohorts.filter((s) => s.facilitatorId === facilitatorId);

export const listAllCohorts = (): Cohort[] => getDb().cohorts;

export const getCohort = (id: string): Cohort | undefined =>
  getDb().cohorts.find((s) => s.id === id);

export const createCohort = (input: Omit<Cohort, "id">): Cohort => {
  const cohort: Cohort = { ...input, id: uid("coh") };
  setDb((db) => ({ ...db, cohorts: [...db.cohorts, cohort] }));
  return cohort;
};

export const updateCohort = (id: string, patch: Partial<Cohort>): void =>
  setDb((db) => ({
    ...db,
    cohorts: db.cohorts.map((s) => (s.id === id ? { ...s, ...patch } : s)),
  }));

export const setCohortStatus = (id: string, status: CohortStatus): void =>
  updateCohort(id, { status });

export const deleteCohort = (id: string): void =>
  setDb((db) => ({ ...db, cohorts: db.cohorts.filter((s) => s.id !== id) }));

/** Moves a student out of every waiting list they're in and into this cohort's pool. */
export const moveStudentToCohort = (
  cohortId: string,
  studentId: string,
): void =>
  setDb((db) => ({
    ...db,
    waitingLists: db.waitingLists.map((w) => ({
      ...w,
      studentIds: w.studentIds.filter((s) => s !== studentId),
    })),
    cohorts: db.cohorts.map((s) =>
      s.id === cohortId && !s.studentIds.includes(studentId)
        ? { ...s, studentIds: [...s.studentIds, studentId] }
        : s,
    ),
  }));

export const removeStudentFromCohortPool = (
  cohortId: string,
  studentId: string,
): void =>
  setDb((db) => ({
    ...db,
    cohorts: db.cohorts.map((s) =>
      s.id === cohortId
        ? { ...s, studentIds: s.studentIds.filter((x) => x !== studentId) }
        : s,
    ),
  }));
