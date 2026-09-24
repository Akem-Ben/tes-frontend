import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Role } from "@/shared/lib/mockStore";
import { hydrate } from "@/shared/lib/mockStore";
import { ensureAllRecurring } from "@/shared/lib/weekCycle";
import {
  clearAuth,
  emptyAuth,
  loadAuth,
  login as loginService,
  saveAuth,
  verifyAuth,
} from "../api";
import type { AuthState } from "../api/types";

interface AuthContextValue extends AuthState {
  ready: boolean;
  signIn: (role: Role, email: string, password: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  ...emptyAuth,
  ready: false,
  signIn: () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(emptyAuth);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate();
    ensureAllRecurring();
    const cached = loadAuth();
    const verified = verifyAuth(cached);
    if (verified !== cached) clearAuth();
    setState(verified);
    setReady(true);
  }, []);

  const signIn = useCallback((role: Role, email: string, password: string) => {
    const next = loginService(role, email, password);
    saveAuth(next);
    setState(next);
  }, []);

  const signOut = useCallback(() => {
    clearAuth();
    setState(emptyAuth);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, ready, signIn, signOut }),
    [state, ready, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextValue => useContext(AuthContext);

/** Empty string outside a facilitator session (president/admin have no single facilitator id). */
export const useFacilitatorId = (): string => {
  const { user, role } = useAuth();
  return role === "facilitator" && user ? user.id : "";
};
