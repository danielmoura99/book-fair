import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(request: NextRequest) {
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
    "/transactions/:path*", // Página de transações e subpáginas
    "/books/:path*", // Página de livros e subpáginas
    "/cash/:path*", // Página de caixa e subpáginas

    // APIs
    "/api/transactions/:path*", // APIs de transações
    "/api/books/:path*", // APIs de livros
    "/api/cash/:path*", // APIs de caixa

    // Exclui arquivos estáticos
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
