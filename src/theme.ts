import { defineTheme } from "@hyper-elements/react";

// "Navy on white": a white ground so the
// genre colours on the spines read true, navy ink for type and the shelf plank, and one amber accent,
// the bookmark band on a five-star spine. Zilla Slab, a slab with a library's warmth, sets headings;
// Rethink Sans sets everything else. Contrast on white: ink 13.9:1, muted 5.9:1. Amber is never text.
// Every genre colour holds white spine numbers at 4.5:1 or better (other, the lightest, 4.8:1).
export const shelfTheme = defineTheme({
  colors: {
    background: "#ffffff",
    foreground: "#1f2b4d",
    primary: "#1f2b4d",
    primaryForeground: "#ffffff",
    primaryHover: "#2d3d6b",
    surface: "#f4f4f2",
    muted: "#5b6478",
    rule: "#1f2b4d",
    hairline: "#e2e4e8",
    plank: "#1f2b4d",
    bookmark: "#f7941d",
    fiction: "#2f5d8a",
    scifi: "#3f7f7a",
    fantasy: "#6a4c7d",
    mystery: "#9b3d3d",
    nonfiction: "#667448",
    memoir: "#966235",
    other: "#6b727e",
  },
  fonts: {
    body: "'Rethink Sans', Helvetica, Arial, sans-serif",
    heading: "'Zilla Slab', Rockwell, Georgia, serif",
    label: "'Rethink Sans', Helvetica, Arial, sans-serif",
  },
  fontSizes: { body: 11, label: 8.5, caption: 8.5, stat: 26 },
  lineHeights: { body: 1.45 },
  radii: { button: 4 },
  elements: {
    Heading: {
      fontWeight: 600,
      by: {
        level: {
          1: { fontSize: 34, lineHeight: 1.05 },
          2: { fontFamily: "{fonts.label}", fontSize: "{fontSizes.label}", color: "{colors.muted}", lineHeight: 1.2, textTransform: "uppercase", letterSpacing: 1 },
        },
      },
    },
    Button: {
      fontFamily: "{fonts.label}",
      fontWeight: 600,
      borderRadius: "{radii.button}",
      padding: [14, 24],
      hover: { backgroundColor: "{colors.primaryHover}" },
    },
  },
  styles: {
    label: { fontFamily: "{fonts.label}", fontSize: "{fontSizes.label}", fontWeight: 600, color: "{colors.muted}" },
    caption: { fontSize: "{fontSizes.caption}", color: "{colors.muted}" },
    muted: { color: "{colors.muted}" },
    stat: { fontFamily: "{fonts.heading}", fontSize: "{fontSizes.stat}", fontWeight: 600, lineHeight: 1 },
  },
  formats: {
    // The tabloid poster: read from a step back on a wall or a desk.
    document: {
      fontSizes: { body: 16, label: 13, caption: 13, stat: 52 },
      lineHeights: { body: 1.35 },
      elements: { Heading: { by: { level: { 1: { fontSize: 76, lineHeight: 1 } } } } },
    },
    email: {
      fontSizes: { body: 16, label: 12, caption: 13, stat: 32 },
      lineHeights: { body: 1.5 },
      elements: { Heading: { by: { level: { 1: { fontSize: 36, mobile: { fontSize: 30 } } } } } },
    },
    canvas: {
      fontSizes: { body: 30, label: 24, caption: 24, stat: 72 },
      lineHeights: { body: 1.3 },
      elements: { Heading: { by: { level: { 1: { fontSize: 88 } } } } },
    },
  },
});

declare module "@hyper-elements/react" {
  interface Register {
    theme: typeof shelfTheme;
  }
}
