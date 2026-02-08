import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for conditionally joining class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}