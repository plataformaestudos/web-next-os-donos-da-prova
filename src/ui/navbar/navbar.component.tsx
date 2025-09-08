"use client";

import * as Styled from "./navbar.style";

import { Skeleton, Tooltip } from "antd";
import {
  LuBook,
  LuCircleDollarSign,
  LuFileQuestion,
  LuFolders,
} from "react-icons/lu";

import { createClient } from "@/util/supabase/client";
import { useHorizontalSwipe } from "@/util/use-horizontal-swipe.hook";
import { useIsMobile } from "@/util/use-media-query.hook";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CgProfile } from "react-icons/cg";
import { FaArrowRightToBracket } from "react-icons/fa6";
import { useNabvarContext } from "./navbar.context";
import { useMenus } from "./use-menus.hook";
import { useState } from "react";

const icons = {
  home: (
    <Image
      src="/images/icons/INICIO.png"
      alt="Home"
      width={24}
      height={24}
    />
  ),
  book: (
    <Image
      src="/images/icons/CADERNOS.png"
      alt="Home"
      width={24}
      height={24}
    />
  ),
  question: (
    <LuFileQuestion
      color="#fff"
      size={24}
    />
  ),
  profile: (
    <Image
      src="/images/icons/USUARIOS.png"
      alt="Home"
      width={24}
      height={24}
    />
  ),
  module: (
    <Image
      src={"/images/icons/Modulos.png"}
      alt="Home"
      width={24}
      height={24}
    />
  ),
  plan: (
    <Image
      src="/images/icons/PLANOS E PAGAMENTOS.png"
      alt="Home"
      width={24}
      height={24}
    />
  ),
  subscription: (
    <Image
      src="/images/icons/PLANOS E PAGAMENTOS.png"
      alt="Home"
      width={24}
      height={24}
    />
  ),
};

const iconsB = {
  home: (
    <Image
      src="/images/icons/INICIO B.png"
      alt="Home"
      width={24}
      height={24}
    />
  ),
  book: (
    <Image
      src="/images/icons/CADERNOS B.png"
      alt="Cadernos"
      width={24}
      height={24}
    />
  ),
  question: (
    <LuFileQuestion
      color="#fff"
      size={24}
    />
  ),
  profile: (
    <Image
      src="/images/icons/USUARIOS B.png"
      alt="Usuarios"
      width={24}
      height={24}
    />
  ),
  module: (
    <Image
      src={"/images/icons/Modulos B.png"}
      alt="Modulos"
      width={24}
      height={24}
    />
  ),
  plan: (
    <Image
      src="/images/icons/PLANOS E PAGAMENTOS B.png"
      alt="Planos e Pagamentos"
      width={24}
      height={24}
    />
  ),
  subscription: (
    <Image
      src="/images/icons/PLANOS E PAGAMENTOS B.png"
      alt="Planos e Pagamentos"
      width={24}
      height={24}
    />
  ),
};

export function Navbar() {
  const supabase = createClient();
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const { isNavbarCollapsed, setIsNavbarCollapsed } = useNabvarContext();
  const handlers = useHorizontalSwipe({
    onSwipeLeft: () => setIsNavbarCollapsed(true),
  });
  const { menus, isLoading } = useMenus() as {
    menus: {
      link: string;
      activeRegex: string;
      icon: string;
      description: string;
    }[];
    isLoading: boolean;
  };
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div {...handlers}>
      <Styled.Container $collapsed={isNavbarCollapsed}>
        <Styled.RedHeader
          onClick={() => setIsNavbarCollapsed(!isNavbarCollapsed)}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <img
              src="/images/passaro.png"
              alt="Passaro"
            />
          </div>
        </Styled.RedHeader>

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
                  if (isMobile) setIsNavbarCollapsed(true);
                }}
                onMouseEnter={() => setHovered(item.link)}
                onMouseLeave={() => setHovered(null)}
              >
                {new RegExp(item.activeRegex).test(pathname) ||
                hovered === item.link
                  ? icons[item.icon as keyof typeof icons]
                  : iconsB[item.icon as keyof typeof iconsB]}
                <Styled.LinkText
                  $collapsed={isNavbarCollapsed}
                  $active={new RegExp(item.activeRegex).test(pathname)}
                >
                  {item.description}
                </Styled.LinkText>
              </Styled.Link>
            );
          })}
          <span style={{ flex: 1 }} />
          <div
            style={{
              width: "100%",
              backgroundColor: "#af2615",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 16,
            }}
          >
            <Tooltip
              title={isNavbarCollapsed ? "Sair" : null}
              placement="right"
            >
              <Styled.Link
                key="/login"
                href="/login"
                $active={false}
                onClick={() => {
                  supabase.auth.signOut();
                }}
              >
                <FaArrowRightToBracket size={20} />
                <Styled.LinkText
                  $collapsed={isNavbarCollapsed}
                  $active={false}
                >
                  {isNavbarCollapsed ? null : "Sair"}
                </Styled.LinkText>
              </Styled.Link>
            </Tooltip>
          </div>
        </Styled.MenuItemsContainer>
      </Styled.Container>
    </div>
  );
}
