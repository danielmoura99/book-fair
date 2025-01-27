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
