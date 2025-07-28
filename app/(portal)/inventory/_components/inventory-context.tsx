//app/(portal)/inventory/_components/inventory-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

// Definir interfaces usando apenas InventoryBook
interface InventoryBook {
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

interface InventoryUpdate {
  bookId: string;
  book: InventoryBook;
  newQuantity: number;
  previousQuantity: number;
  timestamp: number;
}

interface InventoryContextType {
  pendingUpdates: InventoryUpdate[];
  addUpdate: (book: InventoryBook, quantity: number) => void;
  removeUpdate: (bookId: string) => void;
  isSaving: boolean;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
  saveUpdates: () => Promise<boolean>;
  resetUpdates: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [pendingUpdates, setPendingUpdates] = useState<InventoryUpdate[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  // Carregar dados do localStorage quando o componente é montado
  useEffect(() => {
    const savedUpdates = localStorage.getItem("inventoryUpdates");
    if (savedUpdates) {
      try {
        setPendingUpdates(JSON.parse(savedUpdates));
      } catch (error) {
        console.error("Erro ao carregar atualizações do localStorage:", error);
      }
    }
  }, []);

  // Salvar dados no localStorage quando eles mudam
  useEffect(() => {
    if (pendingUpdates.length > 0) {
      localStorage.setItem("inventoryUpdates", JSON.stringify(pendingUpdates));
    }
  }, [pendingUpdates]);

  const addUpdate = (book: InventoryBook, newQuantity: number) => {
    setPendingUpdates((prev) => {
      // Verificar se já existe uma atualização para esse livro
      const existingIndex = prev.findIndex((item) => item.bookId === book.id);

      if (existingIndex >= 0) {
        // Atualizar a quantidade se o livro já existe na lista de atualizações
        // Somando a nova quantidade com a quantidade que já está sendo adicionada
        const updatedItems = [...prev];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          newQuantity:
            updatedItems[existingIndex].previousQuantity + newQuantity,
          timestamp: Date.now(),
        };
        return updatedItems;
      } else {
        // Adicionar nova atualização
        // Somando a quantidade atual do livro com a nova quantidade
        return [
          ...prev,
          {
            bookId: book.id,
            book,
            newQuantity: book.quantity + newQuantity,
            previousQuantity: book.quantity,
            timestamp: Date.now(),
          },
        ];
      }
    });

    toast({
      title: "Atualização adicionada",
      description: `${book.title} - Adicionado ${newQuantity} ao estoque atual`,
    });
  };

  const removeUpdate = (bookId: string) => {
    setPendingUpdates((prev) => prev.filter((item) => item.bookId !== bookId));
  };

  const saveUpdates = async (): Promise<boolean> => {
    if (pendingUpdates.length === 0) {
      toast({
        title: "Aviso",
        description: "Não há atualizações para salvar",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsSaving(true);

      // Enviar atualizações para a API
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const response = await axios.post("/api/inventory/update-quantities", {
        updates: pendingUpdates.map((update) => ({
          bookId: update.bookId,
          quantity: update.newQuantity,
        })),
      });

      toast({
        title: "Alterações salvas",
        description: `${pendingUpdates.length} atualizações de quantidade salvas com sucesso!`,
      });

      // Limpar atualizações após salvar com sucesso
      setPendingUpdates([]);
      localStorage.removeItem("inventoryUpdates");

      return true;
    } catch (error) {
      console.error("Erro ao salvar atualizações:", error);

      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as atualizações de inventário",
        variant: "destructive",
      });

      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const resetUpdates = () => {
    setPendingUpdates([]);
    localStorage.removeItem("inventoryUpdates");

    toast({
      title: "Atualizações descartadas",
      description: "Todas as atualizações pendentes foram removidas",
    });
  };

  const value: InventoryContextType = {
    pendingUpdates,
    addUpdate,
    removeUpdate,
    saveUpdates,
    isSaving,
    isScanning,
    setIsScanning,
    resetUpdates,
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
