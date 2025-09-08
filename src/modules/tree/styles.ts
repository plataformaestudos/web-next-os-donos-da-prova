import { styled } from "styled-components";

export const TreeContainer = styled.div`
  .tree-item {
    background-color: ${({ theme }) => theme.colorSecondary};
    border-radius: 4px;
  }

  .ant-tree .ant-tree-switcher:before {
    height: 100%;
    width: 100%;
    border-radius: 4px !important;
    padding: 0px !important;
    margin: 0px !important;
  }

  .ant-tree-node-content-wrapper .ant-tree-node-content-wrapper-close {
    margin: 0px !important;
    padding: 0px !important;
  }
`;
