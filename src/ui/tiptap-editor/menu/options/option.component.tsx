import { Button, Tooltip, theme } from "antd";

import { PropsWithChildren } from "react";

const { useToken } = theme;

interface OptionProps {
  isDisabled: boolean;
  isActive: boolean;
  tooltip: string;

  onClick?: () => void;
}

export function Option({
  onClick,
  isActive,
  isDisabled,
  tooltip,
  children,
}: PropsWithChildren<OptionProps>) {
  const { token } = useToken();

  return (
    <Tooltip title={tooltip}>
      <Button
        disabled={isDisabled}
        type="text"
        size="small"
        style={{
          height: 32,
          backgroundColor: isActive ? token.colorBgTextHover : undefined,
        }}
        onClick={onClick}
      >
        {children}
      </Button>
    </Tooltip>
  );
}
