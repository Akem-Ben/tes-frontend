import { useParams } from "react-router-dom";
import { useDb } from "@/shared/lib/mockStore";
import { useFacilitatorId } from "@/features/auth";
import type { Group, Cohort } from "@/shared/lib/mockStore";

export interface ActiveGroup {
  group: Group | null;
  cohort: Cohort | null;
  groups: Group[];
}

/** The signed-in facilitator's own groups (used to build "my group" pickers). */
export const useActiveGroup = (): ActiveGroup => {
  const db = useDb();
  const facilitatorId = useFacilitatorId();
  const groups = db.groups.filter((g) =>
    g.facilitatorIds.includes(facilitatorId),
  );
  const activeCohort =
    db.cohorts.find(
      (s) => s.status === "active" && groups.some((g) => g.cohortId === s.id),
    ) ?? null;
  const group =
    groups.find((g) => g.cohortId === activeCohort?.id) ?? groups[0] ?? null;
  const cohort = group
    ? (db.cohorts.find((s) => s.id === group.cohortId) ?? null)
    : null;
  return { group, cohort, groups };
};

export interface GroupParam {
  group: Group | null;
  cohort: Cohort | null;
}

/**
 * Every group-scoped page (students, sign-in/out, attendance, ...) lives at
 * `/groups/:groupId/...` and reads the group straight from the URL - this works the same
 * way for every role, since a facilitator, president or admin all reach it by clicking
 * into a specific group first.
 */
export const useGroupParam = (): GroupParam => {
  const { groupId } = useParams<{ groupId: string }>();
  const db = useDb();
  const group = db.groups.find((g) => g.id === groupId) ?? null;
  const cohort = group
    ? (db.cohorts.find((s) => s.id === group.cohortId) ?? null)
    : null;
  return { group, cohort };
};
