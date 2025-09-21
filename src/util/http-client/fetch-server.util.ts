import { cookies } from "next/headers";
import { HttpError, UnauthorizedError } from "@/lib/errors";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

async function parseResponseBody(response: Response) {
    const txt = await response.text().catch(() => "");
    if (!txt) return null;
    try {
        return JSON.parse(txt);
    } catch {
        return txt; 
    }
}

const HttpClient = Object.freeze({
    async fetch<T>(resource: string, opts?: RequestInit) {
        const url = baseUrl ? `${baseUrl}${resource}` : resource;

        const cookieStore = await cookies();
        const accessToken = cookieStore.get("access_token")?.value;

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...(opts?.headers as Record<string, string>),
        };

        if (accessToken) {
            headers["cookie"] = `access_token=${accessToken}`;
        }

        const response = await fetch(url, {
            ...opts,
            headers,
            next: {
                revalidate: 0,
                ...(opts?.next ?? {}),
            },
        });

        if (response.status === 401) {
            throw new UnauthorizedError();
        }

        if (!response.ok) {
            const body = await parseResponseBody(response);
            const message =
                (body && (body.error ||body.message || body?.data?.message)) ||
                response.statusText ||
                "Erro desconhecido";
            const errorCode = body?.error;
            throw new HttpError(message, response.status, body, errorCode);
        }

        return (await response.json()) as T;
    },
});

export default HttpClient;
