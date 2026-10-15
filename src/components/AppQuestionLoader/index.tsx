"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Button } from "antd";
import HttpClient from "@/util/http-client/fetch-client.util";
import { AnswerQuestion } from "@/question-books/answer-question/answer-question.component";
import { QuestionBookModel, QuestionBookNextQuestionModel } from "@/question-books/question-book.model";
import { ResponseModel } from "@/model/common.model";
import { AppLoading } from "../AppLoading";

interface AppQuestionLoaderProps {
    id: string;
    questionBook: QuestionBookModel;
    question: QuestionBookNextQuestionModel;
    setQuestion: (question: QuestionBookNextQuestionModel) => void;
    onAnswerSubmitted?: () => void;
}

export function AppQuestionLoader({ id, questionBook, question, setQuestion, onAnswerSubmitted }: AppQuestionLoaderProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const request = useRef<AbortController | null>(null);
    const currentQuestion = useRef(question);
    currentQuestion.current = question;
    const retry = useRef<() => void>(() => {});

    const loadQuestion = useCallback(async (seq?: number | null, random = false, pushHistory = true) => {
        if (request.current) return;
        const controller = new AbortController();
        request.current = controller;
        setIsLoading(true);
        setError(null);
        const params = new URLSearchParams({ onlyNotAnswered: "false" });
        if (seq != null) params.set("seq", String(seq));
        if (random) params.set("seqRandom", "true");
        retry.current = () => { void loadQuestion(seq, random, pushHistory); };
        try {
            const response = await HttpClient.fetch<ResponseModel<QuestionBookNextQuestionModel>>(
                `/question-books/${id}/next-question?${params}`,
                { method: "GET", cache: "no-store", signal: controller.signal },
                false,
            );
            if (controller.signal.aborted) return;
            setQuestion(response.data);
            if (pushHistory) {
                const url = new URL(window.location.href);
                url.searchParams.delete("seqRandom");
                url.searchParams.set("seq", String(response.data.orderDetails.questionOrder));
                if (url.href !== window.location.href) window.history.pushState(null, "", url);
            }
        } catch (caught) {
            if (!controller.signal.aborted) setError(caught instanceof Error ? caught.message : "Não foi possível carregar a questão.");
        } finally {
            if (request.current === controller) {
                request.current = null;
                if (!controller.signal.aborted) setIsLoading(false);
            }
        }
    }, [id, setQuestion]);

    useEffect(() => {
        // Native history preserves Back/Forward without fetching the book again.
        const url = new URL(window.location.href);
        url.searchParams.delete("seqRandom");
        url.searchParams.set("seq", String(currentQuestion.current.orderDetails.questionOrder));
        window.history.replaceState(null, "", url);
        const restore = () => {
            const target = new URL(window.location.href);
            if (![ `/cadernos/${id}`, `/question-books/${id}` ].includes(target.pathname)) return;
            request.current?.abort();
            request.current = null;
            setIsLoading(false);
            setError(null);
            const seq = Number(target.searchParams.get("seq"));
            if (Number.isInteger(seq) && seq > 0 && seq !== currentQuestion.current.orderDetails.questionOrder) {
                void loadQuestion(seq, false, false);
            }
        };
        window.addEventListener("popstate", restore);
        return () => {
            window.removeEventListener("popstate", restore);
            request.current?.abort();
            request.current = null;
        };
    }, [id, loadQuestion]);

    if (!question) return <p>Nenhuma questão encontrada!</p>;
    return (
        <>
            {error && <Alert type="warning" showIcon message={error} style={{ marginBottom: 12 }} action={<Button onClick={() => retry.current()}>Tentar novamente</Button>} />}
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
                onAnswerSubmitted={onAnswerSubmitted}
                onNavigateQuestion={(seq, random) => { void loadQuestion(seq, random); }}
            />
            {isLoading && <AppLoading show={isLoading} loadingModal />}
        </>
    );
}
