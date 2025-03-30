//app/(portal)/inventory/_components/inventory-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface Book {
  id: string;
  codFle: string;
  barCode?: string;
  title: string;
  author: string;
  medium: string;
  publisher: string;
  distributor: string;
  subject: string;
  quantity: number;
  coverPrice: number;
  price: number;
  location: string;
}

interface InventoryItem {
  bookId: string;
  book: Book;
  quantity: number;
  barcodeUsed: string;
}

interface InventoryContextType {
  currentBatch: string;
  setCurrentBatch: (batch: string) => void;
  inventoryItems: InventoryItem[];
  addInventoryItem: (barcode: string, quantity: number) => Promise<boolean>;
  updateItemQuantity: (bookId: string, quantity: number) => void;
  removeInventoryItem: (bookId: string) => void;
  isSaving: boolean;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
  saveBatch: () => Promise<boolean>;
  resetInventory: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [currentBatch, setCurrentBatch] = useState<string>("");
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  // Carregar dados do localStorage quando o componente é montado
  useEffect(() => {
    const savedBatch = localStorage.getItem("inventoryBatch");
    if (savedBatch) {
      setCurrentBatch(savedBatch);
    }

    const savedItems = localStorage.getItem("inventoryItems");
    if (savedItems) {
      try {
        setInventoryItems(JSON.parse(savedItems));
      } catch (error) {
        console.error("Erro ao carregar itens do localStorage:", error);
      }
    }
  }, []);

  // Salvar dados no localStorage quando eles mudam
  useEffect(() => {
    if (currentBatch) {
      localStorage.setItem("inventoryBatch", currentBatch);
    }

    if (inventoryItems.length > 0) {
      localStorage.setItem("inventoryItems", JSON.stringify(inventoryItems));
    }
  }, [currentBatch, inventoryItems]);

  const addInventoryItem = async (
    barcode: string,
    quantity: number
  ): Promise<boolean> => {
    if (!currentBatch) {
      toast({
        title: "Lote não selecionado",
        description: "Selecione um lote antes de adicionar itens",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Primeiro tenta buscar da API de livros normais
      const response = await axios.get(`/api/books/barcode/${barcode}`);
      const book = response.data;

      // Verificar se o livro já está no inventário
      const existingIndex = inventoryItems.findIndex(
        (item) => item.bookId === book.id
      );

      if (existingIndex >= 0) {
        // Atualizar a quantidade se o livro já existe
        const updatedItems = [...inventoryItems];
        updatedItems[existingIndex].quantity += quantity;
        setInventoryItems(updatedItems);

        toast({
          title: "Quantidade atualizada",
          description: `${book.title} - Nova quantidade: ${updatedItems[existingIndex].quantity}`,
        });
      } else {
        // Adicionar novo item ao inventário
        setInventoryItems((prev) => [
          ...prev,
          {
            bookId: book.id,
            book: {
              ...book,
              coverPrice: Number(book.coverPrice),
              price: Number(book.price),
            },
            quantity,
            barcodeUsed: barcode,
          },
        ]);

        toast({
          title: "Item adicionado",
          description: `${book.title} - Quantidade: ${quantity}`,
        });
      }

      return true;
    } catch (error) {
      console.error("Erro ao adicionar item:", error);

      if (axios.isAxiosError(error) && error.response?.status === 404) {
        toast({
          title: "Livro não encontrado",
          description: `Código de barras não reconhecido: ${barcode}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao processar",
          description: "Ocorreu um erro ao processar o código de barras",
          variant: "destructive",
        });
      }

      return false;
    }
  };

  const updateItemQuantity = (bookId: string, quantity: number) => {
    setInventoryItems((prev) =>
      prev.map((item) =>
        item.bookId === bookId ? { ...item, quantity } : item
      )
    );
  };

  const removeInventoryItem = (bookId: string) => {
    setInventoryItems((prev) => prev.filter((item) => item.bookId !== bookId));
  };

  const saveBatch = async (): Promise<boolean> => {
    if (!currentBatch) {
      toast({
        title: "Erro",
        description: "Selecione um lote antes de salvar",
        variant: "destructive",
      });
      return false;
    }

    if (inventoryItems.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item antes de salvar",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsSaving(true);

      // Enviar dados para a API
      await axios.post("/api/inventory", {
        batchName: currentBatch,
        items: inventoryItems.map((item) => ({
          bookId: item.bookId,
          quantity: item.quantity,
          barcodeUsed: item.barcodeUsed,
        })),
      });

      toast({
        title: "Lote salvo com sucesso",
        description: `Foram salvos ${inventoryItems.length} itens no lote ${currentBatch}`,
      });

      // Limpar dados após salvar com sucesso
      setInventoryItems([]);
      localStorage.removeItem("inventoryItems");

      return true;
    } catch (error) {
      console.error("Erro ao salvar lote:", error);

      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o lote de inventário",
        variant: "destructive",
      });

      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const resetInventory = () => {
    setInventoryItems([]);
    localStorage.removeItem("inventoryItems");
    toast({
      title: "Inventário limpo",
      description: "Todos os itens foram removidos do inventário atual",
    });
  };

  const value: InventoryContextType = {
    currentBatch,
    setCurrentBatch,
    inventoryItems,
    addInventoryItem,
    updateItemQuantity,
    removeInventoryItem,
    saveBatch,
    isSaving,
    isScanning,
    setIsScanning,
    resetInventory,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}
