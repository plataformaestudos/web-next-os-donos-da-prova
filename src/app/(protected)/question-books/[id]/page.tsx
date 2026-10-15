import { getQuestionBook } from "../api";
import { QuestionBookPageClient } from "./pageClient";

type Params = Promise<{ id: string }>
type SearchParams = Promise<{ seq?: string, seqRandom?: string }>


export default async function QuestionBookPage(props: { params: Params, searchParams: SearchParams }) {
  const { id } = await props.params;
  const filter = await props.searchParams;
  const questionBook = await getQuestionBook(id, filter);
  return <QuestionBookPageClient id={id} questionBook={questionBook} />;
}
