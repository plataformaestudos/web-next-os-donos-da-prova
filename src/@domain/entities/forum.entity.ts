import { ForumPostModel } from '@/model/forum.model';

export class Forum implements ForumPostModel {
  id: string;
  postVotes: number;
  userName: string;
  userVotes: number;
  isUserSilenced: boolean;
  isUserBlocked: boolean;
  postMessage: string;
  postDateTime: string;

  constructor(service: ForumPostModel) {
    this.id = service.id;
    this.postVotes = service.postVotes;
    this.userName = service.userName;
    this.userVotes = service.userVotes;
    this.isUserSilenced = service.isUserSilenced;
    this.isUserBlocked = service.isUserBlocked;
    this.postMessage = service.postMessage;
    this.postDateTime = service.postDateTime;
  }
}
