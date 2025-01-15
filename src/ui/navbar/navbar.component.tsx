"use client";

import "./navbar.css";

import clsx from "clsx";
import { useNabvarContext } from "./navbar.context";

export function Navbar() {
  const { isNavbarCollapsed, setIsNavbarCollapsed } = useNabvarContext();

  return (
    <>
      <div
        className={clsx(
          "absolute w-full h-full transition-all duration-300 ease-in-out z-0 backdrop-blur-sm sm:hidden",
          isNavbarCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
        onClick={() => setIsNavbarCollapsed(true)}
      />
      <div
        className={clsx(
          "absolute h-full w-3/4 bg-green-500 transition-all duration-300 ease-in-out z-10 sm:static",
          isNavbarCollapsed ? "-left-full sm:w-20" : "left-0 sm:w-80"
        )}
      >
        Navbar
      </div>
    </>
  );
}
