import type { Book, Genre } from "./types";

export const GENRE_LABEL: Record<Genre, string> = {
  fiction: "Fiction", scifi: "Sci-fi", fantasy: "Fantasy", mystery: "Mystery",
  nonfiction: "Nonfiction", memoir: "Memoir", other: "Other",
};

/** A spine's height for its page count: 150 pages or fewer is the shortest, 700 or more the tallest. */
export function spineHeight(pages: number, min: number, max: number): number {
  const t = Math.min(1, Math.max(0, (pages - 150) / (700 - 150)));
  return Math.round(min + t * (max - min));
}

/** Splits the books into shelves of at most `perShelf`, keeping them in the order they were read. */
export function shelves<T>(items: T[], perShelf: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += perShelf) out.push(items.slice(i, i + perShelf));
  return out;
}

export function stats(books: Book[]) {
  const pages = books.reduce((n, b) => n + b.pages, 0);
  const longest = books.reduce((a, b) => (b.pages > a.pages ? b : a), books[0]);
  const counts = new Map<Genre, number>();
  for (const b of books) counts.set(b.genre, (counts.get(b.genre) ?? 0) + 1);
  const genres = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return { count: books.length, pages, longest, genres, fiveStars: books.filter((b) => b.rating === 5) };
}

export const fmt = (n: number) => n.toLocaleString("en-US");

/** "1 book", "20 books". */
export const plural = (n: number, word: string) => `${fmt(n)} ${word}${n === 1 ? "" : "s"}`;

/** Shortens text to `max` characters at a word break, with an ellipsis. */
export function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,:;(#-]+$/, "")}\u2026`;
}

/** A Goodreads title without its series note: "The Way of Kings (The Stormlight Archive, #1)" is "The Way of Kings". */
export const shortTitle = (title: string) => title.replace(/\s*\([^)]*#\s*[\d.]+\)\s*$/, "");
