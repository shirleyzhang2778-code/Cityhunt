import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function wechatToEmail(wechatId: string): string {
  return `${wechatId.trim().toLowerCase()}@app.internal`;
}

export function isEmptyField(value: string | null | undefined): boolean {
  return value == null || value.trim() === "";
}
