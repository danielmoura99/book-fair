//componentes/terminal/consult-table.tsx
"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { SerializedBook } from "@/types";

interface ConsultTableProps {
  data: SerializedBook[];
}

export function ConsultTable({ data }: ConsultTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBooks = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) return data;

    // Variações comuns para tratar no sistema de busca
    const nameVariations: { [key: string]: string[] } = {
      joana: ["joanna"],
      joanna: ["joana"],
      angelis: ["ângelis", "angelis", "ângelis"],
      ângelis: ["angelis", "ângelis", "angelis"],
    };

    return data.filter((book) => {
      // Verificação normal
      if (
        book.title.toLowerCase().includes(search) ||
        book.codFle.toLowerCase().includes(search) ||
        book.author.toLowerCase().includes(search) ||
        book.publisher.toLowerCase().includes(search) ||
        book.subject.toLowerCase().includes(search) ||
        book.medium.toLowerCase().includes(search)
      ) {
        return true;
      }

      // Verificação para variações de nomes
      for (const [variant, alternatives] of Object.entries(nameVariations)) {
        if (search.includes(variant)) {
          // Construímos termos de busca alternativos substituindo a variação
          const alternativeSearches = alternatives.map((alt) =>
            search.replace(variant, alt)
          );

          // Verificamos se alguma das alternativas corresponde
          for (const altSearch of alternativeSearches) {
            if (
              book.title.toLowerCase().includes(altSearch) ||
              book.author.toLowerCase().includes(altSearch) ||
              book.medium.toLowerCase().includes(altSearch)
            ) {
              return true;
            }
          }
        }
      }

      // Caso específico completo para "Joana de Angelis"/"Joanna de Ângelis"
      if (
        search === "joana de angelis" ||
        search === "joanna de angelis" ||
        search === "joana de ângelis" ||
        search === "joanna de ângelis"
      ) {
        const mediumName = book.medium.toLowerCase();
        return (
          mediumName.includes("joana de angelis") ||
          mediumName.includes("joanna de angelis") ||
          mediumName.includes("joana de ângelis") ||
          mediumName.includes("joanna de ângelis")
        );
      }

      return false;
    });
  }, [data, searchTerm]);

  // Função para calcular e formatar o desconto
  const calculateDiscount = (price: number, coverPrice: number) => {
    if (!price || price <= 0 || price <= coverPrice) return "-";

    const discountAmount = price - coverPrice;
    const discountPercent = (discountAmount / price) * 100;

    return (
      <div>
        <div className="text-green-600 font-medium">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(discountAmount)}
        </div>
        <div className="text-sm text-green-500">
          ({discountPercent.toFixed(0)}% de desconto)
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Barra de Busca Melhorada */}
      <div className="max-w-3xl mx-auto">
        <div className="relative">
          <div className="relative flex items-center h-16 rounded-full border-2 shadow-sm hover:shadow-md focus-within:shadow-md">
            <Search className="absolute left-6 h-8 w-8 text-muted-foreground" />
            <Input
              className="pl-16 pr-6 h-full w-full text-xl rounded-full border-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400"
              placeholder="Digite aqui para buscar livros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: "1.25rem" }}
            />
          </div>
          <p className="mt-2 text-center text-muted-foreground text-lg">
            Você pode buscar por título, autor, código FLE, editora, ou assunto
          </p>
        </div>
      </div>

      {/* Tabela de Resultados com Maior Contraste */}
      <div className="rounded-lg border-2">
        <ScrollArea className="h-[calc(100vh-400px)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="font-bold text-xl text-black py-6">
                  Código FLE
                </TableHead>
                <TableHead className="font-bold text-xl text-black py-6">
                  Local
                </TableHead>
                <TableHead className="font-bold text-xl text-black py-6">
                  Título
                </TableHead>
                <TableHead className="font-bold text-xl text-black py-6">
                  Autor
                </TableHead>
                <TableHead className="font-bold text-xl text-black py-6">
                  Médium
                </TableHead>
                <TableHead className="font-bold text-xl text-black py-6">
                  Editora
                </TableHead>
                <TableHead className="font-bold text-xl text-black py-6">
                  Assunto
                </TableHead>
                <TableHead className="font-bold text-xl text-black text-right py-6">
                  Qtd.
                </TableHead>
                <TableHead className="font-bold text-xl text-black text-right py-6">
                  Preço Normal
                </TableHead>
                <TableHead className="font-bold text-xl text-black text-right py-6">
                  Preço Feira
                </TableHead>
                <TableHead className="font-bold text-xl text-black text-right py-6">
                  Economia
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.map((book, index) => (
                <TableRow
                  key={book.id}
                  className={`
                    text-lg hover:bg-blue-50 
                    ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  `}
                >
                  <TableCell className="py-4 text-lg">{book.codFle}</TableCell>
                  <TableCell className="py-4 text-lg">
                    {book.location}
                  </TableCell>
                  <TableCell className="py-4 text-lg font-medium">
                    {book.title}
                  </TableCell>
                  <TableCell className="py-4 text-lg">{book.author}</TableCell>
                  <TableCell className="py-4 text-lg">{book.medium}</TableCell>
                  <TableCell className="py-4 text-lg">
                    {book.publisher}
                  </TableCell>
                  <TableCell className="py-4 text-lg">{book.subject}</TableCell>
                  <TableCell className="py-4 text-lg text-right">
                    {book.quantity}
                  </TableCell>
                  <TableCell className="py-4 text-lg text-right font-medium text-gray-600">
                    {Number(book.price) > 0
                      ? new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(Number(book.price))
                      : "Não informado"}
                  </TableCell>
                  <TableCell className="py-4 text-lg text-right font-medium text-blue-600">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Number(book.coverPrice))}
                  </TableCell>
                  <TableCell className="py-4 text-lg text-right">
                    {calculateDiscount(
                      Number(book.price),
                      Number(book.coverPrice)
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Contador de Resultados */}
      <div className="text-center text-lg text-muted-foreground">
        {filteredBooks.length === data.length
          ? `Total de ${data.length} livros disponíveis`
          : `Encontrados ${filteredBooks.length} livros`}
      </div>
    </div>
  );
}
