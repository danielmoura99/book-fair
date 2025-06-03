import {
  Book as PrismaBook,
  Transaction as PrismaTransaction,
  TransactionType,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

// Tipos base do Prisma
export interface Book extends PrismaBook {
  coverPrice: Decimal;
  price: Decimal;
}

// Interface para dados serializados (quando os dados vêm do servidor)
export interface SerializedBook extends Omit<Book, "coverPrice" | "price"> {
  coverPrice: number;
  price: number;
  distributor: string;
}

// Interface para o formulário
export interface BookFormData {
  codFle: string;
  barCode?: string;
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
}

export interface TransactionWithBook extends PrismaTransaction {
  sequentialId: number;
  saleGroupId: string | null;
  book: Book;
  type: TransactionType;
  returnedBookId: string | null;
}

export interface SerializedTransaction
  extends Omit<
    PrismaTransaction,
    "totalAmount" | "returnedBookId" | "priceDifference"
  > {
  sequentialId: number;
  saleGroupId: string | null;
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

// Tipo para CashRegister serializado
export interface SerializedCashRegister {
  id: string;
  openingDate: Date;
  closingDate: Date | null;
  initialAmount: number; // Era Decimal, agora é number
  finalAmount: number | null; // Era Decimal, agora é number
  status: "OPEN" | "CLOSED";
  createdAt: Date;
  updatedAt: Date;
  notes: string | null;
  transactions: SerializedTransaction[];
  withdrawals: SerializedCashWithdrawal[];
}

// Tipo para CashWithdrawal serializado
export interface SerializedCashWithdrawal {
  id: string;
  amount: number; // Era Decimal, agora é number
  reason: string;
  operatorName: string;
  cashRegisterId: string;
  createdAt: Date;
}
