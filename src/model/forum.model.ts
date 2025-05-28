export interface ForumPostModel {
  id: string;
  postVotes: number;
  userName: string;
  userVotes: number;
  isUserSilenced: boolean;
  isUserBlocked: boolean;
  postMessage: string;
  postDateTime: string;
  voteType?: ForumVoteType;
}

export enum ForumOrderBy {
  DATE = "date",
  POINTS = "points",
  USER = "user",
  MYVOTES = "myVotes",
  DEFAULT = "",
}

export enum ForumVoteType {
  UPVOTE = "upvote",
  DOWNVOTE = "downvote",
  DEFAULT = "",
}
