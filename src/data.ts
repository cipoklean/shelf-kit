import { readFile } from "node:fs/promises";
import { readGoodreads } from "./csv";
import type { ReadingYear } from "./types";

/**
 * The sample: a Goodreads export in data/, read for 2026, for a reader called Ada. Set CSV, YEAR,
 * READER and SHARE_URL to draw your own.
 */
export async function loadYear(
  csvPath = process.env.CSV ?? "data/goodreads_library_export.csv",
  yearText = process.env.YEAR ?? "2026",
  reader = process.env.READER?.trim() || "Ada",
): Promise<ReadingYear> {
  const year = Number(yearText);
  if (!/^\d{4}$/.test(yearText) || !Number.isInteger(year)) throw new Error(`YEAR should be a four-digit year, like 2026 (got "${yearText}").`);
  const { books, skippedNoPages } = readGoodreads(await readFile(csvPath, "utf8"), year);
  if (skippedNoPages.length) console.warn(`left off the shelf (no page count on Goodreads): ${skippedNoPages.join(", ")}`);
  if (!books.length) throw new Error(`No books on the "read" shelf with a Date Read in ${year}.`);
  const shareUrl = process.env.SHARE_URL ?? `https://shelf.example/${year}/${encodeURIComponent(reader.toLowerCase())}`;
  return { reader, year, books, shareUrl };
}

/** loadYear for the render scripts: a bad file or YEAR prints one plain line and exits, instead of a stack trace. */
export async function loadYearOrExit(): Promise<ReadingYear> {
  try {
    return await loadYear();
  } catch (e) {
    console.error(e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}
