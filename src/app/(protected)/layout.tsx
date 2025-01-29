"use client";

import { Header } from "@/ui/header/header.component";
import { Navbar } from "@/ui/navbar/navbar.component";
import { NavbarContextProvider } from "@/ui/navbar/navbar.context";
import { theme } from "antd";

const { useToken } = theme;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token } = useToken();

  return (
    <NavbarContextProvider>
      <div
        className="w-dvh h-dvh flex relative"
        style={{
          backgroundColor: token.colorPrimaryBg,
          color: token.colorText,
        }}
      >
        <Navbar />
        <div className="flex-1 flex flex-col overflow-auto">
          <Header />
          <div className="flex flex-1">{children}</div>
        </div>
      </div>
    </NavbarContextProvider>
  );
}
