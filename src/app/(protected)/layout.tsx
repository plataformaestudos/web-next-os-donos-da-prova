"use client";

import * as Styled from "./layout.style";

import { Header } from "@/ui/header/header.component";
import { Navbar } from "@/ui/navbar/navbar.component";
import { NavbarContextProvider } from "@/ui/navbar/navbar.context";
import { Footer } from "@/ui/footer/footer.component";
import { useUser } from "@/app/context/user.context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) return null;

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
