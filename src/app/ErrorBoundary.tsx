import { Component, type ErrorInfo, type ReactNode } from "react";
import styled, { ThemeProvider } from "styled-components";
import { lightTheme } from "@/theme";

const CenteredPage = styled.div`
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.color.bg};
  padding: 0 1rem;
`;

const Inner = styled.div`
  max-width: 28rem;
  text-align: center;
`;

const Heading = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text};
`;

const Message = styled.p`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const RetryButton = styled.button`
  margin-top: 1.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.md};
  background-color: ${({ theme }) => theme.color.brand};
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.color.onBrand};
`;

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/** Renders outside the app's own ThemeProvider on a hard failure, so it brings its own. */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info);
  }

  override render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <ThemeProvider theme={lightTheme}>
        <CenteredPage>
          <Inner>
            <Heading>This page didn't load</Heading>
            <Message>
              Something went wrong on our end. Try refreshing the page.
            </Message>
            <RetryButton onClick={() => window.location.reload()}>
              Refresh
            </RetryButton>
          </Inner>
        </CenteredPage>
      </ThemeProvider>
    );
  }
}
