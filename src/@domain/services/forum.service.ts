import { ForumOrderBy, ForumPostModel } from "@/model/forum.model";
import { Forum } from "../entities/forum.entity";
import HttpClient from "@/util/http-client/fetch-client.util";
import { ResponseModel } from "@/model/common.model";
import { CACHE_TAGS } from "@/util/cache-tags.util";

export class ForumService extends Forum {
  constructor(service: ForumPostModel) {
    super(service);
  }

  async getAll(params: {
    page: number;
    limit: number;
    orderBy: ForumOrderBy;
    questionId?: string;
  }): Promise<ResponseModel<ForumPostModel[]>> {
    const { page, limit, orderBy, questionId } = params;

    try {
      const response = await HttpClient.fetch<ResponseModel<ForumPostModel[]>>(
        `/comments/by-question/${questionId}?page=${page}&itemsPerPage=${limit}&sortBy=${orderBy}&sortOrder=DESC`,
        {
          method: "GET",
          next: {
            tags: [CACHE_TAGS.MENUS],
          },
        }
      )
        .then((response) => {
          return response;
        })
        .catch((err) => {
          console.error(err);
          throw new Error(
            "Erro ao buscar as discussões. Tente novamente mais tarde."
          );
        });

      return response;
    } catch (error) {
      console.error("Erro ao buscar as discussões:", error);
      throw new Error(
        "Erro ao buscar as discussões. Tente novamente mais tarde."
      );
    }
  }

  async votePost(): Promise<void> {
    const { id, userVote } = this;

    try {
      await HttpClient.fetch<ResponseModel<void>>(`/comments_votes`, {
        method: "POST",
        next: {
          tags: [CACHE_TAGS.MENUS],
        },
        body: JSON.stringify({
          commentId: id,
          value: userVote,
        }),
      })
        .then(() => {
          return;
        })
        .catch((err) => {
          console.error(err);
          throw new Error(
            "Erro ao votar na discussão. Tente novamente mais tarde."
          );
        });
      return;
    } catch (error) {
      console.error("Erro ao votar na discussão:", error);
      throw new Error(
        "Erro ao votar na discussão. Tente novamente mais tarde."
      );
    }
  }

  async muteUser(params: {
    targetUserId: string;
    userId: string;
  }): Promise<void> {
    try {
      const { targetUserId, userId } = params;

      await HttpClient.fetch<ResponseModel<void>>(`/user_restrictions`, {
        method: "POST",
        next: {
          tags: [CACHE_TAGS.MENUS],
        },
        body: JSON.stringify({
          targetUserId,
          userId,
          type: "block",
        }),
      })
        .then(() => {
          return;
        })
        .catch((err) => {
          console.error(err);
          throw new Error(
            "Erro ao bloquear o usuário. Tente novamente mais tarde."
          );
        });
      return;
    } catch (error) {
      console.error("Erro ao bloquear o usuário:", error);
      throw new Error(
        "Erro ao bloquear o usuário. Tente novamente mais tarde."
      );
    }
  }

  async blockUser(params: {
    targetUserId: string;
    userId: string;
  }): Promise<void> {
    try {
      const { targetUserId, userId } = params;

      await HttpClient.fetch<ResponseModel<void>>(`/user_restrictions`, {
        method: "POST",
        next: {
          tags: [CACHE_TAGS.MENUS],
        },
        body: JSON.stringify({
          targetUserId,
          userId,
          type: "block",
        }),
      })
        .then(() => {
          return;
        })
        .catch((err) => {
          console.error(err);
          throw new Error(
            "Erro ao bloquear o usuário. Tente novamente mais tarde."
          );
        });
      return;
    } catch (error) {
      console.error("Erro ao bloquear o usuário:", error);
      throw new Error(
        "Erro ao bloquear o usuário. Tente novamente mais tarde."
      );
    }
  }

  async newPost(): Promise<ForumPostModel> {
    try {
      const { questionId, content, parentId } = this;

      const data: { questionId: string; content: string; parentId?: string } = {
        questionId,
        content,
      };

      if (parentId && parentId !== "") {
        data.parentId = parentId;
      }

      const response = await HttpClient.fetch<ResponseModel<ForumPostModel>>(
        `/comments`,
        {
          method: "POST",
          next: {
            tags: [CACHE_TAGS.MENUS],
          },
          body: JSON.stringify(data),
        }
      )
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.error(err);
          throw new Error(
            "Erro ao buscar as discussões. Tente novamente mais tarde."
          );
        });

      return response;
    } catch (error) {
      console.error("Erro ao votar na discussão:", error);
      throw new Error(
        "Erro ao votar na discussão. Tente novamente mais tarde."
      );
    }
  }

  async deletePost(): Promise<void> {
    try {
      const { id } = this;

      await HttpClient.fetch<ResponseModel<void>>(`/comments/${id}`, {
        method: "DELETE",
        next: {
          tags: [CACHE_TAGS.MENUS],
        },
      })
        .then(() => {
          return;
        })
        .catch((err) => {
          console.error(err);
          throw new Error(
            "Erro ao deletar a discussão. Tente novamente mais tarde."
          );
        });
    } catch (error) {
      console.error("Erro ao deletar a discussão:", error);
      throw new Error(
        "Erro ao deletar a discussão. Tente novamente mais tarde."
      );
    }
  }
}
