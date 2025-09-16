"use client";
import { useEffect } from "react";

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark" || savedTheme === "light") {
        document.documentElement.setAttribute("data-theme", savedTheme);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return <>{children}</>;
}
