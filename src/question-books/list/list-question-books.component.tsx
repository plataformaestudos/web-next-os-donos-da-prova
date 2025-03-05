"use client";

import { Flex, List } from "antd";

import Link from "next/link";
import { LuBook } from "react-icons/lu";
import Title from "antd/es/typography/Title";
import styled from "styled-components";

interface ListQuestionBooksProps {
  questionBooks: {
    id: string;
    name: string;
  }[];
}

export function ListQuestionBooks({ questionBooks }: ListQuestionBooksProps) {
  return (
    <List
      dataSource={questionBooks}
      renderItem={(item) => (
        <QuestionBook>
          <Flex align="center" gap={16}>
            <LuBook size={24} />
            <Link href={`/question-books/${item.id}`}>
              <Title level={5}>{item.name}</Title>
            </Link>
          </Flex>
        </QuestionBook>
      )}
    />
  );
}

const QuestionBook = styled(List.Item)`
  display: flex;
  align-items: center;

  padding: 16px 24px !important;
  margin-bottom: 4px;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colorBgContainer};

  h5 {
    margin: 0 !important;
  }

  a:hover {
    text-decoration: underline;
    text-decoration-color: ${({ theme }) => theme.colorText};
    text-decoration-thickness: 2px;
  }
`;
