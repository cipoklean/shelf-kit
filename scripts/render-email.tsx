// Writes the email as HTML and plain text, checked against 11 email clients.
// --preview also draws it in classic Outlook, the Gmail app and Apple Mail (light and dark).
import { mkdir, writeFile } from "node:fs/promises";
import { ElementsError, formatDiagnostics, render } from "@hyper-elements/react";
import { emailClients, renderInEmailClients } from "@hyper-elements/email-clients";
import { ShelfEmail } from "../src/email";
import { loadYearOrExit } from "../src/data";

// What the sending service fills in, for the previews only. The HTML in out/ keeps {{first_name}}.
const sample: Record<string, string> = { first_name: "Ada" };

const design = <ShelfEmail year={await loadYearOrExit()} />;
await mkdir("out/email", { recursive: true });
try {
  const { html, text, diagnostics } = await render(design, { plugins: [await emailClients()] });
  if (diagnostics.length) console.log(formatDiagnostics(diagnostics));
  await writeFile("out/email/shelf.email.html", html);
  await writeFile("out/email/shelf.email.txt", text);
  console.log("wrote out/email/shelf.email.html and .txt");
  if (process.argv.includes("--preview")) {
    const { previews, skipped } = await renderInEmailClients(design, {
      emailClients: ["outlook", "gmail-app", "apple-mail"],
      computers: ["windows"],
      dark: true,
      fonts: "inline",
      mergeTag: (name) => sample[name] ?? `{{${name}}}`,
    });
    await mkdir("out/email/previews", { recursive: true });
    for (const p of previews) await writeFile(`out/email/previews/${p.filename}`, p.html);
    console.log("previews:", previews.map((p) => p.filename).join(", "));
    if (skipped.length) console.log("skipped:", JSON.stringify(skipped));
  }
} catch (e) {
  if (!(e instanceof ElementsError)) throw e;
  console.error(formatDiagnostics(e.diagnostics));
  process.exitCode = 1;
}
