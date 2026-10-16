import { HttpError, UnauthorizedError } from "@/lib/errors";
import { parseStudyAccessBlock, STUDY_ACCESS_BLOCKED_EVENT } from "@/free-plan-upgrade/study-access.model";
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
    async fetch<T>(resource: string, opts: RequestInit = {}, autoBack?: boolean, options: { suppressGlobalError?: boolean } = {}): Promise<T> {
        const url = baseUrl ? `${baseUrl}${resource}` : resource;
        const headers: HeadersInit = {
            ...(typeof FormData !== "undefined" && opts.body instanceof FormData
                ? {} : { "Content-Type": "application/json" }),
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
            const studyAccessBlock = parseStudyAccessBlock(response.status, body);
            if (studyAccessBlock) {
                if (!options.suppressGlobalError && !opts.signal?.aborted && typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent(STUDY_ACCESS_BLOCKED_EVENT, { detail: studyAccessBlock }));
                }
                throw new HttpError(message, response.status, body, body.code);
            }

            const key = `${response.status}:${message}`;
            const now = Date.now();
            const last = recentGlobalErrors.get(key);
            if (!options.suppressGlobalError && (!last || now - last > 4000)) { // só dispara se não houver nos últimos 4s
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
