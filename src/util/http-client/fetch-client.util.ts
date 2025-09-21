import { HttpError, UnauthorizedError } from "@/lib/errors";
const recentGlobalErrors = new Map<string | number, number>();
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

type GlobalHttpError = {
    _globalErrorId?: string;
};


const HttpClient = Object.freeze({
    async fetch<T>(resource: string, opts: RequestInit = {}, autoBack?: boolean): Promise<T> {
        const url = baseUrl ? `${baseUrl}${resource}` : resource;
        const headers: HeadersInit = {
            "Content-Type": "application/json",
            ...opts.headers,
        };

        const response = await fetch(url, {
            ...opts,
            headers,
            credentials: opts.credentials ?? "include",
            next: opts.next ?? undefined,
        });

        if (response.status === 401) {
            throw new UnauthorizedError("Unauthorized");
        }

        if (!response.ok) {
            const body = await parseResponseBody(response);
            const message = (body && (body.error || body.message)) || response.statusText || "Erro desconhecido";
            const errorCode = body?.error;
            const httpErr = new HttpError(message, response.status, body);

            const key = `${response.status}:${message}`;
            const now = Date.now();
            const last = recentGlobalErrors.get(key);
            if (!last || now - last > 4000) { // só dispara se não houver nos últimos 4s
                recentGlobalErrors.set(key, now);

                try {
                    if (typeof window !== "undefined") {
                        window.dispatchEvent(
                            new CustomEvent("globalHttpError", {
                                detail: { id: (httpErr as GlobalHttpError)._globalErrorId, status: response.status, message, body, autoBack: autoBack ?? true },
                            })
                        );
                    }
                } catch {
                    // ignore
                }
            }

            throw new HttpError(message, response.status, body, errorCode);

        }

        return (await response.json()) as T;
    },
});

export default HttpClient;
