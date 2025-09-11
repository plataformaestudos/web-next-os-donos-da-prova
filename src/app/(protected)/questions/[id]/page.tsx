// EditQuestionPage.tsx (Server Component)
import { createClient } from "@/util/supabase/server";
import { EditQuestionPageClient } from "./pageClient";

export default async function EditQuestionPage({ params }: any) {
  const { id } = await params;

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
