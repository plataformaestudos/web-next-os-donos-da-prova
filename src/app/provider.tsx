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
import { DefaultTheme } from "styled-components/dist/types";

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
      // indentSize: 12,
      // titleHeight: 32,
    },
    Skeleton: {
      paragraphLiHeight: 24,
      titleHeight: 40,
    },
  },
};

const themes = {
  light: {
    ...defaultTheme,
    algorithm: antdTheme.defaultAlgorithm,
    token: {
      ...defaultTheme.token,
      colorBgFilter: "#EDEFF0",
      colorPrimary: "#163658",
      colorPrimaryBg: "#e7f1fe",
      colorPrimaryText: "#163658",
      colorText: "#163658",
      colorSecondary: "#FFFFFF",
      colorTertiary: "#af2615",
      colorTertiaryText: "#FFFFFF",
    },
  },
  dark: {
    ...defaultTheme,
    algorithm: antdTheme.darkAlgorithm,
    token: {
      ...defaultTheme.token,
      colorBgFilter: "#1A1A1A",
      colorPrimary: "#FFFFFF",
      colorPrimaryText: "#EDEFF0",
      colorText: "#EDEFF0",
      colorPrimaryBg: "#163658",
      colorSecondary: "#163658",
      colorTertiary: "#af2615",
      colorTertiaryText: "#FFFFFF",
    },
  },
} as Record<string, ThemeConfig>;

const { useToken } = theme;

function WithAntdTheme({ children }: PropsWithChildren) {
  const { token } = useToken();

  const styledTheme = {
    ...token,
  } as DefaultTheme;

  return (
    <StyledComponentsThemeProvider theme={styledTheme}>
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
