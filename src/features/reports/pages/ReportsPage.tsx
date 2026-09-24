import { useState } from "react";
import styled from "styled-components";
import { Select } from "@/shared/ui";
import { PageHeader } from "@/shared/components";
import { useDb } from "@/shared/lib";
import { useAuth, useFacilitatorId } from "@/features/auth";
import { ExportPanel } from "../components/ExportPanel";

const FilterRow = styled.div`
  margin-bottom: 1.25rem;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  max-width: 48rem;
`;

export function ReportsPage() {
  const db = useDb();
  const { role } = useAuth();
  const ownFacilitatorId = useFacilitatorId();
  const isOrgWide =
    role === "president" || role === "admin" || role === "superadmin";
  const [facilitatorId, setFacilitatorId] = useState("all");
  const [cohortId, setCohortId] = useState("all");
  const [groupId, setGroupId] = useState("all");

  const facilitatorScopeId = isOrgWide
    ? facilitatorId === "all"
      ? undefined
      : facilitatorId
    : ownFacilitatorId;

  const availableGroups = db.groups.filter((g) => {
    if (!isOrgWide && !g.facilitatorIds.includes(ownFacilitatorId))
      return false;
    if (
      isOrgWide &&
      facilitatorId !== "all" &&
      !g.facilitatorIds.includes(facilitatorId)
    )
      return false;
    if (cohortId !== "all" && g.cohortId !== cohortId) return false;
    return true;
  });
  const groupScopeId =
    groupId !== "all" && availableGroups.some((g) => g.id === groupId)
      ? groupId
      : undefined;

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Download who signed in/out, attended events, submitted assignments and paid dues - by group, by cohort, or all time"
      />

      <FilterRow>
        {isOrgWide && (
          <Select
            label="Facilitator"
            value={facilitatorId}
            onChange={(e) => {
              setFacilitatorId(e.target.value);
              setGroupId("all");
            }}
            options={[
              { value: "all", label: "All facilitators" },
              ...db.facilitators.map((f) => ({ value: f.id, label: f.name })),
            ]}
          />
        )}
        <Select
          label="Cohort"
          value={cohortId}
          onChange={(e) => {
            setCohortId(e.target.value);
            setGroupId("all");
          }}
          options={[
            { value: "all", label: "Every cohort (all time)" },
            ...db.cohorts.map((s) => ({ value: s.id, label: s.name })),
          ]}
        />
        <Select
          label="Group"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          options={[
            { value: "all", label: "All groups" },
            ...availableGroups.map((g) => ({ value: g.id, label: g.name })),
          ]}
        />
      </FilterRow>

      <ExportPanel
        facilitatorId={facilitatorScopeId}
        groupId={groupScopeId}
        cohortId={cohortId !== "all" ? cohortId : undefined}
      />
    </>
  );
}
