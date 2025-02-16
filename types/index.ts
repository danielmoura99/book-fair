import {
  Book as PrismaBook,
  Transaction as PrismaTransaction,
  TransactionType,
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

export interface TransactionWithBook extends PrismaTransaction {
  book: Book;
  type: TransactionType;
  returnedBookId: string | null;
}

export interface SerializedTransaction
  extends Omit<
    PrismaTransaction,
    "totalAmount" | "returnedBookId" | "priceDifference"
  > {
  totalAmount: number;
  book: SerializedBook;
  type: TransactionType;
  returnedBookId: string | null;
  priceDifference: number | null;
  operatorName: string;
  paymentMethod: string;
}

export interface ExchangeFormData {
  returnedBookId: string;
  newBookId: string;
  paymentMethod?: string;
  type: TransactionType;
  priceDifference?: number;
}
