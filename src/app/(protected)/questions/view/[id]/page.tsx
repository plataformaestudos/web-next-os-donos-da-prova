import { createClient } from "@/util/supabase/server";
import { getQuestionStats } from "../api";
import { QuestionViewPageClient } from "./pageClient";

type Params = Promise<{ id: string }>

interface QuestionStats {
  totalAnswers: number;
  correctAnswers: number;
  accuracyPercentage: number;
  answers: Array<{
    id: string;
    alternativeId: string;
    isCorrect: boolean;
    answeredAt: string;
    alternativeText: string;
  }>;
}

interface QuestionData {
  id: string;
  text: string;
  type: string;
  comment: string | null;
  alternatives: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  module: {
    id: string;
    name: string;
  } | null;
  stats: QuestionStats | null;
}

export default async function QuestionViewPage(props: { params: Params }) {
  const { id } = await props.params;

  const supabase = await createClient();
  
  const { data: questionData } = await supabase
    .from("questions")
    .select(`
      id,
      text,
      type,
      comment,
      alternatives:question_alternatives ( id, text, is_correct ),
      modules:modules_questions ( ...modules(id, name) )
    `)
    .eq("id", id)
    .single();

  if (!questionData) {
    return <div>Questão não encontrada!</div>;
  }

  const rawAlternatives = questionData.alternatives || [];
  const alternatives = rawAlternatives.map((a: { id: string; text: string; is_correct: boolean }) => ({
    id: String(a.id),
    text: String(a.text ?? ""),
    isCorrect: Boolean(a.is_correct),
  }));

  
  const stats = await getQuestionStats(id);

  const question: QuestionData = {
    id: questionData.id,
    text: questionData.text,
    type: questionData.type,
    comment: questionData.comment,
    alternatives: alternatives,
    module: questionData.modules[0] || null,
    stats,
  };

  return <QuestionViewPageClient question={question} />;
}
