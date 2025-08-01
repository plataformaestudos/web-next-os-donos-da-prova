import { ForumPostModel } from '@/model/forum.model';

export class Forum implements ForumPostModel {
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

  constructor(service: ForumPostModel) {
    this.id = service.id;
    this.authorName = service.authorName;
    this.authorScore = service.authorScore;
    this.commentScore = service.commentScore;
    this.content = service.content;
    this.createdAt = service.createdAt;
    this.negativeVotes = service.negativeVotes;
    this.parentId = service.parentId;
    this.positiveVotes = service.positiveVotes;
    this.questionId = service.questionId;
    this.userId = service.userId;
    this.userVote = service.userVote;
    this.hasReplies = service.hasReplies;
    this.repliesCount = service.repliesCount;
  }
}
