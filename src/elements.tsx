import { Column, defineElement, Heading, MergeTag, prop, Row, Span, Table, TableCell, TableRow, Text, token } from "@hyper-elements/react";
import { GENRES } from "./types";
import { GENRE_LABEL, shelves, spineHeight } from "./shelf";

const genreColor = (g: (typeof GENRES)[number]) => token(`colors.${g}`);

// A paper-coloured border above and below a swatch cell keeps swatches in neighbouring rows from touching.
const gapLine = { width: 3, style: "solid", color: token("colors.background") } as const;

/**
 * The year as a bookshelf: one spine per book, in the order they were read, as tall as the book was
 * long and coloured by genre, with an amber band at the top of every five-star book. Each shelf is a
 * Row of fixed-width Columns bottom-aligned on a navy plank, a layout classic Outlook and the Gmail app
 * draw the same. With numbers, each spine carries its number at its foot for the PDF's key.
 */
export const Bookshelf = defineElement({
  type: "shelf.Bookshelf",
  label: "Bookshelf",
  description: "One spine per book: height from page count, colour from genre, an amber band for five stars, on as many shelves as it takes.",
  props: {
    books: prop.list(
      prop.object(
        {
          pages: prop.number({ label: "Pages", required: true, min: 1, integer: true }),
          genre: prop.choice(GENRES, { label: "Genre", required: true }),
          fiveStar: prop.boolean({ label: "Five stars", default: false }),
        },
        { label: "Book" },
      ),
      { label: "Books", required: true, min: 1 },
    ),
    spine: prop.number({ label: "Spine width", required: true, min: 4, integer: true }),
    gap: prop.number({ label: "Gap", default: 4, min: 0, integer: true }),
    minHeight: prop.number({ label: "Shortest spine", required: true, min: 8, integer: true }),
    maxHeight: prop.number({ label: "Tallest spine", required: true, min: 8, integer: true }),
    perShelf: prop.number({ label: "Books per shelf", required: true, min: 1, integer: true }),
    plank: prop.number({ label: "Plank", default: 6, min: 1, integer: true }),
    band: prop.number({ label: "Five-star band", default: 8, min: 2, integer: true }),
    numbers: prop.boolean({ label: "Number the spines", default: false }),
    numberSize: prop.number({ label: "Number size", default: 8, min: 4 }),
    phoneSpine: prop.number({ label: "Spine width on phones", min: 2, integer: true }),
    phoneGap: prop.number({ label: "Gap on phones", min: 0, integer: true }),
  },
  render: ({ books, spine, gap, minHeight, maxHeight, perShelf, plank, band, numbers, numberSize, phoneSpine, phoneGap }) => (
    <Column style={{ gap: Math.round(maxHeight * 0.18) }}>
      {shelves(books.map((b, i) => ({ ...b, n: i + 1 })), perShelf).map((shelf, s) => (
        <Row
          key={s}
          stackOnMobile={false}
          style={{
            alignItems: "end",
            justifyContent: "start",
            gap,
            border: { bottom: { width: plank, style: "solid", color: token("colors.plank") } },
            mobile: phoneGap === undefined ? undefined : { gap: phoneGap },
          }}
        >
          {shelf.map((b) => (
            <Column
              key={b.n}
              style={{
                flex: "none",
                width: spine,
                height: spineHeight(b.pages, minHeight, maxHeight),
                backgroundColor: genreColor(b.genre),
                border: b.fiveStar ? { top: { width: band, style: "solid", color: token("colors.bookmark") } } : undefined,
                ...(numbers ? { justifyContent: "end", alignItems: "center", padding: [0, 0, Math.round(numberSize * 0.6), 0] } : {}),
                mobile: phoneSpine === undefined ? undefined : { width: phoneSpine },
              }}
            >
              <Text style={{ apply: ["label"], fontSize: numbers ? numberSize : 1, lineHeight: 1, textAlign: "center", color: numbers ? token("colors.primaryForeground") : genreColor(b.genre) }}>
                {numbers ? String(b.n) : "\u00a0"}
              </Text>
            </Column>
          ))}
        </Row>
      ))}
    </Column>
  ),
});

/**
 * What the colours and the band mean: a little spine and a label for each genre on the shelf, with its
 * count, then the five-star band. A table, so it lines up in columns in every client, Outlook included.
 */
export const ShelfKey = defineElement({
  type: "shelf.ShelfKey",
  label: "Shelf key",
  description: "A small spine swatch and label for each genre on the shelf, with its count, and the amber five-star band, in columns.",
  props: {
    genres: prop.list(prop.object({ genre: prop.choice(GENRES, { label: "Genre", required: true }), count: prop.number({ label: "Books", required: true, integer: true }) }, { label: "Genre" }), { label: "Genres", required: true }),
    columns: prop.number({ label: "Columns", default: 3, min: 1, max: 4, integer: true }),
    swatch: prop.number({ label: "Swatch width", default: 6, min: 2, integer: true }),
    fiveStars: prop.boolean({ label: "Show the five-star band", default: true }),
  },
  render: ({ genres, columns, swatch, fiveStars }) => {
    const keys = [
      ...genres.map((g) => ({ color: genreColor(g.genre), label: `${GENRE_LABEL[g.genre]} ${g.count}` })),
      ...(fiveStars ? [{ color: token("colors.bookmark"), label: "Five stars" }] : []),
    ];
    const rows = shelves(keys, columns);
    // A paper-coloured border above and below each swatch keeps the little spines from touching row to row.
    return (
      <Table style={{ width: "100%", borderCollapse: "separate" }}>
        {rows.map((row, r) => (
          <TableRow key={r}>
            {Array.from({ length: columns }, (_, c) => row[c]).flatMap((k, c) => [
              <TableCell key={`s${c}`} style={{ width: swatch, padding: 0, backgroundColor: k ? k.color : undefined, border: { top: gapLine, bottom: gapLine }, fontSize: 1, lineHeight: 1 }}>{"\u00a0"}</TableCell>,
              <TableCell key={`l${c}`} style={{ apply: ["caption"], padding: [3, 12, 3, 8], verticalAlign: "middle" }}>{k ? k.label : "\u00a0"}</TableCell>,
            ])}
          </TableRow>
        ))}
      </Table>
    );
  },
});

