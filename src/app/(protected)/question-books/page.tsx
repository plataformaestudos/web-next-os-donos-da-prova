import { QuestionBooksClient } from "./pageClient";
import { getBookFolders } from "./api";
type SearchParams = Promise<{ pasta: string }>
export default async function QuestionBooks(props: { searchParams: SearchParams }) {
    const { pasta } = await props.searchParams;

    const result = await getBookFolders();

    return (
        <QuestionBooksClient
            initialFolders={result || { folder: [], questionBooksWithoutFolder: [] }}
            folderId={pasta}
        />
    );
}
