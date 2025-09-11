// QuestionBookPage.tsx (Server Component)
import { getQuestionBook } from "../api";
import { QuestionBookPageClient } from "./pageClient";

export default async function QuestionBookPage({ params, searchParams }: any) {
  const { id } = await params;
  const { seq } = await searchParams;

  const questionBook = await getQuestionBook(id);

  return <QuestionBookPageClient id={id} seq={seq} questionBook={questionBook} />;
}
