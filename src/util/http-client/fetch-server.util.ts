import { cookies } from "next/headers";
import { UnauthorizedError } from "./fetch-client.util";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const HttpClient = Object.freeze({
  async fetch<T>(resource: string, opts?: RequestInit) {
    const url = baseUrl ? `${baseUrl}${resource}` : resource;

    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll()
      .map(({ name, value }) => `${name}=${value}`)
      .join("; ");

    console.log("Cookies enviados na requisição:", allCookies.split("; ").map(c => c.split("=")[0]));

    const cookieSizeBytes = new TextEncoder().encode(allCookies).length;
    console.log("Tamanho total dos cookies:", cookieSizeBytes, "bytes");


    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(opts?.headers
        ? Object.fromEntries(
          Object.entries(opts.headers as Record<string, string>)
        )
        : {}),
      ...(allCookies ? { Cookie: allCookies } : {}),
    };


    const response = await fetch(url, {
      ...opts,
      headers,
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


    return (await response.json()) as T;
  },
});

export default HttpClient;
