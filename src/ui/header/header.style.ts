import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 16px;
  height: 80px;

  @media (min-width: 640px) {
    height: 4rem;
  }
`;

export const RightContent = styled.div`
display: flex;
align-items: center;
gap: 16px;
margin-left: auto;
`;
