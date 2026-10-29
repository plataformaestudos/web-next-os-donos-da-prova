import { CACHE_TAGS } from "@/util/cache-tags.util";
import HttpClient from "@/util/http-client/fetch-client.util";
import { MenuModel } from "@/model/menu.model";
import { ResponseModel } from "@/model/common.model";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/app/context/user.context";
import { canAccess, hasStaffAccess, Roles } from "@/util/roles";

export function useMenus() {
  const { user, loading } = useUser();
  const { data, isLoading } = useQuery({
    queryKey: ["menus", user?.id, user?.profile?.role_id],
    enabled: !loading && Boolean(user?.profile),
    queryFn: async () => {
      const response = await HttpClient.fetch<ResponseModel<MenuModel[]>>("/menu/menus", {
        method: "GET",
        next: { tags: [CACHE_TAGS.MENUS] },
      });

      return response.data?.sort(
        ({ order: orderA }, { order: orderB }) => orderA - orderB
      ) as MenuModel[];
    },
  });

  const visibleMenus = data?.filter((menu) => {
    if (/^\/ebooks(\/|$)/.test(menu.link)) return canAccess(user, [Roles.ADMIN]);
    if (/^\/subscription(\/|$)/.test(menu.link) && hasStaffAccess(user)) return false;
    if (/^\/gerenciar-usuarios(\/|$)/.test(menu.link)) return canAccess(user, [Roles.ADMIN]);
    if (/^\/afiliados(\/|$)/.test(menu.link)) return canAccess(user, [Roles.ADMIN]);
    const isImport = /^\/(importacao-questoes|question-imports)(\/|$)/.test(menu.link);
    return !isImport || canAccess(user, [Roles.ADMIN, Roles.COLLABORATOR]);
  });
  const menus = visibleMenus && canAccess(user, [Roles.ADMIN]) && !visibleMenus.some((menu) => menu.link === "/ebooks/administrar")
    ? [...visibleMenus, { id: "ebook-admin", description: "Ebooks", icon: "book", level: 1, order: 100, link: "/ebooks/administrar", activeRegex: "^/ebooks/administrar" }]
    : visibleMenus;
  return { menus, isLoading: loading || isLoading };
}
