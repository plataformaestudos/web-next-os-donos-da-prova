"use client";

import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { Roles } from "@/util/roles";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Breadcrumb, Button } from "antd";
import { LuBook } from "react-icons/lu";
import { FullPageLoading } from "@/ui/loading/full-page-loading";
import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { CreateFolderButton } from "@/question-books/create-folder/create-folder-button.component";
import { ListFolders } from "@/question-books/list-folders/list-folders.component";
import { ListQuestionBooks } from "@/question-books/list/list-question-books.component";
import { BookFolderWithQuestionBooksModel, QuestionBookBookFolderModel } from "@/question-books/book-folder.model";


interface Props {
    initialFolders: BookFolderWithQuestionBooksModel;
    folderId?: string;
}

export function QuestionBooksClient({ initialFolders, folderId }: Props) {
    const { allowed, loading } = useAuthGuard({
        requireRoles: [Roles.ADMIN, Roles.STUDENT],
    });
    const [folders, setFolders] = useState(initialFolders.folders);
    const [questionBooksWithoutFolder, setQuestionBooksWithoutFolder] = useState(initialFolders.questionBooksWithoutFolder);

    useEffect(() => {
        setFolders(initialFolders.folders || []);
    }, [initialFolders]);
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
                    {folderId && <ListQuestionBooks questionBooks={questionBooks} folders={folders} setQuestionBooksWithoutFolder={setQuestionBooksWithoutFolder} />}
                </>

            )}
            {questionBooksWithoutFolder.length > 0 && !folderId && (
                <>
                    <Breadcrumb
                        style={{ margin: "24px 0" }}
                        items={[{ title: <Link href="/question-books">Meus cadernos</Link> }]}
                    />
                    <ListQuestionBooks questionBooks={questionBooksWithoutFolder} folders={folders}  setQuestionBooksWithoutFolder={setQuestionBooksWithoutFolder}/>
                </>
            )}
        </PageLayout>
    );
}

