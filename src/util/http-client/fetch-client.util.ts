const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const HttpClient = Object.freeze({
  async fetch<T>(resource: string, opts: RequestInit = {}): Promise<T> {
    try {

      const url = baseUrl ? `${baseUrl}${resource}` : resource;

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...opts.headers,
      };

      const response = await fetch(url, {
        ...opts,
        headers,
        credentials: opts.credentials || "include",
        next: {
          ...opts.next,
          revalidate: 180,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      console.error("Error during fetch:", error);
      throw new Error("Failed to fetch resource");
    }
  },
});

export default HttpClient;
