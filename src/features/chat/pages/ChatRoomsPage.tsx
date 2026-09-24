import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Card, Button, Modal, Input, Badge } from "@/shared/ui";
import { PageHeader, EmptyState } from "@/shared/components";
import { useAuth } from "@/features/auth";
import type { ChatMemberRole } from "@/shared/lib/mockStore";
import { createRoom, listAllRooms, listRoomsForMember } from "../api";
import { MemberSearchModal } from "../components/MemberSearchModal";
import type { ChatSearchResult } from "../api/types";

const RoomList = styled.ul`
  > * + * {
    margin-top: 0.75rem;
  }
`;

const RoomLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-radius: ${({ theme }) => theme.radius.xl};
  border: 1px solid ${({ theme }) => theme.color.border};
  padding: 0.75rem;

  &:hover {
    border-color: ${({ theme }) => theme.color.brand};
  }
`;

const RoomName = styled.p`
  font-weight: 500;
  color: ${({ theme }) => theme.color.text};
`;

const RoomMeta = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const Form = styled.form`
  > * + * {
    margin-top: 1rem;
  }
`;

const MemberChips = styled.div`
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
`;

const RemoveChip = styled.button`
  margin-left: 0.25rem;
`;

export function ChatRoomsPage() {
  const { user, role } = useAuth();
  const memberId = user?.id ?? "";
  const memberRole: ChatMemberRole =
    role === "facilitator" ? "facilitator" : "admin";
  const isOversight = role === "superadmin";
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [facilitators, setFacilitators] = useState<ChatSearchResult[]>([]);
  const [admins, setAdmins] = useState<ChatSearchResult[]>([]);
  const [students, setStudents] = useState<ChatSearchResult[]>([]);

  const rooms = isOversight
    ? listAllRooms()
    : listRoomsForMember(memberId, memberRole);

  const addMember = (result: ChatSearchResult) => {
    if (result.type === "facilitator") setFacilitators((c) => [...c, result]);
    else if (result.type === "admin") setAdmins((c) => [...c, result]);
    else setStudents((c) => [...c, result]);
  };

  const removeMember = (result: ChatSearchResult) => {
    if (result.type === "facilitator")
      setFacilitators((c) => c.filter((r) => r.id !== result.id));
    else if (result.type === "admin")
      setAdmins((c) => c.filter((r) => r.id !== result.id));
    else setStudents((c) => c.filter((r) => r.id !== result.id));
  };

  const picked = [...facilitators, ...admins, ...students];

  const resetForm = () => {
    setName("");
    setFacilitators([]);
    setAdmins([]);
    setStudents([]);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createRoom({
      name: name.trim(),
      facilitatorIds: facilitators.map((f) => f.id),
      adminIds: admins.map((a) => a.id),
      studentIds: students.map((s) => s.id),
      createdBy: memberId,
      createdByRole: memberRole,
    });
    resetForm();
    setOpen(false);
  };

  const totalMembers = (r: (typeof rooms)[number]) =>
    r.facilitatorIds.length + r.adminIds.length;

  return (
    <>
      <PageHeader
        title="Chat"
        subtitle="Discuss with facilitators and admins - add students to tag a conversation"
        action={<Button onClick={() => setOpen(true)}>+ New room</Button>}
      />

      <Card>
        {rooms.length === 0 ? (
          <EmptyState
            icon="💬"
            title="No chat rooms yet"
            message="Create a room and search for who to add - facilitators, admins or students."
            action={<Button onClick={() => setOpen(true)}>Create room</Button>}
          />
        ) : (
          <RoomList>
            {rooms.map((r) => (
              <li key={r.id}>
                <RoomLink to={`/chat/${r.id}`}>
                  <div>
                    <RoomName>{r.name}</RoomName>
                    <RoomMeta>
                      {totalMembers(r)} member{totalMembers(r) === 1 ? "" : "s"}
                      {r.studentIds.length > 0
                        ? ` · ${r.studentIds.length} student${r.studentIds.length === 1 ? "" : "s"} tagged`
                        : ""}
                    </RoomMeta>
                  </div>
                  <span aria-hidden>→</span>
                </RoomLink>
              </li>
            ))}
          </RoomList>
        )}
      </Card>

      <Modal
        open={open}
        title="New chat room"
        onClose={() => {
          resetForm();
          setOpen(false);
        }}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" form="room-form">
              Create room
            </Button>
          </>
        }
      >
        <Form id="room-form" onSubmit={submit}>
          <Input
            label="Room name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Facilitators Lounge"
            required
          />
          <div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setAddOpen(true)}
            >
              + Add members
            </Button>
            {picked.length > 0 && (
              <MemberChips>
                {picked.map((m) => (
                  <Badge key={`${m.type}-${m.id}`} tone="brand">
                    {m.name}
                    <RemoveChip
                      type="button"
                      onClick={() => removeMember(m)}
                      aria-label={`Remove ${m.name}`}
                    >
                      ✕
                    </RemoveChip>
                  </Badge>
                ))}
              </MemberChips>
            )}
          </div>
        </Form>
      </Modal>

      <MemberSearchModal
        open={addOpen}
        title="Add members"
        excludeIds={picked.map((m) => m.id)}
        onClose={() => setAddOpen(false)}
        onAdd={addMember}
      />
    </>
  );
}