/** One number and what it counts: "20" over "books". */
export const Stat = defineElement({
  type: "shelf.Stat",
  label: "Stat",
  description: "A big slab number over a small label.",
  props: {
    value: prop.text({ label: "Value", required: true, maxLength: 12 }),
    label: prop.text({ label: "Label", required: true, maxLength: 100 }),
  },
  render: ({ value, label }) => (
    <Column style={{ gap: 4 }}>
      <Text style={{ apply: ["stat"] }}>{value}</Text>
      <Text style={{ apply: ["caption"] }}>{label}</Text>
    </Column>
  ),
});

/** The heading block: a small label, the slab title, and a line that can greet the reader by merge tag. */
export const ShelfHeader = defineElement({
  type: "shelf.ShelfHeader",
  label: "Shelf header",
  description: "A small kicker, the slab title, and an optional line that opens with the reader's name from a merge tag.",
  props: {
    kicker: prop.text({ label: "Kicker", required: true, maxLength: 60 }),
    title: prop.text({ label: "Title", required: true, maxLength: 80 }),
    line: prop.text({ label: "Line", maxLength: 160 }),
    nameMergeTag: prop.text({ label: "Name merge tag", maxLength: 40, pattern: "^[A-Za-z_][A-Za-z0-9_]*$" }),
    fitTitle: prop.boolean({ label: "Shrink the title to one line", default: false }),
  },
  render: ({ kicker, title, line, nameMergeTag, fitTitle }) => (
    <Column style={{ gap: 10 }}>
      <Heading level={2}>{kicker}</Heading>
      <Heading level={1} fit={fitTitle ? { sizes: [96, 88, 80, 72, 64, 56], maxLines: 1 } : undefined}>{title}</Heading>
      {line || nameMergeTag ? (
        <Text style={{ apply: ["muted"] }}>
          {nameMergeTag ? <><MergeTag name={nameMergeTag} />, </> : null}
          {line}
        </Text>
      ) : null}
    </Column>
  ),
});

/**
 * The poster's key to the numbered spines: number, a genre swatch, title and author, pages. An amber
 * swatch beside the number marks a five-star book, matching the band on its spine.
 */
export const TitleKey = defineElement({
  type: "shelf.TitleKey",
  label: "Title key",
  description: "The numbered list that goes with a numbered Bookshelf: number, genre swatch, title, author and pages, five stars marked in amber.",
  props: {
    books: prop.list(
      prop.object(
        {
          n: prop.number({ label: "Number", required: true, integer: true, min: 1 }),
          title: prop.text({ label: "Title", required: true, maxLength: 300 }),
          author: prop.text({ label: "Author", required: true, maxLength: 200 }),
          pages: prop.number({ label: "Pages", required: true, integer: true, min: 1 }),
          genre: prop.choice(GENRES, { label: "Genre", required: true }),
          fiveStar: prop.boolean({ label: "Five stars", default: false }),
        },
        { label: "Book" },
      ),
      { label: "Books", required: true, min: 1 },
    ),
  },
  render: ({ books }) => (
    <Table style={{ width: "100%", rowBorder: { width: 1, style: "solid", color: token("colors.hairline") } }}>
      {books.map((b) => (
        <TableRow key={b.n}>
          <TableCell style={{ width: 28, padding: [7, 0], fontWeight: 600, verticalAlign: "top" }}>{String(b.n)}</TableCell>
          <TableCell style={{ width: 4, padding: 0, backgroundColor: b.fiveStar ? token("colors.bookmark") : undefined, border: { top: gapLine, bottom: gapLine }, fontSize: 1, lineHeight: 1 }}>{"\u00a0"}</TableCell>
          <TableCell style={{ width: 4, padding: 0, backgroundColor: genreColor(b.genre), border: { top: gapLine, bottom: gapLine }, fontSize: 1, lineHeight: 1 }}>{"\u00a0"}</TableCell>
          <TableCell style={{ padding: [7, 8, 7, 12], verticalAlign: "top" }}>
            {b.title}
            <Span style={{ apply: ["muted"] }}>{` · ${b.author}`}</Span>
          </TableCell>
          <TableCell style={{ apply: ["muted"], width: 44, padding: [7, 0], textAlign: "right", verticalAlign: "top" }}>{String(b.pages)}</TableCell>
        </TableRow>
      ))}
    </Table>
  ),
});
