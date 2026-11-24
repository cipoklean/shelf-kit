// Writes the share card as a 1080x1350 PNG and an SVG. layoutImage measures it first, strictly:
// a missing font or glyph, or anything running past the canvas, fails the build instead of clipping.
import { mkdir, writeFile } from "node:fs/promises";
import { ElementsError, formatDiagnostics } from "@hyper-elements/react";
import { layoutImage, renderImage } from "@hyper-elements/react/image";
import { ShelfCard } from "../src/card";
import { loadYearOrExit } from "../src/data";
import { loadFonts } from "./fonts";

const design = <ShelfCard year={await loadYearOrExit()} />;
await mkdir("out", { recursive: true });
try {
  const fonts = await loadFonts();
  const layout = await layoutImage(design, { fonts, strict: true });
  if (layout.diagnostics.length) console.log(formatDiagnostics(layout.diagnostics));
  for (const f of layout.fits) console.log(`fit ${f.path}: drawn at ${f.chosen}px`);
  const png = await renderImage(design, { fonts, strict: true });
  await writeFile("out/shelf-card.png", png.image);
  const svg = await renderImage(design, { fonts, strict: true, format: "svg" });
  await writeFile("out/shelf-card.svg", svg.image);
  console.log(`wrote out/shelf-card.png (${png.width}x${png.height}) and .svg`);
} catch (e) {
  if (!(e instanceof ElementsError)) throw e;
  console.error(formatDiagnostics(e.diagnostics));
  process.exitCode = 1;
}
