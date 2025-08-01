import { Spin } from "antd";

import * as S from "./styles";

interface AppLoadingProps {
  show?: boolean;
  loadingText?: string;
}

export const AppLoading = ({ show, loadingText }: AppLoadingProps) => {
  if (!show) {
    return null;
  }

  return (
    <S.LoadingContiner>
      <Spin />
      <S.LoadingText>
        {loadingText || "Carregando..."}
      </S.LoadingText>
    </S.LoadingContiner>
  );
};
