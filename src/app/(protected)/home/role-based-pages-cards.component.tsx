import { Card, CardLink, CardsContainer } from "./page-card.component";
import {
  LuBook,
  LuCircleDollarSign,
  LuFileQuestion,
  LuFileUp,
  LuFlag,
  LuFolders,
  LuHouse,
  LuUsers,
} from "react-icons/lu";


import { CgProfile } from "react-icons/cg";
import { MenuModel } from "@/model/menu.model";

const icons = {
  users: <LuUsers size={48} />,
  imports: <LuFileUp size={48} />,
  home: <LuHouse size={48} />,
  book: <LuBook size={48} />,
  question: <LuFileQuestion size={48} />,
  profile: <CgProfile size={48} />,
  module: <LuFolders size={48} />,
  plan: <LuCircleDollarSign size={48} />,
  reports: <LuFlag size={48} />,
};

export function RoleBasedPagesCards({ menus }: { menus: MenuModel[] }) {
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
