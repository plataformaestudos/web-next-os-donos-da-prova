"use client";

import { Avatar, Button, Segmented, theme } from "antd";
import { MenuOutlined, MoonFilled, SunFilled } from "@ant-design/icons";
import { useContext, useEffect, useState } from "react";

import { ThemeProvider } from "@/app/provider";
import { createClient } from "@/util/supabase/client";
import { useNabvarContext } from "../navbar/navbar.context";

const { useToken } = theme;

export function Header() {
  const supabase = createClient();
  const { token } = useToken();
  const { theme, setTheme } = useContext(ThemeProvider);
  const { isNavbarCollapsed, setIsNavbarCollapsed } = useNabvarContext();
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
    <div className="flex items-center justify-between px-4 h-20 sm:h-16 flex-shrink-0">
      <div className="flex items-center gap-4 ml-auto">
        <Segmented<"light" | "dark">
          options={[
            {
              icon: <MoonFilled />,
              value: "dark",
            },
            {
              icon: <SunFilled />,
              value: "light",
            },
          ]}
          value={theme as "light" | "dark"}
          onChange={setTheme}
        />
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
    </div>

  );
}
