"use client";

import { Flex, Input, InputNumber, Select, Typography } from "antd";
import { useMemo, useState } from "react";

import { CREATE_QUESTION_BOOK_FORM_ID } from "./create-question-book-form.constant";
import { FaChevronDown } from "react-icons/fa6";
import { ModuleViewModel } from "@/model/module.model";
import { ModulesTree } from "@/modules/tree/modules-tree.component";
import { QuestionBookDTO } from "./question-book.dto";
import { plural } from "@/util/text.util";
import styled from "styled-components";
import { useCreateQuestionBook } from "./create-question-book.context";

interface Props {
  questionBook?: Partial<QuestionBookDTO>;
  modules: {
    loadData: (key: string) => Promise<Array<ModuleViewModel>>;
    data: Array<ModuleViewModel>;
  };
  folders: Array<{
    id: string;
    name: string;
  }>;
}

export function QuestionBookForm({ questionBook, modules, folders }: Props) {
  const { createQuestionBook, error } = useCreateQuestionBook();

  const [name, setName] = useState(questionBook?.name);
  const [folderId, setFolderId] = useState(questionBook?.folderId);
  const [modulesQuantities, setModulesQuantities] = useState(
    new Map(
      questionBook?.modules?.map(({ moduleId, quantityQuestions }) => [
        moduleId,
        quantityQuestions,
      ]) ?? []
    )
  );
  const [checkedModules, setCheckedModules] = useState<ModuleViewModel[]>([]);
  const checkedModulesIds = useMemo(
    () => checkedModules.map(({ id }) => id),
    [checkedModules]
  );

  const filteredModules = useMemo(() => {
    return modules.data.filter((module) => module.numberQuestions > 0);
  }, [modules.data]);

  return (
    <Container>
      <form
        id={CREATE_QUESTION_BOOK_FORM_ID}
        action={() =>
          createQuestionBook({
            name: name as string,
            folderId: folderId as string,
            modules: Array.from(modulesQuantities.entries()).map(
              ([moduleId, quantityQuestions]) => ({
                moduleId,
                treeCode: checkedModules.find(({ id }) => id === moduleId)
                  ?.treeCode as string,
                quantityQuestions,
              })
            ),
          })
        }
      >
        <Flex vertical>
          <p>Filtrar questões</p>
          <GroupsContainer>
            <Group>
              <GroupTitle>Módulos</GroupTitle>
              <GroupContent>
                <ModulesTree
                  modules={filteredModules}
                  loadData={(key) =>
                    modules.loadData(key).then((tree) => {
                      return tree.filter(
                        (module) => module.numberQuestions > 0
                      );
                    })
                  }
                  readonly
                  checkable
                  onCheck={({ checkedLeaves: modules }) => {
                    modules.map((module) => {
                      if (!modulesQuantities.has(module.id)) {
                        modulesQuantities.set(
                          module.id,
                          module.numberQuestions
                        );
                      }
                    });
                    setCheckedModules(modules);
                  }}
                />
              </GroupContent>
            </Group>
            <Group>
              <GroupTitle>Filtros ativos</GroupTitle>
              <GroupContent>
                <Flex justify="space-between" gap={8}>
                  <b style={{ width: "75%" }}>
                    <span>Módulo</span>
                  </b>
                  <b
                    style={{
                      flex: 1,
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span>Questões no caderno</span>
                  </b>
                </Flex>
                <Flex vertical gap={8}>
                  {checkedModules.map(({ id, name, numberQuestions }) => (
                    <Flex
                      key={id}
                      align="center"
                      justify="space-between"
                      gap={8}
                    >
                      <Typography.Text ellipsis style={{ width: "75%" }}>
                        {name}
                      </Typography.Text>
                      <InputNumber
                        min={0}
                        max={numberQuestions}
                        size="small"
                        value={modulesQuantities.get(id)}
                        onChange={(value) => {
                          const newMap = new Map(modulesQuantities);
                          if (value) {
                            newMap.set(id, value);
                          } else {
                            newMap.delete(id);
                          }
                          setModulesQuantities(newMap);
                        }}
                      />
                    </Flex>
                  ))}
                </Flex>
                <Flex justify="end">
                  <b>
                    <span>
                      {plural(
                        "questão",
                        "questões",
                        modulesQuantities
                          .entries()
                          .filter(([key]) => checkedModulesIds.includes(key))
                          .map(([, value]) => value)
                          .reduce((value, acc) => value + acc, 0)
                      )}
                    </span>
                  </b>
                </Flex>
              </GroupContent>
            </Group>
          </GroupsContainer>
        </Flex>
        <Flex gap={8}>
          <div style={{ flex: 2 }}>
            <p>Nome do caderno</p>
            <Input value={name} onChange={(ev) => setName(ev.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <p>Pasta</p>
            <Select
              style={{ width: "100%" }}
              suffixIcon={<FaChevronDown />}
              placeholder="Pasta"
              value={folderId}
              onChange={(id) => setFolderId(id)}
              options={folders.map((folder) => ({
                value: folder.id,
                label: folder.name,
              }))}
            />
          </div>
        </Flex>

        {error && <Typography.Text type="danger">{error}</Typography.Text>}
      </form>
    </Container>
  );
}

const Container = styled.div`
  background-color: ${({ theme }) => theme.colorBgContainer};

  padding: 12px 16px;
  border-radius: 6px;
`;

const GroupsContainer = styled.div`
  display: flex;
  margin: 12px 0;
  gap: 8px;

  @media (max-width: 640px) {
    flex-wrap: wrap;
  }
`;

const Group = styled.div`
  width: 100%;

  @media (min-width: 640px) {
    width: 50%;
  }

  background-color: ${({ theme }) => theme.colorBgContainerDisabled};
  border: 1px solid ${({ theme }) => theme.colorBorder};
  padding: 6px 8px;
  border-radius: 6px;
`;

const GroupTitle = styled.div`
  margin: -6px -8px 8px;
  padding: 6px 8px;
  border-radius: 6px 6px 0 0;
  background-color: ${({ theme }) => theme.colorPrimaryBg};
  border-bottom: 1px solid ${({ theme }) => theme.colorBorder};
  font-weight: bold;
`;

const GroupContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
