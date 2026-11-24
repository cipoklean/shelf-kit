import { GENRES, type Book, type Genre } from "./types";

/** RFC 4180 CSV: quoted fields, doubled quotes inside them, and newlines inside quotes (Goodreads reviews have them). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const src = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((f) => f !== "")) rows.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.some((f) => f !== "")) rows.push(row);
  return rows;
}

/** Goodreads shelf names (and StoryGraph-style genre words) to the spine colours. First match wins. */
// Shelf names are split on commas and checked one at a time, so "mythology, nonfiction" is judged by
// each name rather than by the whole string. Spaces, hyphens and underscores count as the same.
const SHELF_TO_GENRE: [RegExp, Genre][] = [
  [/\btrue[ -]?crime\b/, "nonfiction"],
  [/\bmemoirs?\b|biograph|autobiograph/, "memoir"],
  [/\bnon[ -]?fiction\b|\bhistory\b|\bpopular[ -]science\b|\bscience\b(?![ -]?fiction)|business|self[ -]?help|programming|psycholog|philosoph|politic|economic|\bnature\b|\btravel\b|technolog|\bhealth\b|\bdesign\b|\bart\b|journalism|essays?\b|\bwriting\b/, "nonfiction"],
  [/\bsci[ -]?fi\b|science[ -]?fiction|space[ -]?opera|dystopi|cyberpunk|\bsf\b/, "scifi"],
  [/fantasy|mytholog|\bmyths?\b|magic|fairy[ -]?tale/, "fantasy"],
  [/myster|thriller|\bcrime\b|suspense|horror|detective|noir/, "mystery"],
  [/\bfiction\b|novels?\b|literary|classics?\b|romance|young[ -]?adult|\bya\b|contemporary|poetry|manga|graphic[ -]?novel|short[ -]?stor/, "fiction"],
];

export function genreFrom(shelves: string): Genre {
  const names = shelves.split(",").map((s) => s.trim().toLowerCase().replaceAll("_", "-")).filter(Boolean);
  // A specific genre beats a broad one: rules are in priority order, and each is tried against every name.
  for (const [re, g] of SHELF_TO_GENRE) if (names.some((n) => re.test(n))) return g;
  return "other";
}

/**
 * Reads a Goodreads "Export Library" CSV into the books finished in `year`.
 * Keeps rows on the "read" shelf with a Date Read in that year; genre comes from the reader's own shelves.
 * Throws with the missing column's name if the file isn't a Goodreads export.
 */
export function readGoodreads(text: string, year: number): { books: Book[]; skippedNoPages: string[] } {
  const [header, ...rows] = parseCsv(text);
  if (!header) throw new Error("The CSV file is empty.");
  const col = (name: string) => {
    const i = header.indexOf(name);
    if (i < 0) throw new Error(`This doesn't look like a Goodreads export: there's no "${name}" column.`);
    return i;
  };
  const c = {
    title: col("Title"), author: col("Author"), pages: col("Number of Pages"), rating: col("My Rating"),
    dateRead: col("Date Read"), shelves: col("Bookshelves"), exclusive: col("Exclusive Shelf"),
  };
  const books: Book[] = [];
  const skippedNoPages: string[] = [];
  for (const r of rows) {
    const field = (i: number) => (r[i] ?? "").trim();
    if (field(c.exclusive) !== "read") continue;
    const date = field(c.dateRead).replaceAll("/", "-");
    if (!date.startsWith(`${year}-`)) continue;
    const pages = Number(field(c.pages));
    if (!Number.isInteger(pages) || pages < 1) { skippedNoPages.push(field(c.title) || "(untitled)"); continue; }
    books.push({
      title: field(c.title) || "(untitled)",
      author: field(c.author) || "Unknown author",
      pages,
      rating: Number(field(c.rating)) || 0,
      genre: genreFrom(field(c.shelves)),
      dateRead: date,
    });
  }
  books.sort((a, b) => a.dateRead.localeCompare(b.dateRead));
  return { books, skippedNoPages };
}

export { GENRES };
