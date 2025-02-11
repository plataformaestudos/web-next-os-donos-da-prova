import type { NextConfig } from "next";

const routeAlias: {
  [routeInPTBR: string]: string;
} = {
  "/cadastro": "/signup",
  "/conta": "/account",
  "/modulos": "/modules",
  "/modulos/novo": "/modules/new",
  "/modulos/:id": "/modules/:id",
  "/questoes": "/questions",
  "/questoes/nova": "/questions/new",
  "/questoes/:id": "/questions/:id",
  "/simulados": "/question-books",
  "/simulados/novo": "/question-books/new",
  "/simulados/:id": "/question-books/:id",
  "/perfil": "/profile",
};

const nextConfig: NextConfig = {
  async rewrites() {
    return Object.entries(routeAlias).map(([routeName, folderName]) => ({
      source: routeName,
      destination: folderName,
    }));
  },
  async redirects() {
    return Object.entries(routeAlias).map(([routeName, folderName]) => ({
      source: folderName,
      destination: routeName,
      permanent: true,
    }));
  },
  experimental: {
    ppr: "incremental",
  },
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;
