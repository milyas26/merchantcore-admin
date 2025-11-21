import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export cookie helpers for convenience
export * from "./cookies"
// Re-export slug helpers
export * from "./slugUtils"
