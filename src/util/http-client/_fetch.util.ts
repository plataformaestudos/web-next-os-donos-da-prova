const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const customFetch = <T>(
  token: string | undefined,
  resource: string,
  opts: RequestInit = {}
) => {
  const url = baseUrl ? `${baseUrl}${resource}` : resource;
  return fetch(url, {
    next: {
      ...opts.next,
      revalidate: 180,
    },
    headers: {
      ...opts.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    ...opts,
  }).then((response) => response.json() as T);
};
