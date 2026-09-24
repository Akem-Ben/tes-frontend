import type { Role } from "@/shared/lib/mockStore";

export type { Role, Admin, President } from "@/shared/lib/mockStore";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  photo?: string | undefined;
}

export interface AuthState {
  user: AuthUser | null;
  role: Role | null;
}
