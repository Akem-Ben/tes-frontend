import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import styled, { css } from "styled-components";

const fieldStyles = css`
  width: 100%;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.color.borderStrong};
  background-color: ${({ theme }) => theme.color.input};
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${({ theme }) => theme.color.text};
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.color.textSoft};
  }

  &:focus {
    border-color: ${({ theme }) => theme.color.brand};
    box-shadow: 0 0 0 2px rgba(24, 119, 242, 0.3);
  }
`;

const StyledInput = styled.input`
  ${fieldStyles}
`;

const StyledTextarea = styled.textarea`
  ${fieldStyles}
`;

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

const Hint = styled.span`
  margin-top: 0.25rem;
  display: block;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  textarea?: false;
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  textarea: true;
}

/** Shared text field: pass `textarea` to render a multi-line field instead. */
export function Input(props: InputProps | TextAreaProps) {
  const { label, hint } = props;
  return (
    <Label>
      {label && <LabelText>{label}</LabelText>}
      {props.textarea ? (
        <StyledTextarea {...stripped(props)} rows={props.rows ?? 3} />
      ) : (
        <StyledInput {...stripped(props)} />
      )}
      {hint && <Hint>{hint}</Hint>}
    </Label>
  );
}

// Keep our own props out of the DOM element.
const stripped = <
  T extends { label?: string; hint?: string; textarea?: boolean },
>(
  props: T,
) => {
  const { label: _l, hint: _h, textarea: _t, ...rest } = props;
  return rest;
};
