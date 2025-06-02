export interface ForumPostModel {
  id: string;
  authorName: string;
  authorScore: number;
  commentScore: number;
  content: string;
  createdAt: string;
  negativeVotes: number;
  parentId: string | null;
  positiveVotes: number;
  questionId: string;
  userId: string;
  userVote: number;
  hasReplies: boolean;
  repliesCount: number;
}

export enum ForumOrderBy {
  DATE = "date",
  SCORE = "score",
  USER = "user",
  MYVOTES = "myVote",
  DEFAULT = "",
}

export enum ForumVoteType {
  UPVOTE = 1,
  DOWNVOTE = -1,
  DEFAULT = 0,
}
