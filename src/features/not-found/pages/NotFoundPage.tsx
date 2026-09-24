import { Link } from "react-router-dom";
import styled from "styled-components";

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

const BigCode = styled.h1`
  font-size: 4.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.color.text};
`;

const Heading = styled.h2`
  margin-top: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text};
`;

const Message = styled.p`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const HomeLink = styled(Link)`
  display: inline-flex;
  margin-top: 1.5rem;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.md};
  background-color: ${({ theme }) => theme.color.brand};
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.color.onBrand};
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.color.brandDark};
  }
`;

export function NotFoundPage() {
  return (
    <CenteredPage>
      <Inner>
        <BigCode>404</BigCode>
        <Heading>Page not found</Heading>
        <Message>
          The page you're looking for doesn't exist or has been moved.
        </Message>
        <HomeLink to="/">Go home</HomeLink>
      </Inner>
    </CenteredPage>
  );
}
