"use client";

import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { Roles } from "@/util/roles";
import Link from "next/link";
import { useState } from "react";
import { Breadcrumb, Button } from "antd";
import { LuBook } from "react-icons/lu";
import { FullPageLoading } from "@/ui/loading/full-page-loading";
import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { CreateFolderButton } from "@/question-books/create-folder/create-folder-button.component";
import { ListFolders } from "@/question-books/list-folders/list-folders.component";
import { ListQuestionBooks } from "@/question-books/list/list-question-books.component";
import { BookFolderModel, QuestionBookBookFolderModel } from "@/question-books/book-folder.model";

type Folder = {
    id: string;
    name: string;
    questionBooks: { id: string; name: string; folder_id?: string }[];
    nrOfQuestionBooks: number;
};

interface Props {
    initialFolders: BookFolderModel;
    folderId?: string;
}

export function QuestionBooksClient({ initialFolders, folderId }: Props) {
    const { allowed, loading } = useAuthGuard({
        requireRoles: [Roles.ADMIN, Roles.STUDENT],
    });
    const [folders] = useState(initialFolders.folders);
    const [questionBooksWithoutFolder] = useState(initialFolders.questionBooksWithoutFolder);
    if (loading) return <FullPageLoading />;

    if (!allowed) return null;

    let newQuestionBookURL = "/question-books/new";

    const breadcrumbItems = [
        { title: <Link href="/question-books">Minhas pastas</Link> },
    ];

    let questionBooks: QuestionBookBookFolderModel[] = [];

    if (folderId && folders) {
        const folder = folders.find((f) => f.id === folderId);
        if (folder) {
            breadcrumbItems.push({ title: <span>{folder.name}</span> });
            questionBooks = folder.questionBooks;
            newQuestionBookURL += `?pasta=${folderId}`;
        }
    }

    return (
        <PageLayout
            title="Cadernos de questões"
            actions={[
                <CreateFolderButton key="create-folder" />,
                <Link key="create-book" href={newQuestionBookURL}>
                    <Button type="primary" size="large" icon={<LuBook />}>
                        Criar caderno
                    </Button>
                </Link>,
            ]}
        >
            {folders && (
                <>
                    <Breadcrumb style={{ marginBottom: 24 }} items={breadcrumbItems} />
                    {!folderId && <ListFolders folders={folders} />}
                    {folderId && <ListQuestionBooks questionBooks={questionBooks} />}
                </>

            )}
            {questionBooksWithoutFolder.length > 0 && !folderId && (
                <>
                    <Breadcrumb
                        style={{ margin: "24px 0" }}
                        items={[{ title: <Link href="/question-books">Meus cadernos</Link> }]}
                    />
                    <ListQuestionBooks questionBooks={questionBooksWithoutFolder} />
                </>
            )}
        </PageLayout>
    );
}

