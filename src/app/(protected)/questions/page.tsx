import * as Styled from "./page.style";

import { Button, Divider, Flex, List, Pagination, Popover } from "antd";
import Item, { Meta } from "antd/es/list/Item";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import { DeleteQuestionButton } from "@/questions/delete/delete-question-button.component";
import { FaPencil } from "react-icons/fa6";
import HttpClient from "@/util/http-client/fetch-server.util";
import Link from "next/link";
import { PageLayout } from "@/ui/page-layout/page-layout.component";
// import { QuestionFormModulesSelection } from "@/questions/question-form-modules-selection.component";
import { QuestionModel } from "@/model/question.model";
import { QuestionPreview } from "@/questions/question-preview.component";
import { QuestionTextSearch } from "@/questions/question-text-search.component";
import { ResponseModel } from "@/model/common.model";
import { redirect } from "next/navigation";

function EditQuestionButton({ id }: { id: string }) {
    return (
        <Link key="edit" href={`/questions/${id}`}>
            <Flex gap={8} align="center">
                <FaPencil />
                <span>Editar</span>
            </Flex>
        </Link>
    );
}

export default async function QuestionsPage({
    searchParams,
}: {
    searchParams: Promise<{
        pagina: string;
        modulos: string;
        texto: string;
    }>;
}) {
    let total = 0;
    let newQuestionURL = "/questions/new";
    const { pagina: page, modulos: modulesIds, texto: searchText } = await searchParams;

    const search = new URLSearchParams();

    if (modulesIds) {
        newQuestionURL += `?modulos=${modulesIds}`;
        search.set("modulesIds", modulesIds);
    }

    if (searchText) {
        search.set("text", searchText);
    }

    if (page) {
        search.set("page", page);
    }

    const queryParams = search.toString() ? `?${search.toString()}` : "";

    let questions: QuestionModel[] = [];
    // let modules: { id: string; name: string }[] = [];
    try {
        const r = await HttpClient.fetch<
            ResponseModel<{ questions: QuestionModel[]; modules: { id: string; name: string }[] }>
        >(`/questions${queryParams}`, {
            method: "GET",
            next: { tags: [CACHE_TAGS.QUESTIONS] },
        });

        total = r.total ?? 0;
        questions = r.data?.questions ?? [];
        // modules = r.data?.modules ?? [];
    } catch {
        // fallback silencioso
        questions = [];
        // modules = [];
    }

    return (
        <PageLayout
            title="Questões"
            actions={[
                <Flex key="search-and-create" gap={16} align="center" style={{ width: "100%" }}>
                    <QuestionTextSearch
                        defaultValue={searchText || ""}
                        onSearch={async function changeQuery(text) {
                            "use server";

                            const newSearchParams = new URLSearchParams();
                            newSearchParams.set("pagina", "1");

                            if (modulesIds) {
                                newSearchParams.set("modulos", modulesIds);
                            }

                            if (text) {
                                newSearchParams.set("texto", text);
                            }

                            redirect(`/questions?${newSearchParams.toString()}`);
                        }}
                    />
                    <Link href={newQuestionURL}>
                        <Button type="primary" size="large">
                            Criar questão
                        </Button>
                    </Link>
                </Flex>,
            ]}
        >
            <Styled.ListContainer>
                <List>
                    {questions?.map((question) => (
                        <Item
                            key={question.id}
                            actions={[
                                <EditQuestionButton key="edit" id={question.id} />,
                                <DeleteQuestionButton key="delete" questionId={question.id} />,
                            ]}
                        >
                            <Meta
                                title={
                                    <Popover
                                        mouseEnterDelay={0.5}
                                        content={
                                            <Styled.QuestionPreview>
                                                <QuestionPreview
                                                    id={question.id}
                                                    type={question.type}
                                                    text={question.text}
                                                    alternatives={[]}
                                                    compact={true}
                                                />
                                                <Divider style={{ margin: "12px 0" }} />
                                                <EditQuestionButton key="edit" id={question.id} />
                                            </Styled.QuestionPreview>
                                        }
                                    >
                                        <Link href={`/questions/${question.id}`}>
                                            {question.text
                                                .replace(/<[^>]+>/g, "")
                                                .slice(0, 80)
                                                .trim()}
                                            ...
                                        </Link>
                                    </Popover>
                                }
                                description={question.id}
                            />
                        </Item>
                    ))}
                </List>
                <Divider />
                <Pagination
                    defaultCurrent={1}
                    current={parseInt(page ?? "1", 10)}
                    total={total}
                    onChange={async function changeQuery(page) {
                        "use server";

                        const newSearchParams = new URLSearchParams();
                        newSearchParams.set("pagina", page.toString());

                        if (modulesIds) {
                            newSearchParams.set("modulos", modulesIds);
                        }

                        if (searchText) {
                            newSearchParams.set("texto", searchText);
                        }

                        redirect(`/questions?${newSearchParams.toString()}`);
                    }}
                />
            </Styled.ListContainer>
        </PageLayout>
    );
}
