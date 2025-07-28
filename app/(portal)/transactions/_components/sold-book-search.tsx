/* eslint-disable @typescript-eslint/no-unused-vars */
//app/(portal)/transactions/_components/sold-book-search.tsx
"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Check } from "lucide-react";
import { useSoldBooksSearch } from "@/app/hooks/use-sold-books";
import { useDebounce } from "@/hooks/use-debounce";
import { SerializedBook } from "@/types";
import { formatPrice } from "@/lib/utils";

interface SoldBookSearchProps {
  onSelectBook: (book: SerializedBook) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
}

export function SoldBookSearch({
  onSelectBook,
  disabled,
  placeholder = "Digite para buscar livros vendidos...",
  label = "Buscar livro vendido",
}: SoldBookSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<SerializedBook | null>(null);

  // Debounce da busca para evitar requests excessivos
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Expandir busca da API para incluir variações de nomes (igual ao terminal)
  const expandedSearch = useMemo(() => {
    if (!debouncedSearch.trim()) return "";

    const search = debouncedSearch.toLowerCase().trim();

    // Se a busca contém variações conhecidas, expandir para buscar as alternativas também
    if (search.includes("joana")) {
      return "joanna"; // Buscar pela grafia correta na API
    }
    if (search.includes("angelis") && !search.includes("ângelis")) {
      return "ângelis"; // Buscar pela grafia correta na API
    }

    return debouncedSearch;
  }, [debouncedSearch]);

  const { data, isLoading } = useSoldBooksSearch({
    page: 1,
    limit: 50, // Limite adequado para dropdown
    search: expandedSearch,
    sortBy: "title",
    sortOrder: "asc",
  });

  // Filtro adicional no frontend para tratar variações de nomes (igual ao terminal)
  const filteredBooks = useMemo(() => {
    if (!data?.books) return [];

    // Se não há termo de busca, retornar apenas alguns livros para não sobrecarregar
    if (!searchTerm.trim()) return data.books.slice(0, 20);

    const search = searchTerm.toLowerCase().trim();

    // Variações comuns para tratar no sistema de busca
    const nameVariations: { [key: string]: string[] } = {
      joana: ["joanna"],
      joanna: ["joana"],
      angelis: ["ângelis", "angelis", "ângelis"],
      ângelis: ["angelis", "ângelis", "angelis"],
    };

    return data.books.filter((book) => {
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
  }, [data?.books, searchTerm]);

  const handleSelectBook = (book: SerializedBook) => {
    setSelectedBook(book);
    onSelectBook(book);
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      {/* Campo de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(e.target.value.length > 0);
          }}
          onFocus={() => setIsOpen(searchTerm.length > 0)}
          className="pl-10 text-sm"
          disabled={disabled}
        />
        {selectedBook && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Check className="h-4 w-4 text-green-600" />
          </div>
        )}
      </div>

      {/* Livro selecionado */}
      {selectedBook && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="text-sm font-medium text-green-800">
            {selectedBook.title}
          </div>
          <div className="text-xs text-green-600">
            {selectedBook.author} • {selectedBook.codFle} •{" "}
            {formatPrice(selectedBook.coverPrice)}
          </div>
        </div>
      )}

      {/* Lista de resultados */}
      {isOpen && (
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 z-50 bg-white border rounded-md shadow-lg">
            <ScrollArea className="h-[200px] sm:h-[300px]">
              <div className="p-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="text-sm text-muted-foreground">
                      Buscando livros vendidos...
                    </div>
                  </div>
                ) : filteredBooks.length > 0 ? (
                  <div className="space-y-1">
                    {filteredBooks.map((book) => (
                      <Button
                        key={book.id}
                        variant="ghost"
                        className="w-full justify-start h-auto p-2 text-left"
                        onClick={() => handleSelectBook(book)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {book.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {book.author} • {book.codFle}
                            </div>
                          </div>
                          <div className="flex flex-col items-end ml-2">
                            <div className="text-sm font-medium text-blue-600">
                              {formatPrice(book.coverPrice)}
                            </div>
                            <div className="text-xs text-green-600">
                              Vendido
                            </div>
                          </div>
                          <Check className="h-4 w-4 ml-2 text-muted-foreground" />
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : searchTerm.trim().length > 0 ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="text-sm text-muted-foreground">
                      Nenhum livro vendido encontrado
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-4">
                    <div className="text-sm text-muted-foreground">
                      Digite para buscar livros vendidos
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Overlay para fechar quando clicar fora */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
