//pages/terminal.tsx
import { useEffect, useState } from "react";

import { Mulish } from "next/font/google";
import "@/app/globals.css";
import Image from "next/image";
import { ConsultTable } from "@/components/terminal/consult-table";
import { serializeDecimalFields } from "@/lib/utils";
import { TerminalEnhancer } from "@/components/terminal/terminal-enhancer";

const mulish = Mulish({
  subsets: ["latin-ext"],
});

export default function TerminalPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/books")
      .then((res) => res.json())
      .then((data) => {
        // Garantir que os valores decimais sejam corretamente serializados
        const serializedData = serializeDecimalFields(data);
        setBooks(serializedData);
      })
      .catch((error) => {
        console.error("Erro ao carregar livros:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className={mulish.className}>
      <TerminalEnhancer />
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 p-4 container mx-auto">
          {/* Cabeçalho com Títulos Maiores */}
          <div className="flex flex-col items-center justify-center mb-10 mt-4">
            <div className="flex items-center gap-8 mb-3">
              <Image
                src="/LogoFLE.png"
                width={130}
                height={45}
                alt="FLE Control"
              />
              <Image
                src="/LogoFLEI.png"
                width={130}
                height={45}
                alt="FLEI Control"
              />
              <Image
                src="/logouse.png"
                width={130}
                height={45}
                alt="USE Control"
              />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold -mb-1">
                53º Feira do Livro Espírita
              </h1>
              <div className="text-xl text-muted-foreground mb-2">
                31º Feira do Livro Espírita Infantil
              </div>
              <h1 className="text-3xl font-bold bg-blue-100 py-3 px-8 rounded-full shadow-sm">
                Terminal de Consulta
              </h1>
            </div>
          </div>

          {/* Tabela de Consulta */}
          <div className="bg-background rounded-lg">
            {loading ? (
              <div className="text-center p-6 text-2xl">
                <div className="animate-pulse">Carregando livros...</div>
              </div>
            ) : (
              <ConsultTable data={books} />
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-solid py-4">
          <div className="container mx-auto text-center text-lg text-muted-foreground">
            <p>USE São José dos Campos © {new Date().getFullYear()}</p>
            <p>Terminal de Consulta - Feira do Livro Espírita</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
