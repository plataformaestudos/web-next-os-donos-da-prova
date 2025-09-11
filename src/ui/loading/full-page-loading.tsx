"use client";

import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { useTheme } from "styled-components";

interface FullPageLoadingProps {
    message?: string;
}

export const FullPageLoading = ({ message = "Carregando..." }: FullPageLoadingProps) => {
    const theme = useTheme();
    const spinIcon = <LoadingOutlined style={{ fontSize: 48, color: theme.colorPrimary }} spin />;
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                width: "100%",
                flexDirection: "column",
                gap: 16,
            }}
        >
            <Spin indicator={spinIcon}  />
            <p style={{ fontSize: 18 }}>{message}</p>
        </div>
    );
};
