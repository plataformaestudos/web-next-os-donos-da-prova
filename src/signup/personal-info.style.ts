"use client";

import styled from "styled-components";

export const PersonalInfoFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;

  .ant-form-item {
    margin-bottom: 0;
    min-width: 0;
  }

  .ant-form-item-label > label {
    height: auto;
    font-size: 12px;
    font-weight: 600;
    color: ${({ theme }) => theme.colorText};
  }

  input,
  .ant-input-affix-wrapper {
    min-height: 40px;
    border-radius: 8px;
  }

  .ant-input-affix-wrapper input {
    min-height: 0;
  }

  input::placeholder {
    color: ${({ theme }) => theme.colorTextPlaceholder};
  }

  input:focus-visible,
  .ant-input-affix-wrapper:focus-within {
    outline: 2px solid ${({ theme }) => theme.colorPrimaryBorder};
    outline-offset: 2px;
  }
`;

export const FieldGroup = styled.fieldset`
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;

  legend {
    width: 100%;
    margin-bottom: 14px;
    padding: 0;
    color: ${({ theme }) => theme.colorText};
    font-size: 14px;
    font-weight: 600;
  }
`;

export const IdentificationGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr) minmax(0, 1.15fr) minmax(0, 1.4fr);
  gap: 20px 16px;

  @media (max-width: 1023px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const AddressGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.5fr);
  gap: 20px 16px;

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const AddressDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
`;

export const AddressDetailsGrid = styled(IdentificationGrid)`
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1.5fr) minmax(0, 0.7fr) minmax(0, 1fr);

  @media (max-width: 1023px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const PasswordGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 16px;

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const AddressLookupStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${({ theme }) => theme.colorTextSecondary};
  font-size: 13px;
`;

export const PasswordPanel = styled.div`
  margin-top: 18px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colorBorderSecondary};
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colorFillAlter};

  h3 {
    margin: 0 0 12px;
    color: ${({ theme }) => theme.colorTextSecondary};
    font-size: 12px;
    font-weight: 600;
  }

  ul {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  @media (max-width: 1023px) {
    ul {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 380px) {
    ul {
      grid-template-columns: minmax(0, 1fr);
    }
  }
`;

export const PasswordRequirement = styled.li<{ $valid: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 7px;
  color: ${({ theme }) => theme.colorText};
  font-size: 12px;
  line-height: 1.5;

  .anticon {
    flex-shrink: 0;
    margin-top: 3px;
    color: ${({ theme, $valid }) => $valid ? theme.colorSuccessText : theme.colorTextSecondary};
  }
`;

export const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;
