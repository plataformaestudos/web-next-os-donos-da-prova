const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export class UnauthorizedError extends Error {
  status = 401;
}

const HttpClient = Object.freeze({
  async fetch<T>(resource: string, opts: RequestInit = {}): Promise<T> {
    const url = baseUrl ? `${baseUrl}${resource}` : resource;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...opts.headers,
    };

    const response = await fetch(url, {
      ...opts,
      headers,
      credentials: opts.credentials ?? "include",
      next: (opts as any).next ?? undefined,
    });

    if (response.status === 401) {
      throw new UnauthorizedError("Unauthorized");
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`HTTP error! status: ${response.status} ${text}`);
    }

    return (await response.json()) as T;
  },
});

export default HttpClient;
