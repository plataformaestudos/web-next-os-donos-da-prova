import styled from "styled-components";

export const LoadingContiner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 16px 0;
`;

export const LoadingText = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: #333333;
`;

export const LoadingModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 9999999999;
`;
