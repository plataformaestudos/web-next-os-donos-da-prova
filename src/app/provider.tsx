"use client";

import "@ant-design/v5-patch-for-react-19";

import { App, ConfigProvider, ThemeConfig, theme as antdTheme } from "antd";
import { PropsWithChildren, createContext, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AntdRegistry } from "@ant-design/nextjs-registry";

const queryClient = new QueryClient();

export const ThemeProvider = createContext(
  {} as {
    theme: string;
    setTheme: (theme: "light" | "dark") => void;
  }
);

const defaultTheme: ThemeConfig = {
  token: {
    fontFamily: "Inter, Inter Fallback",
    colorPrimary: "#4338ca",
  },
};

const themes = {
  light: {
    ...defaultTheme,
    algorithm: antdTheme.defaultAlgorithm,
  },
  dark: {
    ...defaultTheme,
    algorithm: antdTheme.darkAlgorithm,
  },
} as Record<string, ThemeConfig>;

export function ClientProviders({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState("light");

  return (
    <AntdRegistry>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider.Provider value={{ theme, setTheme }}>
          <ConfigProvider theme={themes[theme]}>
            <App>{children}</App>
          </ConfigProvider>
        </ThemeProvider.Provider>
      </QueryClientProvider>
    </AntdRegistry>
  );
}
