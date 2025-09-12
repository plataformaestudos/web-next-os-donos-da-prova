import { cookies } from "next/headers";
import { UnauthorizedError } from "./fetch-client.util";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const HttpClient = Object.freeze({
  async fetch<T>(resource: string, opts?: RequestInit) {
    const url = baseUrl ? `${baseUrl}${resource}` : resource;
    console.log(url)

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
      credentials: opts?.credentials || "include",
      next: {
        revalidate: 180,
      },
    });

    if (response.status === 401) {
      throw new UnauthorizedError("Unauthorized");
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`HTTP error! status: ${response.status} ${text}`);
    }

    console.log("HTTP Response:", { url, status: response.status });

    return (await response.json()) as T;
  },
});

export default HttpClient;
