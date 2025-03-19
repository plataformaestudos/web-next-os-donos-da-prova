"use client";

import { InputMask, MaskOptions } from "@react-input/mask";

import { HTMLProps } from "react";
import styled from "styled-components";

const StyledInput = styled.input`
  padding: 4px 11px;
  border: 1px solid ${({ theme }) => theme.colorBorder};
  background-color: ${({ theme }) => theme.colorBgContainer};
  border-radius: ${({ theme }) => theme.borderRadius}px;
  width: 100%;
  height: 32px;
  outline: none;
  font-size: 14px;

  transition: border-color 200ms ease-in-out;

  &:hover {
    border-color: ${({ theme }) => theme.colorPrimaryHover};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colorPrimaryHover};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colorPrimaryBorder}1a;
  }
`;

function CustomInput(props: HTMLProps<HTMLInputElement>) {
  return <StyledInput {...props} />;
}

export function MaskedInput(props: MaskOptions & HTMLProps<HTMLInputElement>) {
  return <InputMask component={CustomInput} {...props} />;
}
