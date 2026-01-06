import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Scrolls to the top of the page with smooth animatione
 */
export function scrollToTop(smooth: boolean = true): void {
  window.scrollTo({ 
    top: 0, 
    behavior: smooth ? 'smooth' : 'auto' 
  });
}