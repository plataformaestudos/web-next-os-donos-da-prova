import styled from "styled-components";

export const Container = styled.div`
  padding: 4px 24px;
  background: ${(props) => props.theme.colorTertiary};
  width: fit-content;

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: ${(props) => props.theme.colorWhite};
  }
`;
