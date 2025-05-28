import { cookies } from "next/headers";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const HttpClient = Object.freeze({
  async fetch<T>(resource: string, opts?: RequestInit) {
    const url = baseUrl ? `${baseUrl}${resource}` : resource;

    const cookieStore = cookies();
    const cookieHeader = cookieStore.toString();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(opts?.headers as Record<string, string>),
    };

    if (cookieHeader) {
      headers["cookie"] = cookieHeader;
    }

    const response = await fetch(url, {
      ...opts,
      headers,
      credentials: opts?.credentials || "include",
      next: {
        revalidate: 180,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return (await response.json()) as T;
  },
});

export default HttpClient;
