"use client";

import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import { BsReplyAll } from "react-icons/bs";
import { App } from "antd";
import { useEffect, useState, Fragment } from "react";

import { ForumService } from "@/@domain/services/forum.service";
import {
  ForumOrderBy,
  ForumPostModel,
  ForumVoteType,
} from "@/model/forum.model";

import * as S from "./styles";
import { AppLoading } from "../AppLoading";
import { TiptapEditor } from "@/ui/tiptap-editor/tiptap-editor.component";
import { useMultipleEditors } from "@/ui/tiptap-editor/use-multiple-editors.component";
import { formatDate } from "@/util/date";
import AppPagination from "../AppPagination";

interface IAppForumProps {
  questionId: string;
  userId: string;
}

const filterOptions = [
  { label: "Data", value: ForumOrderBy.DATE },
  { label: "Pontos", value: ForumOrderBy.SCORE },
  { label: "Usuário", value: ForumOrderBy.USER },
  { label: "Meus votos", value: ForumOrderBy.MYVOTES },
];

export const AppForum = ({ questionId, userId }: IAppForumProps) => {
  const { message } = App.useApp();

  const { menu, onFocus } = useMultipleEditors();

  const [posts, setPosts] = useState<ForumPostModel[]>([]);
  const [allChildren, setAllChildren] = useState<ForumPostModel[]>([]);
  const [orderBy, setOrderBy] = useState<ForumOrderBy>(ForumOrderBy.SCORE);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [text, setText] = useState<string>("");
  const [textAnswer, setTextAnswer] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [answeringPost, setAnsweringPost] = useState<{
    postId: string;
    isAnswering: boolean;
  }>({
    postId: "",
    isAnswering: false,
  });
  const itemsPerPage = 20;

  const getData = async (noLoading?: boolean) => {
    if (!noLoading) {
      setIsLoading(true);
    }

    try {
      const forumService = new ForumService({} as ForumPostModel);

      const response = await forumService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        orderBy,
        questionId,
      });

      const posts = response.data.filter(
        (post) => post.parentId === "" || post.parentId === null
      );

      const children = response.data.filter(
        (post) => post.parentId !== "" && post.parentId !== null
      );

      setPosts(posts);
      setAllChildren(children);
      setTotalPages(response.totalPages || 1);
      setCurrentPage(response.page || 1);
    } catch {
      message.error(
        "Erro ao buscar as discussões. Tente novamente mais tarde."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (post: ForumPostModel, voteType: ForumVoteType) => {
    try {
      post.userVote = voteType;

      const forumService = new ForumService(post);
      await forumService.votePost();

      getData(true);
    } catch {
      const errorMessage =
        voteType === ForumVoteType.DEFAULT
          ? "Erro ao remover o voto. Tente novamente mais tarde."
          : "Erro ao registrar o voto. Tente novamente mais tarde.";
      message.error(errorMessage);
    }
  };

  const handleMute = async (post: ForumPostModel) => {
    try {
      const forumService = new ForumService({} as ForumPostModel);

      await forumService.muteUser({
        targetUserId: post.userId,
        userId,
      });

      getData();
      message.success("Usuário silenciado com sucesso!");
    } catch {
      message.error("Erro ao silenciar o usuário. Tente novamente mais tarde.");
    }
  };

  const handleBlock = async (post: ForumPostModel) => {
    try {
      const forumService = new ForumService({} as ForumPostModel);

      await forumService.blockUser({
        targetUserId: post.userId,
        userId,
      });

      getData();
      message.success("Usuário bloqueado com sucesso!");
    } catch {
      message.error("Erro ao bloquear o usuário. Tente novamente mais tarde.");
    }
  };

  const handleNewPost = async (postId?: string) => {
    let content = text;
    let parentId = "";

    if (postId) {
      content = textAnswer;
      parentId = postId;
    }

    if (!content.trim()) {
      message.warning("O conteúdo do post não pode estar vazio.");
      return;
    }

    try {
      const newForumPost = {
        questionId,
        content,
        parentId,
      } as ForumPostModel;

      const forumService = new ForumService(newForumPost);

      await forumService.newPost();

      message.success("Post criado com sucesso!");
      setAnsweringPost({ postId: "", isAnswering: false });
      setText("");
      getData();
    } catch {
      message.error("Erro ao criar o post. Tente novamente mais tarde.");
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      const forumService = new ForumService({
        id,
      } as ForumPostModel);
      await forumService.deletePost();

      message.success("Post excluído com sucesso!");
      setPosts((prevPosts) => prevPosts.filter((p) => p.id !== id));
    } catch {
      message.error("Erro ao excluir o post. Tente novamente mais tarde.");
    }
  };

  const handleAnswerPost = (postId: string) => {
    setAnsweringPost({ postId, isAnswering: true });
  };

  const getChildren = (parentId: string): Array<ForumPostModel> => {
    const children = allChildren.filter((child) => child.parentId === parentId);

    children.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return children || [];
  };

  useEffect(() => {
    getData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderBy, currentPage]);

  return (
    <S.Container>
      <S.Header>
        <S.HeaderAction>Acompanhar Questão</S.HeaderAction>
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
      </S.Header>
      <S.PostsContainer>
        {posts &&
          !isLoading &&
          posts.length > 0 &&
          posts.map((post) => (
            <S.Post key={post.id}>
              <Fragment>
                <S.PostHeader>
                  <S.PostInfoHeader>
                    {userId !== post.userId && (
                      <S.PostVotes>
                        <CaretUpOutlined
                          className={
                            post.userVote === ForumVoteType.UPVOTE
                              ? "positive"
                              : ""
                          }
                          onClick={
                            post.userVote === ForumVoteType.UPVOTE
                              ? () => handleVote(post, ForumVoteType.DEFAULT)
                              : () => handleVote(post, ForumVoteType.UPVOTE)
                          }
                        />
                        <S.PostVoteCount>{post.commentScore}</S.PostVoteCount>
                        <CaretDownOutlined
                          className={
                            post.userVote === ForumVoteType.DOWNVOTE
                              ? "negative"
                              : ""
                          }
                          onClick={
                            post.userVote === ForumVoteType.DOWNVOTE
                              ? () => handleVote(post, ForumVoteType.DEFAULT)
                              : () => handleVote(post, ForumVoteType.DOWNVOTE)
                          }
                        />
                      </S.PostVotes>
                    )}
                    <S.PostAvatar>
                      {post.authorName.charAt(0).toUpperCase()}
                    </S.PostAvatar>
                    <S.PostInfoUser>
                      <S.PostUserName>{post.authorName}</S.PostUserName>
                      <S.PostUserRating>
                        <span
                          className={
                            post.authorScore < 0 ? "negative" : "positive"
                          }
                        >
                          {post.authorScore}
                        </span>{" "}
                        pontos
                      </S.PostUserRating>
                    </S.PostInfoUser>
                  </S.PostInfoHeader>
                  <S.PostActionsHeader>
                    <S.DateTime>{formatDate(post.createdAt)}</S.DateTime>
                    <S.PostActions>
                      {userId !== post.userId ? (
                        <Fragment>
                          <S.PostAction onClick={() => handleMute(post)}>
                            silenciar
                          </S.PostAction>
                          <S.FilterDivider>●</S.FilterDivider>
                          <S.PostAction onClick={() => handleBlock(post)}>
                            bloquear
                          </S.PostAction>
                        </Fragment>
                      ) : (
                        <S.PostAction onClick={() => handleDeletePost(post.id)}>
                          <span>excluir</span>
                        </S.PostAction>
                      )}
                    </S.PostActions>
                  </S.PostActionsHeader>
                </S.PostHeader>
                <S.PostContent>
                  <TiptapEditor
                    editable={false}
                    defaultValue={post.content}
                  />{" "}
                  <BsReplyAll
                    color="#3398da"
                    size={20}
                    onClick={() => handleAnswerPost(post.id)}
                  />
                  {answeringPost.isAnswering &&
                    answeringPost.postId === post.id && (
                      <S.NewPostContainer style={{ marginTop: "16px" }}>
                        <S.EditorContainer>{menu}</S.EditorContainer>
                        <TiptapEditor
                          placeholder="Post"
                          defaultValue={text}
                          editable={true}
                          onFocus={onFocus}
                          onChange={(val) => setTextAnswer(val)}
                        />
                        <S.NewPostButton onClick={() => handleNewPost(post.id)}>
                          Postar Comentário
                        </S.NewPostButton>
                      </S.NewPostContainer>
                    )}
                  {getChildren(post.id).map((child) => (
                    <S.Child key={child.id}>
                      <Fragment>
                        <S.PostHeader>
                          <S.PostInfoHeader>
                            {userId !== child.userId && (
                              <S.PostVotes>
                                <CaretUpOutlined
                                  className={
                                    child.userVote === ForumVoteType.UPVOTE
                                      ? "positive"
                                      : ""
                                  }
                                  onClick={
                                    child.userVote === ForumVoteType.UPVOTE
                                      ? () =>
                                          handleVote(
                                            child,
                                            ForumVoteType.DEFAULT
                                          )
                                      : () =>
                                          handleVote(child, ForumVoteType.UPVOTE)
                                  }
                                />
                                <S.PostVoteCount>
                                  {child.commentScore}
                                </S.PostVoteCount>
                                <CaretDownOutlined
                                  className={
                                    child.userVote === ForumVoteType.DOWNVOTE
                                      ? "negative"
                                      : ""
                                  }
                                  onClick={
                                    child.userVote === ForumVoteType.DOWNVOTE
                                      ? () =>
                                          handleVote(
                                            child,
                                            ForumVoteType.DEFAULT
                                          )
                                      : () =>
                                          handleVote(
                                            child,
                                            ForumVoteType.DOWNVOTE
                                          )
                                  }
                                />
                              </S.PostVotes>
                            )}
                            <S.PostAvatar>
                              {child.authorName.charAt(0).toUpperCase()}
                            </S.PostAvatar>
                            <S.PostInfoUser>
                              <S.PostUserName>{child.authorName}</S.PostUserName>
                              <S.PostUserRating>
                                <span
                                  className={
                                    child.authorScore < 0
                                      ? "negative"
                                      : "positive"
                                  }
                                >
                                  {child.authorScore}
                                </span>{" "}
                                pontos
                              </S.PostUserRating>
                            </S.PostInfoUser>
                          </S.PostInfoHeader>
                          <S.PostActionsHeader>
                            <S.DateTime>
                              {formatDate(child.createdAt)}
                            </S.DateTime>
                            <S.PostActions>
                              {userId !== child.userId ? (
                                <Fragment>
                                  <S.PostAction
                                    onClick={() => handleMute(child)}
                                  >
                                    silenciar
                                  </S.PostAction>
                                  <S.FilterDivider>●</S.FilterDivider>
                                  <S.PostAction
                                    onClick={() => handleBlock(child)}
                                  >
                                    bloquear
                                  </S.PostAction>
                                </Fragment>
                              ) : (
                                <S.PostAction
                                  onClick={() => handleDeletePost(child.id)}
                                >
                                  <span>excluir</span>
                                </S.PostAction>
                              )}
                            </S.PostActions>
                          </S.PostActionsHeader>
                        </S.PostHeader>
                        <S.PostContent>
                          <TiptapEditor
                            editable={false}
                            defaultValue={child.content}
                          />{" "}
                        </S.PostContent>
                      </Fragment>
                    </S.Child>
                  ))}
                </S.PostContent>
              </Fragment>
            </S.Post>
          ))}
        <AppLoading
          show={isLoading}
          loadingText="Carregando Fórum..."
        />
        <AppPagination
          nextPage={() => setCurrentPage((prev) => prev + 1)}
          prevPage={() => setCurrentPage((prev) => prev - 1)}
          hasNext={currentPage < totalPages}
          hasPrev={currentPage > 1}
        />
      </S.PostsContainer>
      <S.NewPostContainer>
        <S.EditorContainer>{menu}</S.EditorContainer>
        <TiptapEditor
          placeholder="Post"
          defaultValue={text}
          editable={true}
          onFocus={(val) => {
            setAnsweringPost({ postId: "", isAnswering: false });
            onFocus(val);
          }}
          onChange={(val) => setText(val)}
        />
        <S.NewPostButton onClick={() => handleNewPost()}>
          Postar Comentário
        </S.NewPostButton>
      </S.NewPostContainer>
    </S.Container>
  );
};
