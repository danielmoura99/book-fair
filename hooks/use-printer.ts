/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/use-printer.ts
"use client";

import { useState, useEffect } from "react";
import {
  detectPrinterAvailability,
  isWebSerialSupported,
  SaleData,
} from "@/lib/printer-utils";
import { Decimal } from "@prisma/client/runtime/library";

// Tipos compatíveis com o sistema existente
interface CartItemForPrint {
  bookId: string;
  quantity: number;
  book: {
    title: string;
    author: string;
    codFle: string;
    coverPrice: Decimal; // Manter compatibilidade com Decimal
  };
}

interface PaymentForPrint {
  method: string;
  amount: number;
  change?: number;
}

export function usePrinter() {
  const [isPrinterAvailable, setIsPrinterAvailable] = useState<boolean | null>(
    null
  );
  const [isSupported, setIsSupported] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Verificar suporte do navegador
  useEffect(() => {
    setIsSupported(isWebSerialSupported());
  }, []);

  // Verificar disponibilidade da impressora
  const checkPrinterAvailability = async () => {
    if (!isSupported) {
      setIsPrinterAvailable(false);
      return false;
    }

    try {
      setIsChecking(true);
      const available = await detectPrinterAvailability();
      setIsPrinterAvailable(available);
      return available;
    } catch (error) {
      console.error("Erro ao verificar impressora:", error);
      setIsPrinterAvailable(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  // Verificar se deve mostrar dialog de impressão
  const shouldShowPrintDialog = async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn("Navegador não suporta Web Serial API");
      return false;
    }

    // Se já verificamos antes, usar o resultado cached
    if (isPrinterAvailable !== null) {
      return isPrinterAvailable;
    }

    // Verificar pela primeira vez
    const available = await checkPrinterAvailability();
    console.log("🖨️ Resultado verificação impressora:", available);
    return available;
  };

  // Preparar dados da venda para impressão
  const prepareSaleData = (
    cartItems: CartItemForPrint[],
    totalAmount: number,
    operatorName: string,
    payments: PaymentForPrint[],
    sequentialId?: number
  ): SaleData => {
    // Incluir informação da estação nos dados de impressão
    const stationName =
      typeof window !== "undefined"
        ? localStorage.getItem("stationName") || "Estação não identificada"
        : "Estação não identificada";

    // Calcular total de desconto baseado na diferença entre preço de capa e preço de venda
    const totalDiscount = cartItems.reduce((total, item) => {
      const coverPrice = Number(item.book.coverPrice);
      // Assumindo que existe um campo 'price' no book que representa o preço de venda
      // Se não existir, o desconto será 0
      const salePrice = (item.book as any).price
        ? Number((item.book as any).price)
        : coverPrice;
      const discount =
        salePrice > coverPrice ? (salePrice - coverPrice) * item.quantity : 0;
      return total + discount;
    }, 0);

    return {
      operatorName: `${operatorName} (${stationName})`,
      totalAmount,
      totalDiscount: totalDiscount > 0 ? totalDiscount : undefined,
      items: cartItems.map((item) => ({
        title: item.book.title,
        author: item.book.author,
        codFle: item.book.codFle,
        quantity: item.quantity,
        unitPrice: Number(item.book.coverPrice), // Converter Decimal para number
        totalPrice: Number(item.book.coverPrice) * item.quantity,
      })),
      payments,
      saleDate: new Date(),
      sequentialId,
    };
  };

  return {
    isPrinterAvailable,
    isSupported,
    isChecking,
    checkPrinterAvailability,
    shouldShowPrintDialog,
    prepareSaleData,
  };
}
