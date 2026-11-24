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
const SHELF_TO_GENRE: [RegExp, Genre][] = [
  [/sci-?fi|science-?fiction|space|dystopi/i, "scifi"],
  [/fantasy|myth|magic/i, "fantasy"],
  [/mystery|thriller|crime|suspense|horror/i, "mystery"],
  [/memoir|biograph|autobiograph/i, "memoir"],
  [/non-?fiction|history|science|business|self-?help|programming|psycholog|essays/i, "nonfiction"],
  [/fiction|novel|literary|classics|romance/i, "fiction"],
];

export function genreFrom(shelves: string): Genre {
  for (const [re, g] of SHELF_TO_GENRE) if (re.test(shelves)) return g;
  return "other";
}

/**
 * Reads a Goodreads "Export Library" CSV into the books finished in `year`.
 * Keeps rows on the "read" shelf with a Date Read in that year; genre comes from the reader's own shelves.
 * Throws with the missing column's name if the file isn't a Goodreads export.
 */
export function readGoodreads(text: string, year: number): { books: Book[]; skippedNoPages: string[] } {
  const [header, ...rows] = parseCsv(text);
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
    if (r[c.exclusive] !== "read") continue;
    const date = r[c.dateRead].replaceAll("/", "-");
    if (!date.startsWith(`${year}-`)) continue;
    const pages = Number(r[c.pages]);
    if (!pages) { skippedNoPages.push(r[c.title]); continue; }
    books.push({
      title: r[c.title].trim(),
      author: r[c.author].trim(),
      pages,
      rating: Number(r[c.rating]) || 0,
      genre: genreFrom(r[c.shelves]),
      dateRead: date,
    });
  }
  books.sort((a, b) => a.dateRead.localeCompare(b.dateRead));
  return { books, skippedNoPages };
}

export { GENRES };
