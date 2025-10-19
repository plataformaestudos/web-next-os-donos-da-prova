"use client";

import { useEffect, useState } from "react";
import HttpClient from "@/util/http-client/fetch-client.util";
import { AnswerQuestion } from "@/question-books/answer-question/answer-question.component";
import {
    QuestionBookModel,
    QuestionBookNextQuestionModel,
} from "@/question-books/question-book.model";
import { CACHE_TAGS } from "@/util/cache-tags.util";
import { ResponseModel } from "@/model/common.model";
import { AppLoading } from "../AppLoading";

interface AppQuestionLoaderProps {
    id: string;
    seq?: string;
    questionBook: QuestionBookModel;
    question: QuestionBookNextQuestionModel;
    setQuestion: (q: QuestionBookNextQuestionModel) => void;
}

export function AppQuestionLoader({
    id,
    seq,
    questionBook,
    question,
    setQuestion,
}: AppQuestionLoaderProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        async function getQuestionBookQuestion(id: string, seq: string) {
            const params = new URLSearchParams();
            if (seq !== undefined) params.set("seq", seq);

            params.set("onlyNotAnswered", "false");

            setIsLoading(true);
            try {
                const response = await HttpClient.fetch<ResponseModel<QuestionBookNextQuestionModel>>(
                    `/question-books/${id}/next-question?${params}`,
                    {
                        method: "GET",
                        next: {
                            tags: [CACHE_TAGS.QUESTION_BOOKS],
                        },
                    },
                    true
                );

                return response.data;
            } finally {
                setIsLoading(false);
            }
        }

        if (seq && parseInt(seq) !== question.orderDetails.questionOrder) {
            getQuestionBookQuestion(id, seq)
                .then((data) => setQuestion(data ?? questionBook?.nextQuestion));
        }
    }, [id, seq, questionBook]);


    return question ? (
        <>
            <AnswerQuestion
                key={question.id}
                questionBookId={questionBook.id}
                questionBookQuestionId={question.id}
                comment={question.comment}
                type={question.type}
                text={question.text}
                alternatives={question.alternatives}
                orderDetails={question.orderDetails}
                userAnswer={question.userAnswer}
                totalQuestions={questionBook.questionBookStats.totalQuestions}
            />
            {isLoading && (
                <AppLoading
                    show={isLoading}
                    loadingModal
                />
            )}
        </>
    ) : (
        <p>Nenhuma questão encontrada!</p>
    );
}
