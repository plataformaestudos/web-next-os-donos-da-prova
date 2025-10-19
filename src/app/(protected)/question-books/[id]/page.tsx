import { getQuestionBook } from "../api";
import { QuestionBookPageClient } from "./pageClient";

type Params = Promise<{ id: string }>
type SearchParams = Promise<{ seq: string }>


export default async function QuestionBookPage(props: { params: Params, searchParams: SearchParams }) {
  const { id } = await props.params;
  let { seq } = await props.searchParams;

  const questionBook = await getQuestionBook(id);

  if ( parseInt(seq) > questionBook.questionBookStats.totalQuestions) {
    seq = questionBook.questionBookStats.totalQuestions.toString();
  }


  return <QuestionBookPageClient id={id} seq={seq} questionBook={questionBook} />;
}
