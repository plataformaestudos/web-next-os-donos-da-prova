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
        return HttpClient.fetch<ResponseModel<ForumPostModel[]>>(
            `/comments/by-question/${questionId}?page=${page}&itemsPerPage=${limit}&sortBy=${orderBy}&sortOrder=DESC`,
            { method: "GET", next: { tags: [CACHE_TAGS.MENUS] } },
            false // autoBack opcional
        );
    }



    async getAnswers(params: { page: number; postId: string }): Promise<ResponseModel<ForumPostModel[]>> {
        const { page, postId } = params;
        return HttpClient.fetch<ResponseModel<ForumPostModel[]>>(
            `/comments/${postId}/replies?page=${page}&itemsPerPage=5`,
            { method: "GET", next: { tags: [CACHE_TAGS.MENUS] } },
            false
        );
    }

    async votePost(): Promise<void> {
        const { id, userVote } = this;
        await HttpClient.fetch<ResponseModel<void>>(
            `/comments_votes`,
            {
                method: "POST",
                next: { tags: [CACHE_TAGS.MENUS] },
                body: JSON.stringify({ commentId: id, value: userVote }),
            },
            false
        );
    }

    async muteUser(params: { targetUserId: string; userId: string }): Promise<void> {
        const { targetUserId, userId } = params;
        await HttpClient.fetch<ResponseModel<void>>(
            `/user_restrictions`,
            {
                method: "POST",
                next: { tags: [CACHE_TAGS.MENUS] },
                body: JSON.stringify({ targetUserId, userId, type: "block" }),
            },
            false
        );
    }

    async blockUser(params: { targetUserId: string; userId: string }): Promise<void> {
        const { targetUserId, userId } = params;
        await HttpClient.fetch<ResponseModel<void>>(
            `/user_restrictions`,
            {
                method: "POST",
                next: { tags: [CACHE_TAGS.MENUS] },
                body: JSON.stringify({ targetUserId, userId, type: "block" }),
            },
            false
        );
    }

    async newPost(): Promise<ForumPostModel> {
        const { questionId, content, parentId } = this;
        const data: { questionId: string; content: string; parentId?: string } = { questionId, content };
        if (parentId) data.parentId = parentId;

        const res = await HttpClient.fetch<ResponseModel<ForumPostModel>>(
            `/comments`,
            {
                method: "POST",
                next: { tags: [CACHE_TAGS.MENUS] },
                body: JSON.stringify(data),
            },
            false
        );

        return res.data;
    }

    async deletePost(): Promise<void> {
        const { id } = this;
        await HttpClient.fetch<ResponseModel<void>>(
            `/comments/${id}`,
            { method: "DELETE", next: { tags: [CACHE_TAGS.MENUS] } },
            false
        );
    }
}
