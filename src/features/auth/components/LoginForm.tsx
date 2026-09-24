import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import type { Role } from "@/shared/lib/mockStore";
import { useAuth } from "../context/AuthContext";
import { Button, Input } from "@/shared/ui";
import { ThemeToggle } from "@/shared/components";
import { media } from "@/theme";

const labels: Record<Role, string> = {
  admin: "Admin",
  president: "President",
  facilitator: "Facilitator",
};

const demoEmail: Record<Role, string> = {
  admin: "admin@tes.edu",
  president: "president@tes.edu",
  facilitator: "facilitator@tes.edu",
};

const Page = styled.div`
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.color.bg};
  padding: 2.5rem 1rem;
`;

const Panel = styled.div`
  width: 100%;
  max-width: 28rem;
  border-radius: 1rem;
  border: 1px solid ${({ theme }) => theme.color.border};
  background-color: ${({ theme }) => theme.color.panel};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadow.sm};

  ${media.sm} {
    padding: 2rem;
  }
`;

const TopRow = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HomeLink = styled(Link)`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.color.brand};

  &:hover {
    text-decoration: underline;
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.color.text};
`;

const Sub = styled.p`
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const Form = styled.form`
  margin-top: 1.5rem;

  > * + * {
    margin-top: 1rem;
  }
`;

const ErrorText = styled.p`
  border-radius: ${({ theme }) => theme.radius.lg};
  background-color: ${({ theme }) => theme.tone.red.bg};
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.tone.red.fg};
`;

const SubmitButton = styled(Button)`
  width: 100%;
`;

const Note = styled.p`
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

/** One typed form shared by all three login routes. */
export function LoginForm({ role }: { role: Role }) {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(demoEmail[role]);
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    try {
      signIn(role, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    }
  };

  return (
    <Page>
      <Panel>
        <TopRow>
          <HomeLink to="/">← Home</HomeLink>
          <ThemeToggle />
        </TopRow>
        <Title>{labels[role]} Login</Title>
        <Sub>Transforming Experience School Management System</Sub>

        <Form onSubmit={onSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && <ErrorText>{error}</ErrorText>}
          <SubmitButton type="submit">Sign in as {labels[role]}</SubmitButton>
        </Form>

        <Note>
          Accounts are created by the school office — there is no public
          sign-up.
          <br />
          Demo login: {demoEmail[role]} / password123
        </Note>
      </Panel>
    </Page>
  );
}
