import { Spin } from "antd";

import * as S from "./styles";

interface AppLoadingProps {
  show?: boolean;
  loadingText?: string;
  loadingModal?: boolean;
}

export const AppLoading = ({ show, loadingText, loadingModal }: AppLoadingProps) => {
  if (!show) {
    return null;
  }

  if (loadingModal) {
    return (
      <S.LoadingModal>
        <Spin />
        <S.LoadingText>
          {loadingText || "Carregando..."}
        </S.LoadingText>
      </S.LoadingModal>
    );
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
