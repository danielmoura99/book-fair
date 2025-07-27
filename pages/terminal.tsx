//pages/terminal.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Mulish } from "next/font/google";
import "@/app/globals.css";
import Image from "next/image";
import { OptimizedConsultTable } from "@/components/terminal/optimized-consult-table";
import { TerminalEnhancer } from "@/components/terminal/terminal-enhancer";

const mulish = Mulish({
  subsets: ["latin-ext"],
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Cache por 5 minutos
      gcTime: 10 * 60 * 1000, // Manter no cache por 10 minutos
    },
  },
});

function TerminalContent() {
  return (
    <div className={mulish.className}>
      <TerminalEnhancer />
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 p-1 sm:p-2 container mx-auto max-w-7xl">
          {/* Cabeçalho Responsivo */}
          <div className="mb-4 mt-2 px-2 sm:px-4 py-2 bg-white rounded-lg shadow-sm border">
            {/* Layout mobile - empilhado */}
            <div className="block md:hidden">
              {/* Título principal no mobile */}
              <div className="text-center mb-3">
                <h1 className="text-base font-bold text-gray-800">
                  54ª Feira do Livro Espírita
                </h1>
                <div className="text-xs text-muted-foreground">
                  31ª Feira do Livro Espírita Infantil
                </div>
              </div>
              
              {/* Logos menores no mobile */}
              <div className="flex items-center justify-center gap-3 mb-3">
                <Image
                  src="/LogoFLE.png"
                  width={50}
                  height={18}
                  alt="FLE Control"
                />
                <Image
                  src="/LogoFLEI.png"
                  width={50}
                  height={18}
                  alt="FLEI Control"
                />
                <Image
                  src="/logouse.png"
                  width={50}
                  height={18}
                  alt="USE Control"
                />
              </div>
              
              {/* Badge do terminal no mobile */}
              <div className="text-center">
                <div className="bg-blue-100 px-3 py-1 rounded-full inline-block">
                  <span className="text-sm font-bold text-blue-800">
                    Terminal de Consulta
                  </span>
                </div>
              </div>
            </div>

            {/* Layout desktop - horizontal */}
            <div className="hidden md:flex items-center justify-between">
              {/* Logos menores à esquerda */}
              <div className="flex items-center gap-4">
                <Image
                  src="/LogoFLE.png"
                  width={80}
                  height={28}
                  alt="FLE Control"
                />
                <Image
                  src="/LogoFLEI.png"
                  width={80}
                  height={28}
                  alt="FLEI Control"
                />
                <Image
                  src="/logouse.png"
                  width={80}
                  height={28}
                  alt="USE Control"
                />
              </div>
              
              {/* Títulos centralizados e compactos */}
              <div className="text-center flex-1">
                <h1 className="text-lg font-bold text-gray-800">
                  54ª Feira do Livro Espírita
                </h1>
                <div className="text-sm text-muted-foreground">
                  31ª Feira do Livro Espírita Infantil
                </div>
              </div>
              
              {/* Badge do terminal à direita */}
              <div className="bg-blue-100 px-4 py-2 rounded-full">
                <span className="text-lg font-bold text-blue-800">
                  Terminal de Consulta
                </span>
              </div>
            </div>
          </div>

          {/* Tabela de Consulta Otimizada */}
          <div className="bg-background rounded-lg">
            <OptimizedConsultTable />
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-solid py-3 sm:py-4">
          <div className="container mx-auto text-center text-sm sm:text-lg text-muted-foreground px-4">
            <p>USE São José dos Campos © {new Date().getFullYear()}</p>
            <p className="hidden sm:block">Terminal de Consulta - Feira do Livro Espírita</p>
            <p className="block sm:hidden text-xs">Terminal de Consulta</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function TerminalPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <TerminalContent />
    </QueryClientProvider>
  );
}
