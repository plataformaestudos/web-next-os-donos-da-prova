import { getQuestionBook } from "../api";
import { QuestionBookPageClient } from "./pageClient";
import { HttpError } from "@/lib/errors";
import { parseStudyAccessBlock } from "@/free-plan-upgrade/study-access.model";
import { StudyAccessBlocked } from "@/free-plan-upgrade/study-access-blocked.component";

type Params = Promise<{ id: string }>
type SearchParams = Promise<{ seq?: string, seqRandom?: string }>


export default async function QuestionBookPage(props: { params: Params, searchParams: SearchParams }) {
  const { id } = await props.params;
  const filter = await props.searchParams;
  try {
    const questionBook = await getQuestionBook(id, filter);
    return <QuestionBookPageClient id={id} questionBook={questionBook} />;
  } catch (error) {
    const blocked = error instanceof HttpError ? parseStudyAccessBlock(error.status, error.data) : null;
    if (blocked) return <StudyAccessBlocked access={blocked} />;
    throw error;
  }
}
