"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
  onError?: (error: Error, info?: React.ErrorInfo) => void;
};

type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (this.props.onError) {
      try {
        this.props.onError(error, info);
      } catch (e) {
        console.error("onError callback falhou", e);
      }
    } else {
      console.error("Erro capturado pelo ErrorBoundary:", error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h2>Ops — algo deu errado.</h2>
          <p>Recarregue a página ou tente novamente mais tarde.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
