import HttpClient from "@/util/http-client/fetch-client.util";
import { ResponseModel } from "@/model/common.model";

export interface CreateQuestionSubscriptionDto {
  questionId: string;
}

export interface QuestionSubscription {
  id: string;
  questionId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export class QuestionSubscriptionsService {
  async create(data: CreateQuestionSubscriptionDto): Promise<ResponseModel<QuestionSubscription>> {
    return HttpClient.fetch<ResponseModel<QuestionSubscription>>(
      "/question_subscriptions",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      false
    );
  }

  async delete(questionId: string): Promise<ResponseModel<void>> {
    return HttpClient.fetch<ResponseModel<void>>(
      `/question_subscriptions/${questionId}`,
      {
        method: "DELETE",
      },
      false
    );
  }

  async checkSubscription(questionId: string): Promise<ResponseModel<boolean>> {
    return HttpClient.fetch<ResponseModel<boolean>>(
      `/question_subscriptions/check/${questionId}`,
      {
        method: "GET",
      },
      false
    );
  }
}
