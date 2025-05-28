import { getCookie } from "../cookies";
import { createClient } from "../supabase/client";
import { customFetch } from "./_fetch.util";

const HttpClient = Object.freeze({
  async fetch<T>(resource: string, opts: RequestInit) {
    const supabase = createClient();
    // const token = (await supabase.auth.getSession()).data.session?.access_token;

    try {
      const token = await getCookie("access_token");
      return customFetch<T>(token, resource, opts);
    } catch (error) {
      console.error("Error fetching token:", error);
      throw new Error("Failed to retrieve access token");
    }
  },
});

export default HttpClient;
