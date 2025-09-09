"use client";

import * as Styled from "./header.style";

import { Button, Flex, Tooltip } from "antd";
import { MenuOutlined, MoonFilled, SunFilled } from "@ant-design/icons";
import { useContext, useEffect, useState } from "react";

import { ThemeProvider } from "@/app/provider";
import { createClient } from "@/util/supabase/client";
import { useNabvarContext } from "../navbar/navbar.context";
import Image from "next/image";
import { useUser } from "@/app/context/user.context"; 

export function Header() {
  const { theme, setTheme } = useContext(ThemeProvider);
  const { isNavbarCollapsed, setIsNavbarCollapsed } = useNabvarContext();
  const { user } = useUser();

  return (
    <Styled.Container>
      <Styled.LeftContainer>
        <Button
          onClick={() => setIsNavbarCollapsed(!isNavbarCollapsed)}
          icon={<MenuOutlined size={24} />}
        />
      </Styled.LeftContainer>
      <Flex
        align="center"
        gap="16px"
      >
        <Tooltip title={theme === "light" ? "Modo escuro" : "Modo claro"}>
          <Button
            type="text"
            icon={theme === "light" ? <MoonFilled /> : <SunFilled />}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          />
        </Tooltip>
        <Image
          src="/images/sino-2.png"
          alt="Notificações"
          width={28}
          height={28}
          style={{ cursor: "pointer" }}
        />
        {user && (
          <Styled.StyledAvatar onClick={() => (window.location.href = "/profile")}>
            {user.email?.charAt(0).toUpperCase()}
          </Styled.StyledAvatar>
        )}
      </Flex>
    </Styled.Container>
  );
}
