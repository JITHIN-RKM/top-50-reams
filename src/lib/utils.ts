import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIST(dateStr: string | Date, options?: Intl.DateTimeFormatOptions) {
  let d: Date;
  if (typeof dateStr === 'string') {
    // Ensure string is treated as UTC if no timezone is provided by Supabase
    d = new Date(dateStr.includes('Z') || dateStr.includes('+') ? dateStr : dateStr + 'Z');
  } else {
    d = dateStr;
  }
  
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    ...options
  }).format(d);
}
