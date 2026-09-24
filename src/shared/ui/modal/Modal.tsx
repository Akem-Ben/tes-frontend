import type { ReactNode } from "react";
import styled from "styled-components";
import { Button } from "../button";
import { media } from "@/theme";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background-color: rgba(15, 23, 42, 0.5);
  padding: 0;

  ${media.sm} {
    align-items: center;
    padding: 1rem;
  }
`;

const Panel = styled.div`
  max-height: 90vh;
  width: 100%;
  overflow-y: auto;
  border-radius: 1rem 1rem 0 0;
  background-color: ${({ theme }) => theme.color.card};
  padding: 1.25rem;
  box-shadow: ${({ theme }) => theme.shadow.xl};

  ${media.sm} {
    max-width: 32rem;
    border-radius: 1rem;
  }
`;

const Header = styled.div`
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text};
`;

const Footer = styled.div`
  margin-top: 1.25rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;

const Message = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textBody};
`;

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  if (!open) return null;
  return (
    <Overlay>
      <Panel>
        <Header>
          <Title>{title}</Title>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </Button>
        </Header>
        {children}
        {footer && <Footer>{footer}</Footer>}
      </Panel>
    </Overlay>
  );
}

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <Message>{message}</Message>
    </Modal>
  );
}
