// EditQuestionPage.tsx (Server Component)
import { loadManagedQuestion } from "@/services/content-management.server";
import { EditQuestionPageClient } from "./pageClient";

type Params = Promise<{ id: string }>

export default async function EditQuestionPage(props: { params: Params } ) {
  const { id } = await props.params;

  const question = await loadManagedQuestion(id);

  if (!question) return null;

  return <EditQuestionPageClient question={question} />;
}
