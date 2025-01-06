"use client";

import { Book } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useBooks() {
  return useQuery<Book[]>({
    queryKey: ["books"],
    queryFn: async () => {
      const response = await axios.get("/api/books");
      return response.data;
    },
  });
}
