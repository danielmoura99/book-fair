/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/inventory-logger.ts
import { prisma } from "@/lib/prisma";

export type LogType = "CREATE" | "UPDATE" | "DELETE";

interface LogData {
  type: LogType;
  bookId: string;
  bookCodFle: string;
  bookTitle: string;
  operatorName?: string;
  previousData?: any;
  newData: any;
  notes?: string;
}

export async function logInventoryActivity(data: LogData) {
  try {
    await prisma.inventoryLog.create({
      data: {
        type: data.type,
        bookId: data.bookId,
        bookCodFle: data.bookCodFle,
        bookTitle: data.bookTitle,
        operatorName: data.operatorName || "Sistema",
        previousData: data.previousData || null,
        newData: data.newData,
        notes: data.notes,
      },
    });

    console.log(`Log registrado: ${data.type} - ${data.bookTitle}`);
    return true;
  } catch (error) {
    console.error("Erro ao registrar log:", error);
    return false;
  }
}
