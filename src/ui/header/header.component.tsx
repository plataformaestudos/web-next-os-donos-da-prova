"use client";

import * as Styled from "./header.style";

import { Avatar, Button, Tooltip, theme } from "antd";
import { MoonFilled, SunFilled } from "@ant-design/icons";
import { useContext, useEffect, useState } from "react";

import { ThemeProvider } from "@/app/provider";
import { createClient } from "@/util/supabase/client";

const { useToken } = theme;

export function Header() {
  const supabase = createClient();
  const { token } = useToken();
  const { theme, setTheme } = useContext(ThemeProvider);
  const [userEmail, setUserEmail] = useState("");

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
      <div className="flex items-center gap-4 ml-auto">
        <Tooltip title={theme === "light" ? "Modo escuro" : "Modo claro"}>
          <Button
            type="text"
            icon={theme === "light" ? <MoonFilled /> : <SunFilled />}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          />
        </Tooltip>
        <Avatar
          size="large"
          style={{
            backgroundColor: token.colorBgElevated,
            color: token.colorText,
          }}
        >
          {userEmail.charAt(0).toUpperCase()}
        </Avatar>
      </div>
    </Styled.Container>
  );
}
