import styled from "styled-components";

const FullScreen = styled.div`
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.color.bg};
`;

const Inline = styled.div`
  display: flex;
  min-height: 12rem;
  align-items: center;
  justify-content: center;
`;

const Text = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

export function PageLoader({
  title = "Loading…",
  fullScreen = false,
}: {
  title?: string;
  fullScreen?: boolean;
}) {
  const Wrapper = fullScreen ? FullScreen : Inline;
  return (
    <Wrapper>
      <Text>{title}</Text>
    </Wrapper>
  );
}
