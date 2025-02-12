import { createClient } from "./supabase/client";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default Object.freeze({
  async fetch(resource: string, opts: RequestInit): Promise<Response> {
    const token = (await createClient().auth.getSession()).data.session
      ?.access_token;

    const url = baseUrl ? `${baseUrl}${resource}` : resource;
    return fetch(url, {
      headers: {
        ...opts.headers,
        Authorization: `Bearer ${token}`,
      },
      ...opts,
    });
  },
});
