"use client";
import * as S from "./styles";

interface AppQuestionCounterProps {
    question: number;
    total  : number;
}

export function AppQuestionCounter({ question, total }: AppQuestionCounterProps) {
    return (
        <S.Container>
            <h2>Questão {question} de {total}</h2>
        </S.Container>
    );
}
