"use client";

import * as Styled from "./layout.style";

import { Header } from "@/ui/header/header.component";
import { Navbar } from "@/ui/navbar/navbar.component";
import { NavbarContextProvider } from "@/ui/navbar/navbar.context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NavbarContextProvider>
      <Styled.Container>
        <Navbar />
        <Styled.HeaderAndContentContainer>
          <Header />
          <Styled.ContentContainer>{children}</Styled.ContentContainer>
        </Styled.HeaderAndContentContainer>
      </Styled.Container>
    </NavbarContextProvider>
  );
}
