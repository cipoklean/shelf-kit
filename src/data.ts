import { readFile } from "node:fs/promises";
import { readGoodreads } from "./csv";
import type { ReadingYear } from "./types";

/** The sample: a Goodreads export in data/, read for 2026. Point CSV at your own export to draw yours. */
export async function loadYear(csvPath = process.env.CSV ?? "data/goodreads_library_export.csv", year = Number(process.env.YEAR ?? 2026)): Promise<ReadingYear> {
  const { books, skippedNoPages } = readGoodreads(await readFile(csvPath, "utf8"), year);
  if (skippedNoPages.length) console.warn(`left off the shelf (no page count on Goodreads): ${skippedNoPages.join(", ")}`);
  if (!books.length) throw new Error(`No books on the "read" shelf with a Date Read in ${year}.`);
  return { reader: "Ada", year, books, shareUrl: `https://shelf.example/${year}/ada` };
}
