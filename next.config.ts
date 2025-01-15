import type { NextConfig } from "next";

const routeAlias: {
  [key: string]: string;
} = {
  "/cadastro": "/signup",
  "/conta": "/account",
  "/concursos": "/exams",
  "/concursos/novo": "/exams/new",
  "/concursos/:id": "/exams/:id",
  "/simulado": "/practice-exam",
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
};

export default nextConfig;
