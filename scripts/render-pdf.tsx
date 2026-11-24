// Writes the tabloid poster as a PDF (and the print HTML it comes from). --outline prints its tree.
import { mkdir, writeFile } from "node:fs/promises";
import { ElementsError, formatDiagnostics, outline, render, validate } from "@hyper-elements/react";
import { renderPdf } from "@hyper-elements/react/pdf";
import { ShelfPoster } from "../src/pdf";
import { loadYear } from "../src/data";
import { loadFonts } from "./fonts";

const design = <ShelfPoster year={await loadYear()} />;
await mkdir("out", { recursive: true });
const report = validate(design);
if (report.diagnostics.length) console.log(formatDiagnostics(report.diagnostics));
if (process.argv.includes("--outline")) console.log(outline(design));
if (!report.valid) process.exit(1);
try {
  const { html } = await render(design);
  await writeFile("out/shelf.print.html", html);
  const { pdf, diagnostics } = await renderPdf(design, { fonts: await loadFonts() });
  if (diagnostics.length) console.log(formatDiagnostics(diagnostics));
  await writeFile("out/shelf-poster.pdf", pdf);
  console.log("wrote out/shelf-poster.pdf");
} catch (e) {
  if (!(e instanceof ElementsError)) throw e;
  console.error(formatDiagnostics(e.diagnostics));
  process.exitCode = 1;
}
