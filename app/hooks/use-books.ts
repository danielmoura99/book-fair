"use client";

import { Book } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { SerializedBook } from "@/types";

export function useBooks() {
  return useQuery<Book[]>({
    queryKey: ["books"],
    queryFn: async () => {
      const response = await axios.get("/api/books");
      return response.data;
    },
  });
}

interface UseBooksSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface BooksSearchResponse {
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

export function useBooksSearch(params: UseBooksSearchParams = {}) {
  const { page = 1, limit = 50, search = "", sortBy = "title", sortOrder = "asc" } = params;

  return useQuery<BooksSearchResponse>({
    queryKey: ["books-search", page, limit, search, sortBy, sortOrder],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        sortBy,
        sortOrder,
      });

      const response = await axios.get(`/api/books/search?${searchParams}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    gcTime: 10 * 60 * 1000, // Manter no cache por 10 minutos
  });
}
