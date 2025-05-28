import { RoleBasedPagesCards } from "./role-based-pages-cards.component";
import { createClient } from "@/util/supabase/server";
import { redirect } from "next/navigation";
import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";
import { MenuModel } from "@/model/menu.model";
import { CACHE_TAGS } from "@/util/cache-tags.util";

export default async function HomePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  const userProfile = await supabase
    .from("profiles")
    .select("*")
    .match({ user_id: data.user.id })
    .single();




  const menus = await HttpClient.fetch<ResponseModel<MenuModel[]>>(
    "/menu/menus",
    {
      method: "GET",
      next: {
        tags: [CACHE_TAGS.MENUS],
      },
    }
  )
    .then((response) => {
      console.log("Dados recebidos1:", response);
      return response.data?.sort(
        ({ order: orderA }, { order: orderB }) => orderA - orderB
      ) as Array<MenuModel>;
    })
    .catch(() => []);

  return (
    <main style={{ padding: 24 }}>
      <p>Seja bem vindo {userProfile.data?.name}!</p>
      <RoleBasedPagesCards menus={menus} />
    </main>
  );
}
