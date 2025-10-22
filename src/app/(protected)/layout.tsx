"use client";

import * as Styled from "./layout.style";

import { Header } from "@/ui/header/header.component";
import { Navbar } from "@/ui/navbar/navbar.component";
import { NavbarContextProvider } from "@/ui/navbar/navbar.context";
import { Footer } from "@/ui/footer/footer.component";

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
          <Styled.ContentContainer>
            {children}
            <Footer />
          </Styled.ContentContainer>
        </Styled.HeaderAndContentContainer>
      </Styled.Container>
    </NavbarContextProvider>
  );
}
