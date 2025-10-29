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
  "/questoes/modulo/:idModule": "/questions/module/:idModule",
  "/cadernos": "/question-books",
  "/cadernos/novo": "/question-books/new",
  "/cadernos/:id": "/question-books/:id",
  "/planos": "/plans",
  "/planos/novo": "/plans/new",
  "/planos/:id": "/plans/:id",
  "/assinatura": "/subscription",
  "/perfil": "/profile",
  "/perfil/editar": "/profile/edit",
  "/politica-privacidade": "/privacy-policy",
  "/termos-de-uso": "/terms-of-use",
  "/termos-e-politicas": "/terms-and-policies",
  "/reports-de-questoes": "/question-reports",
  "/configuracoes-cookies": "/config-cookies",
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
    appDir: true,
    staleTimes: {
      dynamic: 180,
    },
  },
  // output: "standalone",
};

export default nextConfig;
