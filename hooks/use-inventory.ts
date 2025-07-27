"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface InventoryBook {
  id: string;
  codFle: string;
  barCode?: string | null;
  location: string;
  quantity: number;
  coverPrice: number;
  price: number;
  title: string;
  author: string;
  medium: string;
  publisher: string;
  distributor: string;
  subject: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UseInventorySearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filterZeroStock?: boolean;
  publisher?: string;
  distributor?: string;
}

interface InventorySearchResponse {
  books: InventoryBook[];
  stats?: {
    totalBooks: number;
    totalQuantity: number;
    inStock: number;
    publishers: number;
    distributors: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function useInventorySearch(params: UseInventorySearchParams = {}) {
  const { 
    page = 1, 
    limit = 50, 
    search = "", 
    sortBy = "quantity", 
    sortOrder = "desc",
    filterZeroStock = false,
    publisher,
    distributor
  } = params;

  return useQuery<InventorySearchResponse>({
    queryKey: ["inventory-search", page, limit, search, sortBy, sortOrder, filterZeroStock, publisher, distributor],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        sortBy,
        sortOrder,
      });

      if (filterZeroStock) {
        searchParams.append("filterZeroStock", "true");
      }

      if (publisher) {
        searchParams.append("publisher", publisher);
      }

      if (distributor) {
        searchParams.append("distributor", distributor);
      }

      const response = await axios.get(`/api/inventory/search?${searchParams}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // Cache por 2 minutos
    gcTime: 5 * 60 * 1000, // Manter no cache por 5 minutos
  });
}

// Hook para busca rápida (autocompletar)
export function useInventoryQuickSearch(searchTerm: string) {
  return useQuery<InventoryBook[]>({
    queryKey: ["inventory-quick-search", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      
      const response = await axios.get(`/api/inventory/search?search=${encodeURIComponent(searchTerm)}&limit=10`);
      return response.data.books;
    },
    enabled: searchTerm.length >= 2,
    staleTime: 30 * 1000, // Cache por 30 segundos
    gcTime: 60 * 1000, // Manter no cache por 1 minuto
  });
}