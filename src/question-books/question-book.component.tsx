"use client";

import { QuestionCircleOutlined } from "@ant-design/icons";
import { Tabs } from "antd";
import styled from "styled-components";

export function QuestionBook() {
  return (
    <Container>
      <Tabs
        items={[
          {
            key: "1",
            label: "Questões",
            icon: <QuestionCircleOutlined />,
            children: "Content of Tab Pane 1",
          },
        ]}
      />
    </Container>
  );
}

const Container = styled.div`
  flex: 1;

  padding: 8px 24px 24px;
  background-color: ${({ theme }) => theme.colorBgContainer};

  border-radius: 6px;
`;
