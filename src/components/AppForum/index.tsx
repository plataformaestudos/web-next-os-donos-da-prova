"use client";

import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import { App, Spin } from "antd";
import { useEffect, useState, Fragment } from "react";

import { ForumService } from "@/@domain/services/forum.service";
import {
  ForumOrderBy,
  ForumPostModel,
  ForumVoteType,
} from "@/model/forum.model";

import * as S from "./styles";
import { AppLoading } from "../AppLoading";

interface IAppForumProps {}

const filterOptions = [
  { label: "Data", value: ForumOrderBy.DATE },
  { label: "Pontos", value: ForumOrderBy.POINTS },
  { label: "Usuário", value: ForumOrderBy.USER },
  { label: "Meus votos", value: ForumOrderBy.MYVOTES },
];

export const AppForum = ({}: IAppForumProps) => {
  const { message } = App.useApp();

  const [posts, setPosts] = useState<ForumPostModel[]>([]);
  const [orderBy, setOrderBy] = useState<ForumOrderBy>(ForumOrderBy.DEFAULT);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getData = async () => {
    setIsLoading(true);

    try {
      const forumService = new ForumService({} as ForumPostModel);

      const response = await forumService.getAll({
        page: 1,
        limit: 20,
        orderBy,
      });

      setPosts(response);
    } catch {
      message.error(
        "Erro ao buscar as discussões. Tente novamente mais tarde."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpVote = async (post: ForumPostModel) => {
    try {
      post.voteType = ForumVoteType.UPVOTE;
      post.postVotes += 1;

      const forumService = new ForumService(post);

      await forumService.votePost();

      setPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === post.id ? post : p))
      );
    } catch {
      message.error("Erro ao registrar o voto. Tente novamente mais tarde.");
    }
  };

  const handleDownVote = async (post: ForumPostModel) => {
    try {
      post.voteType = ForumVoteType.DOWNVOTE;
      post.postVotes -= 1;

      const forumService = new ForumService(post);

      await forumService.votePost();

      setPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === post.id ? post : p))
      );
    } catch {
      message.error("Erro ao registrar o voto. Tente novamente mais tarde.");
    }
  };

  const handleRemoveVote = async (post: ForumPostModel) => {
    try {
      post.postVotes -= post.voteType === ForumVoteType.UPVOTE ? 1 : -1;
      post.voteType = ForumVoteType.DEFAULT;

      const forumService = new ForumService(post);

      await forumService.votePost();

      setPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === post.id ? post : p))
      );
    } catch {
      message.error("Erro ao remover o voto. Tente novamente mais tarde.");
    }
  };

  const handleMute = async (post: ForumPostModel) => {
    try {
      post.isUserSilenced = !post.isUserSilenced;

      const forumService = new ForumService(post);

      await forumService.muteUser();

      setPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === post.id ? post : p))
      );
    } catch {
      message.error("Erro ao silenciar o usuário. Tente novamente mais tarde.");
    }
  };

  const handleUnmute = async (post: ForumPostModel) => {};

  const handleBlock = async (post: ForumPostModel) => {
    try {
      post.isUserBlocked = !post.isUserBlocked;

      const forumService = new ForumService(post);

      await forumService.blockUser();

      setPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === post.id ? post : p))
      );
    } catch {
      message.error("Erro ao bloquear o usuário. Tente novamente mais tarde.");
    }
  };

  useEffect(() => {
    getData();
  }, [orderBy]);

  return (
    <S.Container>
      <S.FilterContainer>
        <S.FilterTitle>Ordenar por: </S.FilterTitle>
        {filterOptions.map((option, index) => (
          <Fragment key={option.value}>
            <S.FilterOption
              key={option.value}
              $active={orderBy === option.value}
              onClick={() => setOrderBy(option.value)}
            >
              {option.label}
            </S.FilterOption>
            {index < filterOptions.length - 1 && (
              <S.FilterDivider key={`divider-${option.value}`}>
                ●
              </S.FilterDivider>
            )}
          </Fragment>
        ))}
      </S.FilterContainer>
      <S.PostsContainer>
        {posts &&
          !isLoading &&
          posts.length > 0 &&
          posts.map((post) => (
            <S.Post key={post.id}>
              {post.isUserSilenced ? (
                <S.SilencedPostContainer>
                  <span>
                    Este post está oculto porque você silenciou o{" "}
                    <b>{post.userName}</b>.
                  </span>
                  <S.ShowPost>Exibir</S.ShowPost>
                </S.SilencedPostContainer>
              ) : (
                <Fragment>
                  <S.PostHeader>
                    <S.PostInfoHeader>
                      <S.PostVotes>
                        <CaretUpOutlined
                          className={
                            post.voteType === ForumVoteType.UPVOTE
                              ? "positive"
                              : ""
                          }
                          onClick={
                            post.voteType === ForumVoteType.UPVOTE
                              ? () => handleRemoveVote(post)
                              : () => handleUpVote(post)
                          }
                        />
                        <S.PostVoteCount>{post.postVotes}</S.PostVoteCount>
                        <CaretDownOutlined
                          className={
                            post.voteType === ForumVoteType.DOWNVOTE
                              ? "negative"
                              : ""
                          }
                          onClick={
                            post.voteType === ForumVoteType.DOWNVOTE
                              ? () => handleRemoveVote(post)
                              : () => handleDownVote(post)
                          }
                        />
                      </S.PostVotes>
                      <S.Avatar />
                      <S.PostInfoUser>
                        <S.PostUserName>{post.userName}</S.PostUserName>
                        <S.PostUserRating>
                          <span className="positive">{post.userVotes}</span>{" "}
                          pontos
                        </S.PostUserRating>
                      </S.PostInfoUser>
                    </S.PostInfoHeader>
                    <S.PostActionsHeader>
                      <S.DateTime>{post.postDateTime}</S.DateTime>
                      <S.PostActions>
                        <S.PostAction onClick={() => handleMute(post)}>
                          silenciar
                        </S.PostAction>
                        <S.FilterDivider>●</S.FilterDivider>
                        <S.PostAction onClick={() => handleBlock(post)}>
                          bloquear
                        </S.PostAction>
                      </S.PostActions>
                    </S.PostActionsHeader>
                  </S.PostHeader>
                  <S.PostContent>{post.postMessage}</S.PostContent>
                </Fragment>
              )}
            </S.Post>
          ))}
        <AppLoading
          show={isLoading}
          loadingText="Carregando Fórum..."
        />
      </S.PostsContainer>
    </S.Container>
  );
};
