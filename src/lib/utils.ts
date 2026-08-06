import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines Tailwind classes safely. clsx handles the conditional values,
 * tailwind-merge resolves conflicts so a class passed in by the caller beats
 * the component's own default rather than losing to stylesheet order.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** "charizard" and "ho-oh" both need to read as names, not slugs. */
export function titleCase(slug: string): string {
  return slug
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map((word) => (word[0] ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');
}

/** Catalogue numbers are four digits wide so a column of them stays aligned. */
export function dexNumber(id: number): string {
  return String(id).padStart(4, '0');
}
