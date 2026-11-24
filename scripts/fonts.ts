import { readFile } from "node:fs/promises";

const f = (p: string) => readFile(new URL(`../fonts/${p}`, import.meta.url));

/** Font files for renderPdf and renderImage, which load nothing themselves. */
export async function loadFonts() {
  const out: { family: string; src: Buffer; weight: number }[] = [];
  for (const w of [600]) out.push({ family: "Zilla Slab", src: await f(`ZillaSlab-${w}.ttf`), weight: w });
  for (const w of [400, 600]) out.push({ family: "Rethink Sans", src: await f(`RethinkSans-${w}.ttf`), weight: w });
  return out;
}
