import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

export function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("pt-BR");
}

export function calculatePriceDifference(priceA: number, priceB: number) {
  return Math.abs(priceA - priceB);
}

export function serializeDecimalFields<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeDecimalFields) as unknown as T;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {};

  for (const [key, value] of Object.entries(obj)) {
    // Verificar se é um Decimal do Prisma
    if (
      value !== null &&
      typeof value === "object" &&
      "s" in value &&
      "e" in value
    ) {
      result[key] = Number(value);
    } else if (typeof value === "object") {
      result[key] = serializeDecimalFields(value);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
