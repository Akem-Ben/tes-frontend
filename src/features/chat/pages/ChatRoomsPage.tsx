import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Card, Button, Modal, Input } from "@/shared/ui";
import { PageHeader, EmptyState } from "@/shared/components";
import { useDb } from "@/shared/lib";
import { useFacilitatorId } from "@/features/auth";
import { createRoom, listRoomsForFacilitator } from "../api";

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

const FacilitatorList = styled.div`
  > * + * {
    margin-top: 0.375rem;
  }
`;

const FacilitatorRow = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textBody};
`;

const Checkbox = styled.input`
  height: 1rem;
  width: 1rem;
  accent-color: ${({ theme }) => theme.color.brand};
`;

export function ChatRoomsPage() {
  const db = useDb();
  const facilitatorId = useFacilitatorId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const rooms = listRoomsForFacilitator(facilitatorId);
  const otherFacilitators = db.facilitators.filter(
    (f) => f.id !== facilitatorId,
  );

  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((f) => f !== id) : [...current, id],
    );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createRoom(name.trim(), selected, facilitatorId);
    setName("");
    setSelected([]);
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Chat"
        subtitle="Discuss with other facilitators"
        action={<Button onClick={() => setOpen(true)}>+ New room</Button>}
      />

      <Card>
        {rooms.length === 0 ? (
          <EmptyState
            icon="💬"
            title="No chat rooms yet"
            message="Create a room and add other facilitators to start discussing."
            action={<Button onClick={() => setOpen(true)}>Create room</Button>}
          />
        ) : (
          <RoomList>
            {rooms.map((r) => (
              <li key={r.id}>
                <RoomLink to={`/chat/${r.id}`}>
                  <div>
                    <RoomName>{r.name}</RoomName>
                    <RoomMeta>{r.facilitatorIds.length} facilitators</RoomMeta>
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
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
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
            <FacilitatorList>
              {otherFacilitators.map((f) => (
                <FacilitatorRow key={f.id}>
                  <Checkbox
                    type="checkbox"
                    checked={selected.includes(f.id)}
                    onChange={() => toggle(f.id)}
                  />
                  {f.name}
                </FacilitatorRow>
              ))}
            </FacilitatorList>
          </div>
        </Form>
      </Modal>
    </>
  );
}
