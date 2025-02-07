import { theme } from "antd";

const { useToken } = theme;

export function useCommonTokens() {
  const { token } = useToken();

  return {
    colorPrimary: token.colorPrimary,
    colorBgContainer: token.colorBgContainer,
  };
}
