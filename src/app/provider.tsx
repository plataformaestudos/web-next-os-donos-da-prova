"use client";

import "@ant-design/v5-patch-for-react-19";

import { App, ConfigProvider, ThemeConfig, theme as antdTheme } from "antd";
import { PropsWithChildren, createContext, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StyleProvider, createCache, extractStyle } from "@ant-design/cssinjs";

import { useServerInsertedHTML } from "next/navigation";

export const RootStyleRegistry = ({ children }: PropsWithChildren) => {
  const [cache] = useState(() => createCache());

  useServerInsertedHTML(() => {
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `</script>${extractStyle(cache)}<script>`,
        }}
      />
    );
  });

  return <StyleProvider cache={cache}>{children}</StyleProvider>;
};

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
    <RootStyleRegistry>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider.Provider value={{ theme, setTheme }}>
          <ConfigProvider theme={themes[theme]}>
            <App>{children}</App>
          </ConfigProvider>
        </ThemeProvider.Provider>
      </QueryClientProvider>
    </RootStyleRegistry>
  );
}
