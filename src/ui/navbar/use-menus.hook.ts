import { MenuModel } from "@/model/menu.model";
import { ResponseModel } from "@/model/common.model";
import { createClient } from "@/util/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useMenus() {
  const supabase = createClient();
  const { data, isLoading } = useQuery({
    queryKey: ["menus"],
    queryFn: async () =>
      await supabase
        .from("menus")
        .select()
        .then(
          (response) =>
            response.data?.sort(
              ({ order: orderA }, { order: orderB }) => orderA - orderB
            ) as Array<MenuModel>
        ),
  });

  return { menus: data, isLoading };
}
