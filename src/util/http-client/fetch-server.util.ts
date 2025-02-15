import { createClient } from "../supabase/server";
import { customFetch } from "./_fetch.util";

const HttpClient = Object.freeze({
  async fetch<T>(resource: string, opts: RequestInit) {
    const supabase = await createClient();
    const token = (await supabase.auth.getSession()).data.session?.access_token;

    return customFetch<T>(token, resource, opts);
  },
});

export default HttpClient;
