//pages/terminal.tsx
import { useEffect, useState } from "react";

import { Mulish } from "next/font/google";
import "@/app/globals.css";
import Image from "next/image";
import { ConsultTable } from "@/components/terminal/consult-table";
import { serializeDecimalFields } from "@/lib/utils";

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
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 p-6 container mx-auto">
          {/* Logos e Títulos Centralizados */}
          <div className="flex flex-col items-center justify-center mb-8 mt-4">
            <div className="flex items-center gap-6 mb-4">
              <Image
                src="/LogoFLE.png"
                width={110}
                height={39}
                alt="FLE Control"
              />
              <Image
                src="/LogoFLEI.png"
                width={110}
                height={39}
                alt="FLEI Control"
              />
              <Image
                src="/logouse.png"
                width={110}
                height={39}
                alt="USE Control"
              />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold">
                53º Feira do Livro Espírita
              </h1>
              <span className="text-sm text-muted-foreground">
                31º Feira do Livro Espírita Infantil
              </span>
              <h1 className="text-2xl font-bold">Terminal de Consulta</h1>
            </div>
          </div>

          {/* Tabela de Consulta */}
          <div className="bg-background rounded-lg">
            {loading ? (
              <div className="text-center p-8">Carregando livros...</div>
            ) : (
              <ConsultTable data={books} />
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-solid py-4">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>USE São José dos Campos © {new Date().getFullYear()}</p>
            <p>Terminal de Consulta - Feira do Livro Espírita</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
