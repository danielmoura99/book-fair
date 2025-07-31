//components/terminal/optimized-consult-table.tsx
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBooksSearch } from "@/app/hooks/use-books";
import { useDebounce } from "@/hooks/use-debounce";

export function OptimizedConsultTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  // Debounce da busca para evitar requests excessivos
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Expandir busca da API para incluir variações de nomes antes de enviar
  const expandedSearch = useMemo(() => {
    if (!debouncedSearch.trim()) return "";

    const search = debouncedSearch.toLowerCase().trim();

    // Para casos específicos como "joana de angelis", buscar especificamente
    if (search.includes("joana de") || search.includes("joanna de")) {
      return "joanna"; // Buscar pela grafia mais comum na API
    }
    // Se é só "joana" sozinho, buscar por "joanna" para pegar mais resultados
    if (search === "joana") {
      return "joanna"; // Buscar por "joanna" que vai pegar mais livros da Joanna de Ângelis
    }
    // Se é "joanna", manter
    if (search === "joanna") {
      return search;
    }
    if (search.includes("angelis") && !search.includes("ângelis")) {
      return "ângelis"; // Buscar pela grafia correta na API
    }

    return debouncedSearch;
  }, [debouncedSearch]);

  const { data, isLoading, error, refetch } = useBooksSearch({
    page,
    limit: 200, // Aumentar limite para ter mais chances de encontrar
    search: expandedSearch,
    sortBy: "title",
    sortOrder: "asc",
  });

  // Filtro adicional no frontend para casos específicos como "Joanna de Ângelis"
  const filteredBooks = useMemo(() => {
    if (!data?.books) return [];

    // Debug: log para ver quantos livros vieram da API
    if (searchTerm.trim()) {
      console.log(`🔍 Busca: "${searchTerm}" → API retornou ${data.books.length} livros`);
      console.log(`📡 Termo enviado para API: "${expandedSearch}"`);
    }

    // Se não há termo de busca, retornar todos os livros da API
    if (!searchTerm.trim()) return data.books;

    const search = searchTerm.toLowerCase().trim();

    // A API já fez busca accent-insensitive, mas vamos adicionar filtro para casos específicos
    return data.books.filter((book) => {
      // A API já filtrou a maioria dos casos, então aceitamos tudo que veio dela
      let matchesAPI = true;

      // Casos específicos para "Joana"/"Joanna" - termos parciais e completos
      if (
        search === "joana" ||
        search === "joanna" ||
        search === "joana de angelis" ||
        search === "joanna de angelis" ||
        search === "joana de ângelis" ||
        search === "joanna de ângelis" ||
        search.includes("joana") ||
        search.includes("joanna")
      ) {
        const mediumName = book.medium.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const authorName = book.author.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const titleName = book.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        // Se o usuário digitou "joana", aceitar tanto "joana" quanto "joanna" nos resultados
        if (search === "joana") {
          return (
            mediumName.includes("joana") ||
            mediumName.includes("joanna") ||
            authorName.includes("joana") ||
            authorName.includes("joanna") ||
            titleName.includes("joana") ||
            titleName.includes("joanna")
          );
        }
        
        // Para outros casos, busca normal
        return (
          mediumName.includes("joana") ||
          mediumName.includes("joanna") ||
          authorName.includes("joana") ||
          authorName.includes("joanna") ||
          titleName.includes("joana") ||
          titleName.includes("joanna")
        );
      }

      // Caso específico para "angelis"
      if (search.includes("angelis")) {
        const mediumName = book.medium.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const authorName = book.author.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        return (
          mediumName.includes("angelis") ||
          authorName.includes("angelis")
        );
      }

      return matchesAPI;
    });
  }, [data?.books, searchTerm]);

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
        <div className="text-xs text-green-500">
          ({discountPercent.toFixed(0)}% de desconto)
        </div>
      </div>
    );
  };

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <div className="space-y-8">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="relative flex items-center h-16 rounded-full border-2 shadow-sm">
              <Search className="absolute left-6 h-8 w-8 text-muted-foreground" />
              <Input
                className="pl-16 pr-6 h-full w-full text-xl rounded-full border-none"
                placeholder="Digite aqui para buscar livros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: "1.25rem" }}
              />
            </div>
          </div>
        </div>

        <div className="text-center p-6">
          <div className="text-red-500 text-xl mb-4">
            Erro ao carregar livros
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Barra de Busca Responsiva */}
      <div className="max-w-3xl mx-auto px-2 sm:px-0">
        <div className="relative">
          <div className="relative flex items-center h-12 sm:h-16 rounded-full border-2 shadow-sm hover:shadow-md focus-within:shadow-md">
            <Search className="absolute left-4 sm:left-6 h-5 w-5 sm:h-8 sm:w-8 text-muted-foreground" />
            <Input
              className="pl-12 sm:pl-16 pr-4 sm:pr-6 h-full w-full text-base sm:text-xl rounded-full border-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400"
              placeholder="Buscar livros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <p className="mt-2 text-center text-muted-foreground text-sm sm:text-lg">
            Busque por título, autor, código FLE, editora ou assunto
          </p>
        </div>
      </div>

      {/* Layout Desktop - Tabela */}
      <div className="hidden lg:block rounded-lg border-2">
        <div className="overflow-x-auto" style={{ width: "100%" }}>
          <ScrollArea className="h-[calc(100vh-400px)]">
            <div className="min-w-[1100px]">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="font-bold text-xl text-black py-4 w-24">
                      Código FLE
                    </TableHead>
                    <TableHead className="font-bold text-xl text-black py-4 w-28">
                      Local
                    </TableHead>
                    <TableHead className="font-bold text-xl text-black py-4 w-64">
                      Título
                    </TableHead>
                    <TableHead className="font-bold text-xl text-black py-4 w-40">
                      Autor
                    </TableHead>
                    <TableHead className="font-bold text-xl text-black py-4 w-40">
                      Médium
                    </TableHead>
                    <TableHead className="font-bold text-xl text-black py-4 w-40">
                      Editora
                    </TableHead>
                    <TableHead className="font-bold text-xl text-black py-4 w-40">
                      Assunto
                    </TableHead>
                    <TableHead className="font-bold text-xl text-black text-right py-4 w-20">
                      Qtd.
                    </TableHead>
                    <TableHead className="font-bold text-xl text-black text-right py-4 w-32">
                      Preço Normal
                    </TableHead>
                    <TableHead className="font-bold text-xl text-black text-right py-4 w-32">
                      Preço Feira
                    </TableHead>
                    <TableHead className="font-bold text-xl text-black text-right py-4 w-32">
                      Economia
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 10 }).map((_, index) => (
                      <TableRow key={index} className="bg-white">
                        {Array.from({ length: 11 }).map((_, cellIndex) => (
                          <TableCell key={cellIndex} className="py-3">
                            <div className="h-4 bg-gray-200 rounded animate-pulse" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filteredBooks.length ? (
                    filteredBooks.map((book, index) => (
                      <TableRow
                        key={book.id}
                        className={`
                          text-base hover:bg-blue-50 
                          ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        `}
                      >
                        <TableCell className="py-3">{book.codFle}</TableCell>
                        <TableCell className="py-3">{book.location}</TableCell>
                        <TableCell className="py-3 font-medium">
                          {book.title}
                        </TableCell>
                        <TableCell className="py-3">{book.author}</TableCell>
                        <TableCell className="py-3">{book.medium}</TableCell>
                        <TableCell className="py-3">{book.publisher}</TableCell>
                        <TableCell className="py-3">{book.subject}</TableCell>
                        <TableCell className="py-3 text-right">
                          <span
                            className={
                              book.quantity === 0
                                ? "text-red-500"
                                : "text-green-600"
                            }
                          >
                            {book.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 text-right font-medium text-gray-600">
                          {Number(book.price) > 0
                            ? new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(Number(book.price))
                            : "Não informado"}
                        </TableCell>
                        <TableCell className="py-3 text-right font-medium text-blue-600">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(Number(book.coverPrice))}
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          {calculateDiscount(
                            Number(book.price),
                            Number(book.coverPrice)
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={11}
                        className="text-center py-8 text-xl"
                      >
                        {searchTerm
                          ? "Nenhum livro encontrado para esta busca"
                          : "Carregando livros..."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>

      {/* Layout Mobile/Tablet - Cards */}
      <div className="block lg:hidden">
        <ScrollArea className="h-[calc(100vh-350px)]">
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg border p-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))
            ) : filteredBooks.length ? (
              filteredBooks.map((book, index) => (
                <div
                  key={book.id}
                  className={`rounded-lg border p-3 sm:p-4 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <div className="space-y-2">
                    {/* Linha 1: Título e Código */}
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-sm sm:text-base flex-1 pr-2">
                        {book.title}
                      </h3>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {book.codFle}
                      </span>
                    </div>
                    
                    {/* Linha 2: Autor e Médium */}
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Autor:</span> {book.author}
                      {book.medium && book.medium !== book.author && (
                        <span className="ml-2">
                          <span className="font-medium">Médium:</span> {book.medium}
                        </span>
                      )}
                    </div>
                    
                    {/* Linha 3: Editora e Local */}
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Editora:</span> {book.publisher}
                      <span className="ml-2">
                        <span className="font-medium">Local:</span> {book.location}
                      </span>
                    </div>
                    
                    {/* Linha 4: Assunto */}
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Assunto:</span> {book.subject}
                    </div>
                    
                    {/* Linha 5: Preços e Quantidade */}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-xs text-gray-500">Quantidade</div>
                          <div
                            className={`font-bold ${
                              book.quantity === 0 ? "text-red-500" : "text-green-600"
                            }`}
                          >
                            {book.quantity}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Preço Feira</div>
                          <div className="font-medium text-blue-600">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(Number(book.coverPrice))}
                          </div>
                        </div>
                        {Number(book.price) > 0 && (
                          <div>
                            <div className="text-xs text-gray-500">Preço Normal</div>
                            <div className="text-sm text-gray-600">
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(Number(book.price))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {Number(book.price) > Number(book.coverPrice) && (
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Economia</div>
                          {calculateDiscount(Number(book.price), Number(book.coverPrice))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-lg text-gray-500">
                  {searchTerm
                    ? "Nenhum livro encontrado para esta busca"
                    : "Carregando livros..."}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Contador de Resultados e Paginação */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm sm:text-lg text-muted-foreground text-center sm:text-left">
          {data?.pagination ? (
            <>
              {searchTerm && filteredBooks.length > 0
                ? `Encontrados ${filteredBooks.length} livros`
                : `Total de ${data.pagination.total} livros disponíveis`}
              {data.pagination.totalPages > 1 && (
                <span className="block sm:inline sm:ml-2 text-xs sm:text-sm">
                  (Página {data.pagination.page} de {data.pagination.totalPages})
                </span>
              )}
            </>
          ) : (
            "Carregando..."
          )}
        </div>

        {/* Controles de paginação */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={!data.pagination.hasPrev || isLoading}
              className="text-xs sm:text-sm"
            >
              Anterior
            </Button>
            <span className="text-xs sm:text-sm px-2 sm:px-4">
              {page} de {data.pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={!data.pagination.hasNext || isLoading}
              className="text-xs sm:text-sm"
            >
              Próxima
            </Button>
          </div>
        )}
      </div>

      {/* Instrução de navegação */}
      <div className="text-center text-xs sm:text-sm text-muted-foreground">
        <p className="hidden lg:block">
          Role a tabela para a direita ou esquerda para ver mais informações
        </p>
        <p className="block lg:hidden">
          Toque em um livro para ver todos os detalhes
        </p>
      </div>
    </div>
  );
}
