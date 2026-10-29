/** Keep application routes closed even if an external API returns an unexpected page. */
const reservedRoots = new Set([
  "", "api", "_next", "auth", "login", "logout", "r", "cadastro", "signup", "forgot-password", "reset-password", "accept-invitation",
  "termos-e-politicas", "terms-and-policies", "termos-de-uso", "terms-of-use", "politica-privacidade", "privacy-policy", "configuracoes-cookies", "config-cookies",
  "home", "account", "conta", "modules", "modulos", "questions", "questoes", "question-books", "cadernos", "plans", "planos", "subscription", "assinatura", "profile", "perfil",
  "question-reports", "reports-de-questoes", "question-imports", "importacao-questoes", "gerenciar-usuarios", "afiliados", "admin", "administracao", "ebooks", "gerenciar-ebooks", "ebook-pages", "ebook-orders", "ebook-catalog",
  "public", "dashboard", "checkout", "orders", "payments", "webhooks", "health", "metrics", "entrar", "cadastrar", "recuperar-senha", "redefinir-senha", "aceitar-convite", "painel", "administrador", "termos", "privacidade", "cookies", "assets", "static", "favicon", "robots", "sitemap", "favicon-ico", "robots-txt", "sitemap-xml",
  "images", "fonts", "favicon.ico", "robots.txt", "sitemap.xml",
]);

export function isCustomEbookPath(path: string) {
  if (path.length > 200 || !/^\/[a-z0-9][a-z0-9/-]*$/.test(path) || path.includes("//") || path.endsWith("/")) return false;
  const segments = path.slice(1).split("/");
  return segments.length <= 6 && !reservedRoots.has(segments[0]) && segments.every(segment => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(segment));
}

export function isBuiltinEbookPublicPath(path: string) {
  return path === "/ebooks/checkout" || path === "/ebooks/recuperar" || /^\/ebooks\/pedido\/[0-9a-f-]{36}$/i.test(path);
}
