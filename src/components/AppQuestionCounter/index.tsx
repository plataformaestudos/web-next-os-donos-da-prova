"use client";
import * as S from "./styles";

interface AppQuestionCounterProps {
  question: number;
}

export function AppQuestionCounter({ question }: AppQuestionCounterProps) {
  return (
    <S.Container>
      <h2>Questão {question}</h2>
    </S.Container>
  );
}
