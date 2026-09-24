import { useMemo, useState } from "react";
import styled from "styled-components";
import { Modal, Button, Input, Badge } from "@/shared/ui";
import { searchMembers } from "../api";
import type { ChatMemberType, ChatSearchResult } from "../api/types";

interface MemberSearchModalProps {
  open: boolean;
  title: string;
  /** Ids already picked/added - shown as selected and excluded from further search hits. */
  excludeIds: string[];
  types?: ChatMemberType[];
  onClose: () => void;
  onAdd: (result: ChatSearchResult) => void;
}

const typeLabel: Record<ChatMemberType, string> = {
  facilitator: "Facilitator",
  admin: "Admin",
  student: "Student",
};

const typeTone: Record<ChatMemberType, "brand" | "slate" | "green"> = {
  facilitator: "brand",
  admin: "slate",
  student: "green",
};

const ResultList = styled.div`
  margin-top: 0.75rem;

  > * + * {
    margin-top: 0.375rem;
  }
`;

const ResultRow = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.color.border};
  padding: 0.5rem 0.75rem;
  text-align: left;

  &:hover {
    border-color: ${({ theme }) => theme.color.brand};
  }
`;

const ResultInfo = styled.div`
  min-width: 0;
`;

const ResultName = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.color.text};
`;

const ResultMeta = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const EmptyHint = styled.p`
  margin-top: 0.75rem;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

/** Search-first "add a member" modal - facilitators, admins and students in one place. */
export function MemberSearchModal({
  open,
  title,
  excludeIds,
  types,
  onClose,
  onAdd,
}: MemberSearchModalProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(
    () => searchMembers(query, types).filter((r) => !excludeIds.includes(r.id)),
    [query, types, excludeIds],
  );

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  return (
    <Modal
      open={open}
      title={title}
      onClose={handleClose}
      footer={
        <Button variant="secondary" onClick={handleClose}>
          Done
        </Button>
      }
    >
      <Input
        label="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or email..."
        autoFocus
      />
      <ResultList>
        {results.map((r) => (
          <ResultRow
            key={`${r.type}-${r.id}`}
            type="button"
            onClick={() => onAdd(r)}
          >
            <ResultInfo>
              <ResultName>{r.name}</ResultName>
              <ResultMeta>{r.meta}</ResultMeta>
            </ResultInfo>
            <Badge tone={typeTone[r.type]}>{typeLabel[r.type]}</Badge>
          </ResultRow>
        ))}
        {query.trim() && results.length === 0 && (
          <EmptyHint>No matches for "{query}".</EmptyHint>
        )}
        {!query.trim() && (
          <EmptyHint>Start typing a name or email to search.</EmptyHint>
        )}
      </ResultList>
    </Modal>
  );
}
