"use client";

import { Flex, List } from "antd";

import Link from "next/link";
import { LuFolderOpen } from "react-icons/lu";
import Title from "antd/es/typography/Title";
import { plural } from "@/util/text.util";
import styled from "styled-components";

interface ListFoldersProps {
  folders: {
    id: string;
    name: string;
    nrOfQuestionBooks: number;
  }[];
}

export function ListFolders({ folders }: ListFoldersProps) {
  return (
    <List
      dataSource={folders}
      renderItem={(item) => (
        <Folder>
          <Flex align="center" gap={16}>
            <LuFolderOpen size={24} />
            <Link href={`/question-books?pasta=${item.id}`}>
              <Title level={5}>{item.name}</Title>
            </Link>
          </Flex>
          <span>{plural("caderno", "cadernos", item.nrOfQuestionBooks)}</span>
        </Folder>
      )}
    />
  );
}

const Folder = styled(List.Item)`
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
