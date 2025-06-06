import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), "MM/dd/yyyy HH:mm");
  } catch (error) {
    return "Invalid Date";
  }
}
