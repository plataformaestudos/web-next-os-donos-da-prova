"use client";

import { AnswerQuestion } from "./answer-question/answer-question.component";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { Tabs } from "antd";
import styled from "styled-components";

interface QuestionBookProps {
  nextQuestion: {
    id: string;
    text: string;
    alternatives: {
      id: string;
      text: string;
    }[];
  };
}

export function QuestionBook({ nextQuestion }: QuestionBookProps) {
  return (
    <Container>
      <Tabs
        items={[
          {
            key: "1",
            label: "Questões",
            icon: <QuestionCircleOutlined />,
            children: <AnswerQuestion {...nextQuestion} />,
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
