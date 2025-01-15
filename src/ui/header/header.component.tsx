"use client";

import { Button } from "react-aria-components";
import { useNabvarContext } from "../navbar/navbar.context";

export function Header() {
  const { isNavbarCollapsed, setIsNavbarCollapsed } = useNabvarContext();

  return (
    <div className="flex items-center justify-center border-b-blue-500 h-16 sm:h-10">
      <Button onPress={() => setIsNavbarCollapsed(!isNavbarCollapsed)}>
        Toggle Navbar
      </Button>
    </div>
  );
}
