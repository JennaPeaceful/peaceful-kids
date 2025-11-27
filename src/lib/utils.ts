import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCategoryName(category: string | null): string {
  if (!category) return '';
  if (category.toLowerCase() === 'kid') return 'Kids';
  if (category.toLowerCase() === 'adult') return 'Adults';
  return category;
}
