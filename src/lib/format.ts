import type { Money } from "@/domain";

export function formatMoney(money: Money): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: money.currency,
    maximumFractionDigits: 0,
  }).format(money.amountMinor / 100);
}

export function formatTime(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(value));
}

export function toDateTimeLocal(value: string): string {
  return value.slice(0, 16);
}
