"use client";

import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const NavbarContext = createContext({
  setIsNavbarCollapsed: (() => {}) as Dispatch<SetStateAction<boolean>>,
  isNavbarCollapsed: true,
});

export function NavbarContextProvider({ children }: PropsWithChildren) {
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(false);

  return (
    <NavbarContext.Provider value={{ isNavbarCollapsed, setIsNavbarCollapsed }}>
      {children}
    </NavbarContext.Provider>
  );
}

export function useNabvarContext() {
  return useContext(NavbarContext);
}
