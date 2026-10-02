import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";
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

  const response = await HttpClient.fetch<ResponseModel<{
    id: string; text: string; type: string; comment: string | null;
    questionAlternatives: { id: string; text: string; isCorrect: boolean }[];
    modules: { id: string; name: string }[];
  }>>(`/questions/${encodeURIComponent(id)}`, { cache: "no-store" });
  const questionData = response.data;

  if (!questionData) {
    return <div>Questão não encontrada!</div>;
  }

  const rawAlternatives = questionData.questionAlternatives || [];
  const alternatives = rawAlternatives.map(a => ({
    id: String(a.id),
    text: String(a.text ?? ""),
    isCorrect: Boolean(a.isCorrect),
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
