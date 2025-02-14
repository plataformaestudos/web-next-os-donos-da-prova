"use client";

import "@ant-design/v5-patch-for-react-19";

import {
  App,
  ConfigProvider,
  ThemeConfig,
  theme as antdTheme,
  theme,
} from "antd";
import { PropsWithChildren, createContext, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ServerStyleSheet,
  StyleSheetManager,
  ThemeProvider as StyledComponentsThemeProvider,
} from "styled-components";
import { StyleProvider, createCache, extractStyle } from "@ant-design/cssinjs";

import { useServerInsertedHTML } from "next/navigation";

export const RootStyleRegistry = ({ children }: PropsWithChildren) => {
  const [cache] = useState(() => createCache());
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  useServerInsertedHTML(() => {
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `</script>${extractStyle(cache)}<script>`,
        }}
      />
    );
  });

  if (typeof window !== "undefined") {
    return children;
  }

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      <StyleProvider cache={cache}>{children}</StyleProvider>
    </StyleSheetManager>
  );
};

const queryClient = new QueryClient();

export const ThemeProvider = createContext(
  {} as {
    theme: "light" | "dark";
    setTheme: (theme: "light" | "dark") => void;
  }
);

const defaultTheme: ThemeConfig = {
  token: {
    fontFamily: "Inter, Inter Fallback",
  },
  components: {
    Tree: {
      indentSize: 12,
      titleHeight: 32,
    },
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

const { useToken } = theme;

function WithAntdTheme({ children }: PropsWithChildren) {
  const { token } = useToken();

  return (
    <StyledComponentsThemeProvider theme={token}>
      {children}
    </StyledComponentsThemeProvider>
  );
}

export function ClientProviders({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <RootStyleRegistry>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider.Provider value={{ theme, setTheme }}>
          <ConfigProvider theme={themes[theme]}>
            <App>
              <WithAntdTheme>{children}</WithAntdTheme>
            </App>
          </ConfigProvider>
        </ThemeProvider.Provider>
      </QueryClientProvider>
    </RootStyleRegistry>
  );
}
