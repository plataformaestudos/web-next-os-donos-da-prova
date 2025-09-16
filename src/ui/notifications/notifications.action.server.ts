"use server";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import HttpClient from "@/util/http-client/fetch-server.util";


type UnreadCountResponse = {
    unreadCount: number;
};

export async function getUnreadCountServer(): Promise<number> {

    const res = await HttpClient.fetch<UnreadCountResponse>("/notifications/unread/count", {
        method: "GET",
        next: {
            tags: [CACHE_TAGS.NOTIFICATIONS],
        },

    });
    return res.unreadCount ?? 0;
}

