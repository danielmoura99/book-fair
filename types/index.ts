import {
  Book as PrismaBook,
  Transaction as PrismaTransaction,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

// Tipos base do Prisma
export interface Book extends PrismaBook {
  coverPrice: Decimal;
}

// Interface para dados serializados (quando os dados vêm do servidor)
export interface SerializedBook extends Omit<Book, "coverPrice"> {
  coverPrice: number;
}

// Interface para o formulário
export interface BookFormData {
  codFle: string;
  barCode?: string;
  location: string;
  quantity: number;
  coverPrice: number;
  title: string;
  author: string;
  medium: string;
  publisher: string;
  subject: string;
}

// Interfaces para Transações
export interface TransactionWithBook extends PrismaTransaction {
  book: Book;
}

export interface SerializedTransaction
  extends Omit<PrismaTransaction, "totalAmount"> {
  totalAmount: number;
  book: SerializedBook;
}
