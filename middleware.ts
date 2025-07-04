//middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Redirecionamento da rota raiz para /vendas
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/vendas", request.url));
  }

  const response = NextResponse.next();

  // Previne cache em todas as rotas
  response.headers.set("Cache-Control", "no-store, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}

export const config = {
  matcher: [
    // Páginas principais
    "/", // Painel principal
    "/vendas/:path*", // Página de vendas e subpáginas
    "/transactions/:path*", // Página de transações e subpáginas
    "/books/:path*", // Página de livros e subpáginas
    "/cash/:path*", // Página de caixa e subpáginas
    "/relatorios/:path*", // Página de relatórios e subpáginas

    // APIs
    "/api/transactions/:path*", // APIs de transações
    "/api/books/:path*", // APIs de livros
    "/api/cash/:path*", // APIs de caixa
    "/api/reports/:path*", // APIs de relatórios
    "/api/exchanges/:path*", // APIs de trocas
    "/api/returns/:path*", // APIs de devoluções

    // Exclui arquivos estáticos
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
