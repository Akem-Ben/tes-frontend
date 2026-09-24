import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Card, Button, Modal, Input } from "@/shared/ui";
import { PageHeader, EmptyState } from "@/shared/components";
import { useDb } from "@/shared/lib";
import { useAuth } from "@/features/auth";
import { createWaitingList, listWaitingLists } from "../api";

const ListWrap = styled.ul`
  > * + * {
    margin-top: 0.75rem;
  }
`;

const ItemLink = styled(Link)`
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

const ItemName = styled.p`
  font-weight: 500;
  color: ${({ theme }) => theme.color.text};
`;

const ItemMeta = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const Form = styled.form`
  > * + * {
    margin-top: 1rem;
  }
`;

export function WaitingListsPage() {
  const db = useDb();
  const { role } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const lists = listWaitingLists();
  const canCreate = role === "admin";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createWaitingList(name.trim());
    setName("");
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Waiting List"
        subtitle="Students not yet placed in a group"
        action={
          canCreate && (
            <Button onClick={() => setOpen(true)}>+ New waiting list</Button>
          )
        }
      />

      <Card>
        {lists.length === 0 ? (
          <EmptyState
            icon="🕒"
            title="No waiting lists yet"
            message={
              canCreate
                ? "Create a waiting list to start placing new students."
                : "Ask an admin to create a waiting list."
            }
            action={
              canCreate && (
                <Button onClick={() => setOpen(true)}>
                  Create waiting list
                </Button>
              )
            }
          />
        ) : (
          <ListWrap>
            {lists.map((w) => (
              <li key={w.id}>
                <ItemLink to={`/waiting-list/${w.id}`}>
                  <div>
                    <ItemName>{w.name}</ItemName>
                    <ItemMeta>
                      {w.studentIds.length} students
                      {w.facilitatorIds.length > 0 &&
                        ` · ${w.facilitatorIds
                          .map(
                            (id) =>
                              db.facilitators.find((f) => f.id === id)?.name,
                          )
                          .filter(Boolean)
                          .join(", ")}`}
                    </ItemMeta>
                  </div>
                  <span aria-hidden>→</span>
                </ItemLink>
              </li>
            ))}
          </ListWrap>
        )}
      </Card>

      <Modal
        open={open}
        title="New waiting list"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="waiting-list-form">
              Create
            </Button>
          </>
        }
      >
        <Form id="waiting-list-form" onSubmit={submit}>
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="General Waiting List"
            required
          />
        </Form>
      </Modal>
    </>
  );
}
