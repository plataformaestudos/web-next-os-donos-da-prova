import { ForumOrderBy, ForumPostModel, ForumVoteType } from "@/model/forum.model";
import { Forum } from "../entities/forum.entity";

export class ForumService extends Forum {
  constructor(service: ForumPostModel) {
    super(service);
  }

  async getAll(params: {
    page: number;
    limit: number;
    orderBy: ForumOrderBy;
  }): Promise<ForumPostModel[]> {
    const { page, limit, orderBy } = params;

    try {
      const response = await new Promise<ForumPostModel[]>((resolve) =>
        setTimeout(() => {
          resolve([
            {
              id: "1",
              postVotes: 106,
              userName: "Pedro Moutinho",
              userVotes: 3722,
              isUserSilenced: false,
              isUserBlocked: false,
              postMessage:
                'A filiação passou despercebida e fui quente na E achando que tivesse alguma jurisprudência (confesso que fui emocionado ao ignorar o comando "Considerando o que dispõe o Código Civil")."',
              postDateTime: "19/10/2022 16:30",
            },
            {
              id: "2",
              postVotes: 20,
              userName: "Thiago Nogueira",
              userVotes: 293,
              isUserSilenced: false,
              isUserBlocked: false,
              postMessage:
                'A filiação passou despercebida e fui quente na E achando que tivesse alguma jurisprudência (confesso que fui emocionado ao ignorar o comando "Considerando o que dispõe o Código Civil").',
              postDateTime: "20/10/2022 16:30",
            },
          ]);
        }, 1500)
      );

      return response;
    } catch (error) {
      console.error("Erro ao buscar as discussões:", error);
      throw new Error(
        "Erro ao buscar as discussões. Tente novamente mais tarde."
      );
    }
  }

  async votePost(): Promise<void> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    } catch (error) {
      console.error("Erro ao votar na discussão:", error);
      throw new Error(
        "Erro ao votar na discussão. Tente novamente mais tarde."
      );
    }
  };

  async muteUser(): Promise<void> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    } catch (error) {
      console.error("Erro ao silenciar o usuário:", error);
      throw new Error(
        "Erro ao silenciar o usuário. Tente novamente mais tarde."
      );
    }
  }

  async blockUser(): Promise<void> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    } catch (error) {
      console.error("Erro ao bloquear o usuário:", error);
      throw new Error(
        "Erro ao bloquear o usuário. Tente novamente mais tarde."
      );
    }
  }
}
