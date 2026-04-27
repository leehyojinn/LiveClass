import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(price);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
}

export function formatDateRange(startDate: string, endDate: string): string {
  return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
}

export function getCapacityStatus(current: number, max: number) {
  const ratio = current / max;
  const remaining = max - current;

  if (remaining === 0) return { label: "정원 마감", color: "red", isFull: true, isAlmostFull: false };
  if (ratio >= 0.9) return { label: `잔여 ${remaining}석`, color: "orange", isFull: false, isAlmostFull: true };
  if (ratio >= 0.7) return { label: `잔여 ${remaining}석`, color: "yellow", isFull: false, isAlmostFull: false };
  return { label: `잔여 ${remaining}석`, color: "green", isFull: false, isAlmostFull: false };
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("02")) {
    if (digits.length <= 5) return digits;
    if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }
  if (digits.length <= 7) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}
