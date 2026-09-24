import type { SelectHTMLAttributes } from "react";
import styled from "styled-components";

export interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
}

const Label = styled.label`
  display: block;
`;

const LabelText = styled.span`
  margin-bottom: 0.25rem;
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.color.textBody};
`;

const StyledSelect = styled.select`
  width: 100%;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.color.borderStrong};
  background-color: ${({ theme }) => theme.color.input};
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${({ theme }) => theme.color.text};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.color.brand};
    box-shadow: 0 0 0 2px rgba(24, 119, 242, 0.3);
  }
`;

export function Select({ label, options, ...rest }: SelectProps) {
  return (
    <Label>
      {label && <LabelText>{label}</LabelText>}
      <StyledSelect {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </StyledSelect>
    </Label>
  );
}
