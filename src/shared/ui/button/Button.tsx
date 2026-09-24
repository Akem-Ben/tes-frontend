import type { ButtonHTMLAttributes, ReactNode } from "react";
import styled, { css } from "styled-components";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variantStyles = {
  primary: css`
    background-color: ${({ theme }) => theme.color.brand};
    color: ${({ theme }) => theme.color.onBrand};
    box-shadow: ${({ theme }) => theme.shadow.sm};
    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.color.brandDark};
    }
  `,
  secondary: css`
    background-color: ${({ theme }) => theme.color.input};
    color: ${({ theme }) => theme.color.textBody};
    border: 1px solid ${({ theme }) => theme.color.borderStrong};
    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.color.hover};
    }
  `,
  ghost: css`
    color: ${({ theme }) => theme.color.textMuted};
    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.color.muted};
    }
  `,
  danger: css`
    background-color: #e11d48;
    color: #ffffff;
    &:hover:not(:disabled) {
      background-color: #be123c;
    }
  `,
  success: css`
    background-color: #059669;
    color: #ffffff;
    &:hover:not(:disabled) {
      background-color: #047857;
    }
  `,
} as const;

const StyledButton = styled.button<{ $variant: Variant; $size: Size }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
  padding: ${({ $size }) => ($size === "sm" ? "0.375rem 0.75rem" : "0.625rem 1rem")};

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  ${({ $variant }) => variantStyles[$variant]}
`;

export function Button({
  variant = "primary",
  size = "md",
  children,
  ...rest
}: ButtonProps) {
  return (
    <StyledButton $variant={variant} $size={size} {...rest}>
      {children}
    </StyledButton>
  );
}
