"use client";

import { PropsWithChildren, createContext, useContext, useState } from "react";

const NavbarContext = createContext({
  setIsNavbarCollapsed: (() => {}) as (collapsed: boolean) => void,
  isNavbarCollapsed: true,
});

export function NavbarContextProvider({ children }: PropsWithChildren) {
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState<boolean>(true);

  const onChangeNavbarCollapse = (collapsed: boolean) => {
    setIsNavbarCollapsed(collapsed);

    document.body.style.overflow = collapsed ? "auto" : "hidden";
  };

  return (
    <NavbarContext.Provider
      value={{
        isNavbarCollapsed,
        setIsNavbarCollapsed: onChangeNavbarCollapse,
      }}
    >
      {children}
    </NavbarContext.Provider>
  );
}

export function useNabvarContext() {
  return useContext(NavbarContext);
}
