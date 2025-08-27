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
import { App } from "antd";
import { AppLoading } from "../AppLoading";

interface AppQuestionLoaderProps {
  id: string;
  seq?: string;
  questionBook: QuestionBookModel;
}

export function AppQuestionLoader({
  id,
  seq,
  questionBook,
}: AppQuestionLoaderProps) {
  const [question, setQuestion] = useState(questionBook.nextQuestion);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { message } = App.useApp();

  useEffect(() => {
    async function getQuestionBookQuestion(id: string, seq: string) {
      const params = new URLSearchParams();

      if (seq !== undefined) {
        params.set("seq", seq);
      }

      const falseString = false;

      params.set("onlyNotAnswered", falseString.toString());

      setIsLoading(true);
      return HttpClient.fetch<ResponseModel<QuestionBookNextQuestionModel>>(
        `/question-books/${id}/next-question?${params}`,
        {
          method: "GET",
          next: {
            tags: [CACHE_TAGS.QUESTION_BOOKS],
          },
        }
      )
        .then((response) => response.data)
        .catch((err) => {
          message.error(err.message || "Erro ao carregar próxima questão");
        })
        .finally(() => setIsLoading(false));
    }

    if (
      seq &&
      parseInt(seq) !== questionBook.nextQuestion.orderDetails.questionOrder
    ) {
      getQuestionBookQuestion(id, seq)
        .then((response) => setQuestion(response ?? questionBook.nextQuestion))
        .catch(() => {
          message.error(
            "Limite de questões atingido, aguarde seu limite ser renovado, ou mude seu plano."
          );
        });
    }
  }, [id, seq, questionBook, message]);

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
        module={question.module}
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
