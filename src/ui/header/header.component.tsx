"use client";

import * as Styled from "./header.style";

import { Button, Flex, Tooltip } from "antd";
import { MenuOutlined, MoonFilled, SunFilled } from "@ant-design/icons";
import { useContext } from "react";

import { ThemeProvider } from "@/app/provider";
import { useNabvarContext } from "../navbar/navbar.context";
import { useUser } from "@/app/context/user.context"; 
import NotificationsClient from "../notifications/notifications.client";

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
         <NotificationsClient />
        {user && (
          <Styled.StyledAvatar onClick={() => (window.location.href = "/profile")}>
            {user.profile?.name?.charAt(0).toUpperCase()}
          </Styled.StyledAvatar>
        )}
      </Flex>
    </Styled.Container>
  );
}
