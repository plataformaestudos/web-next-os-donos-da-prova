// src/app/(protected)/questions/[idModule]/page.tsx
import * as Styled from "./page.style";

import { Button, Divider, Empty, Flex, List, Pagination, Popover } from "antd";
import Item, { Meta } from "antd/es/list/Item";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import { DeleteQuestionButton } from "@/questions/delete/delete-question-button.component";
import { FaPencil } from "react-icons/fa6";
import HttpClient from "@/util/http-client/fetch-server.util";
import Link from "next/link";
import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { QuestionPreview } from "@/questions/question-preview.component";
import { QuestionModel } from "@/model/question.model";
import { ResponseModel } from "@/model/common.model";
import { redirect } from "next/navigation";
import { QuestionTextSearch } from "@/questions/question-text-search.component";

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

type Params = Promise<{ idModule: string }>
type SearchParams = Promise<{ pagina?: string,  texto: string; }>

export default async function QuestionsByModulePage(props: { params: Params, searchParams: SearchParams }) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const { texto: searchText } = await searchParams;
    const { idModule } = params;
    const { pagina: page = "1" } = searchParams;


    let total = 0;
    const newQuestionURL = `/questions/new?modulo=${idModule}`;
    const search = new URLSearchParams();

    search.set("modulesIds", idModule);
    if (page) {
        search.set("page", page.toString());
    }

    if (searchText) {
        search.set("text", searchText);
    }

    const queryParams = `?${search.toString()}`;

    let questions: QuestionModel[] = [];
    let currentModule: { id: string; name: string } = { id: "", name: "" };
    try {
        const r = await HttpClient.fetch<
            ResponseModel<{ questions: QuestionModel[]; modules: { id: string; name: string }[] }>
        >(`/questions${queryParams}`, {
            method: "GET",
            next: { tags: [CACHE_TAGS.QUESTIONS] },
        });
        total = r.total ?? 0;
        questions = r.data?.questions ?? [];
        currentModule = r.data?.modules?.find((m) => m.id === idModule) ?? { id: "", name: "" };
    } catch {
        // fallback silencioso
        questions = [];
    }

    return (

        <PageLayout
            title={`${currentModule.name || ""}`}
            backHref="/modules"
            actions={[
                <Flex key="search-and-create" gap={16} align="center" style={{ width: "100%" }}>
                    <QuestionTextSearch
                        defaultValue={searchText || ""}
                        onSearch={async function changeQuery(text) {
                            "use server";

                            const newSearchParams = new URLSearchParams();
                            newSearchParams.set("pagina", "1");

                            newSearchParams.set("modulos", idModule);

                            if (text) {
                                newSearchParams.set("texto", text);
                            }

                            redirect(`/questions/module/${idModule}?${newSearchParams.toString()}`);
                        }}
                    />
                    <Link key="create" href={newQuestionURL}>
                        <Button type="primary" size="large">
                            Criar questão
                        </Button>
                    </Link>
                </Flex>,
            ]}
        >
            {questions && questions.length === 0 ? (
                <Empty description="Esse módulo não possui questões." />
            ) : (
                <>
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
                            current={parseInt(page.toString() ?? "1", 10)}
                            total={total}
                            onChange={async function changeQuery(newPage) {
                                "use server";
                                const newSearchParams = new URLSearchParams();
                                newSearchParams.set("pagina", newPage.toString());
                                if (searchText) {
                                    newSearchParams.set("texto", searchText);
                                }
                                redirect(`/questions/module/${idModule}?${newSearchParams.toString()}`);
                            }}
                        />
                    </Styled.ListContainer>
                </>
            )}
        </PageLayout>
    );
}
