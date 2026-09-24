import { useCallback, useState } from "react";

export interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
}

const closed: ConfirmState = {
  open: false,
  title: "",
  message: "",
  confirmLabel: "Confirm",
  onConfirm: () => {},
};

/** Small helper so every destructive action can share one confirmation modal. */
export const useConfirm = () => {
  const [state, setState] = useState<ConfirmState>(closed);

  const ask = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      confirmLabel = "Confirm",
    ) => setState({ open: true, title, message, confirmLabel, onConfirm }),
    [],
  );

  const close = useCallback(() => setState(closed), []);

  return { state, ask, close };
};
