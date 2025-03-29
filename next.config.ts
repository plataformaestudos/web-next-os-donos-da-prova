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
  "/cadernos": "/question-books",
  "/cadernos/novo": "/question-books/new",
  "/cadernos/:id": "/question-books/:id",
  "/planos": "/plans",
  "/planos/novo": "/plans/new",
  "/planos/:id": "/plans/:id",
  "/perfil": "/profile",
};

const nextConfig = {
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
  compiler: {
    styledComponents: true,
  },
  experimental: {
    staleTimes: {
      dynamic: 180,
    },
  },
  // output: "standalone",
};

export default nextConfig;
