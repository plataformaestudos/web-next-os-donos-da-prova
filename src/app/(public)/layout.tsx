"use client";

import styled from "styled-components";
import { Footer } from "@/ui/footer/footer.component";

const PublicLayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colorPrimaryBg};
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicLayoutContainer>
      <MainContent>
        {children}
      </MainContent>
      <Footer />
    </PublicLayoutContainer>
  );
}
