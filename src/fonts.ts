import type { EmailProps } from "@hyper-elements/react";

const CDN = "https://cdn.jsdelivr.net/fontsource/fonts";

/** Web fonts for the email and the print HTML. Clients that can't load them fall back to Georgia and Arial. */
export const webFonts: NonNullable<EmailProps["fonts"]> = [
  ...([500, 600] as const).map((weight) => ({ family: "Zilla Slab", src: `${CDN}/zilla-slab@latest/latin-${weight}-normal.woff2`, format: "woff2" as const, weight })),
  ...([400, 500, 600] as const).map((weight) => ({ family: "Rethink Sans", src: `${CDN}/rethink-sans@latest/latin-${weight}-normal.woff2`, format: "woff2" as const, weight })),
];
