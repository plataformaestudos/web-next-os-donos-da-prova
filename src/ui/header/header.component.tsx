"use client";

import * as Styled from "./header.style";

import { Button, Flex, Tooltip } from "antd";
import { MenuOutlined, MoonFilled, SunFilled } from "@ant-design/icons";
import { useContext, useEffect, useState } from "react";

import { ThemeProvider } from "@/app/provider";
import { createClient } from "@/util/supabase/client";
import { useNabvarContext } from "../navbar/navbar.context";
import Image from "next/image";

export function Header() {
  const supabase = createClient();
  const { theme, setTheme } = useContext(ThemeProvider);
  const [userEmail, setUserEmail] = useState("");
  const { isNavbarCollapsed, setIsNavbarCollapsed } = useNabvarContext();

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUserEmail(user?.email as string);
    }
    getUser();
  }, [supabase.auth]);

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
        <Styled.StyledAvatar
          onClick={() => (window.location.href = "/profile")}
        >
          {userEmail.charAt(0).toUpperCase()}
        </Styled.StyledAvatar>
      </Flex>
    </Styled.Container>
  );
}
