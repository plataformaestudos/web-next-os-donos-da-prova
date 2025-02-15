import HttpClient from "@/util/http-client/fetch-client.util";
import { MenuModel } from "@/model/menu.model";
import { ResponseModel } from "@/model/common.model";
import { useQuery } from "@tanstack/react-query";

export function useMenus() {
  // const { data, isLoading } = useQuery({
  //   queryKey: ["menus"],
  //   queryFn: async () =>
  //     HttpClient.fetch<ResponseModel<MenuModel[]>>("/menu/menus", {
  //       method: "GET",
  //     }).then(
  //       (response) =>
  //         response.data?.sort(
  //           ({ order: orderA }, { order: orderB }) => orderA - orderB
  //         ) as Array<MenuModel>
  //     ),
  // });

  // return { menus: data, isLoading };
  return { menus: [], isLoading: false };
}
