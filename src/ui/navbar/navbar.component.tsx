"use client";

import * as Styled from "./navbar.style";

import { Button, Skeleton, Tooltip } from "antd";
import {
  LuBook,
  LuBookCheck,
  LuCircleDollarSign,
  LuFileQuestion,
  LuFolders,
  LuHouse,
} from "react-icons/lu";

import { CgProfile } from "react-icons/cg";
import { FaArrowRightToBracket } from "react-icons/fa6";
import { MenuOutlined } from "@ant-design/icons";
import { createClient } from "@/util/supabase/client";
import { useHorizontalSwipe } from "@/util/use-horizontal-swipe.hook";
import { useIsMobile } from "@/util/use-media-query.hook";
import { useMenus } from "./use-menus.hook";
import { useNabvarContext } from "./navbar.context";
import { usePathname } from "next/navigation";

const icons = {
  home: <LuHouse color="#fff" size={24} />,
  book: <LuBook color="#fff" size={24} />,
  question: <LuFileQuestion color="#fff" size={24} />,
  profile: <CgProfile color="#fff" size={24} />,
  module: <LuFolders color="#fff" size={24} />,
  plan: <LuCircleDollarSign color="#fff" size={24} />,
};

export function Navbar() {
  const supabase = createClient();
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const { isNavbarCollapsed, setIsNavbarCollapsed } = useNabvarContext();
  const handlers = useHorizontalSwipe({
    onSwipeLeft: () => setIsNavbarCollapsed(true),
  });
  const { menus, isLoading } = useMenus();

  return (
    <div {...handlers}>
      <Styled.Backdrop
        $collapsed={isNavbarCollapsed}
        onClick={() => setIsNavbarCollapsed(!isNavbarCollapsed)}
      />
      <Styled.Container $collapsed={isNavbarCollapsed}>
        <Styled.LogoContainer>
          <Button
            type="text"
            size="large"
            onClick={() => setIsNavbarCollapsed(!isNavbarCollapsed)}
            icon={<MenuOutlined size={24} />}
          />
        </Styled.LogoContainer>
        <Styled.MenuItemsContainer>
          {isLoading && (
            <>
              <Skeleton.Node
                active
                style={{
                  marginBottom: 16,
                  marginLeft: -8,
                  borderRadius: 8,
                  width: 40,
                  height: 40,
                }}
              />
              <Skeleton.Node
                active
                style={{
                  marginBottom: 16,
                  marginLeft: -8,
                  borderRadius: 8,
                  width: 40,
                  height: 40,
                }}
              />
              <Skeleton.Node
                active
                style={{
                  marginBottom: 16,
                  marginLeft: -8,
                  borderRadius: 8,
                  width: 40,
                  height: 40,
                }}
              />
            </>
          )}
          {menus?.map((item) => {
            return (
              <Styled.Link
                key={item.link}
                href={item.link}
                $active={new RegExp(item.activeRegex).test(pathname)}
                onClick={() => {
                  if (isMobile) {
                    setIsNavbarCollapsed(true);
                  }
                }}
              >
                {icons[item.icon as keyof typeof icons]}
                <Styled.LinkText $collapsed={isNavbarCollapsed}>
                  {item.description}
                </Styled.LinkText>
              </Styled.Link>
            );
          })}
          <span style={{ flex: 1 }} />
          <Tooltip title={isNavbarCollapsed ? "Sair" : null} placement="right">
            <Styled.Link
              key="/login"
              href="/login"
              $active={false}
              onClick={() => {
                supabase.auth.signOut();
              }}
            >
              <FaArrowRightToBracket size={20} />
              <Styled.LinkText $collapsed={isNavbarCollapsed}>
                {isNavbarCollapsed ? null : "Sair"}
              </Styled.LinkText>
            </Styled.Link>
          </Tooltip>
        </Styled.MenuItemsContainer>
      </Styled.Container>
    </div>
  );
}
