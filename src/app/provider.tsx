"use client";

import "@ant-design/v5-patch-for-react-19";

import { ConfigProvider, ThemeConfig, theme as antdTheme } from "antd";
import { PropsWithChildren, createContext, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { StyleProvider } from "@ant-design/cssinjs";

const queryClient = new QueryClient();

export const ThemeProvider = createContext(
  {} as {
    theme: string;
    setTheme: (theme: "light" | "dark") => void;
  }
);

const defaultTheme: ThemeConfig = {
  token: {
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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider.Provider value={{ theme, setTheme }}>
        <AntdRegistry>
          <StyleProvider layer>
            <ConfigProvider theme={themes[theme]}>{children}</ConfigProvider>
          </StyleProvider>
        </AntdRegistry>
      </ThemeProvider.Provider>
    </QueryClientProvider>
  );
}
