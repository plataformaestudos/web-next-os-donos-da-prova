// EditQuestionPage.tsx (Server Component)
import { createClient } from "@/util/supabase/server";
import { EditQuestionPageClient } from "./pageClient";

type Params = Promise<{ id: string }>

export default async function EditQuestionPage(props: { params: Params } ) {
  const { id } = await props.params;

  const supabase = await createClient();
  const { data } = await supabase
    .from("questions")
    .select(`
      id,
      text,
      type,
      comment,
      alternatives:question_alternatives ( id, text, is_correct ),
      modules:modules_questions ( ...modules(id, name) )
    `)
    .eq("id", id);

  const question = data?.[0];

  if (!question) return null;

  return <EditQuestionPageClient question={question} />;
}
