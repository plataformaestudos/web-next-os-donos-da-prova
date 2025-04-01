import { Card, CardLink, CardsContainer } from "./page-card.component";
import {
  LuBook,
  LuCircleDollarSign,
  LuFileQuestion,
  LuFolders,
  LuHouse,
} from "react-icons/lu";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import { CgProfile } from "react-icons/cg";
import HttpClient from "@/util/http-client/fetch-server.util";
import { MenuModel } from "@/model/menu.model";
import { ResponseModel } from "@/model/common.model";

const icons = {
  home: <LuHouse size={48} />,
  book: <LuBook size={48} />,
  question: <LuFileQuestion size={48} />,
  profile: <CgProfile size={48} />,
  module: <LuFolders size={48} />,
  plan: <LuCircleDollarSign size={48} />,
};

export async function RoleBasedPagesCards() {
  const menus = await HttpClient.fetch<ResponseModel<MenuModel[]>>(
    "/menu/menus",
    {
      method: "GET",
      next: {
        tags: [CACHE_TAGS.MENUS],
      },
    }
  ).then(
    (response) =>
      response.data?.sort(
        ({ order: orderA }, { order: orderB }) => orderA - orderB
      ) as Array<MenuModel>
  );

  return (
    <CardsContainer>
      {menus
        .filter((menu) => menu.link !== "/home")
        .map((menu) => (
          <CardLink key={menu.id} href={menu.link}>
            <Card>
              {icons[menu.icon as keyof typeof icons]}
              <h3>{menu.description}</h3>
            </Card>
          </CardLink>
        ))}
    </CardsContainer>
  );
}
