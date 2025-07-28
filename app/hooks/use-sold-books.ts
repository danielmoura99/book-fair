//app/hooks/use-sold-books.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { SerializedBook } from "@/types";

interface UseSoldBooksSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface SoldBooksSearchResponse {
  books: SerializedBook[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function useSoldBooksSearch(params: UseSoldBooksSearchParams = {}) {
  const { page = 1, limit = 50, search = "", sortBy = "title", sortOrder = "asc" } = params;

  return useQuery<SoldBooksSearchResponse>({
    queryKey: ["sold-books-search", page, limit, search, sortBy, sortOrder],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        sortBy,
        sortOrder,
      });

      const response = await axios.get(`/api/books/sold/search?${searchParams}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // Cache por 2 minutos (menor que books normais pois muda com vendas)
    gcTime: 5 * 60 * 1000, // Manter no cache por 5 minutos
  });
}