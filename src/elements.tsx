import { Column, defineElement, Heading, MergeTag, prop, Row, Table, TableCell, TableRow, Text, token } from "@hyper-elements/react";
import { GENRES } from "./types";
import { GENRE_LABEL, shelves, spineHeight } from "./shelf";

const genreColor = (g: (typeof GENRES)[number]) => token(`colors.${g}`);

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
            height: maxHeight,
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
              <Text style={{ fontFamily: token("fonts.label"), fontWeight: 600, fontSize: numbers ? numberSize : 1, lineHeight: 1, textAlign: "center", color: numbers ? token("colors.primaryForeground") : genreColor(b.genre) }}>
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
  },
  render: ({ genres, columns, swatch }) => {
    const keys = [...genres.map((g) => ({ color: genreColor(g.genre), label: `${GENRE_LABEL[g.genre]} ${g.count}` })), { color: token("colors.bookmark"), label: "Five stars" }];
    const rows = shelves(keys, columns);
    // A paper-coloured border above and below each swatch keeps the little spines from touching row to row.
    const gapLine = { width: 3, style: "solid", color: token("colors.background") } as const;
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
    label: prop.text({ label: "Label", required: true, maxLength: 40 }),
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
    title: prop.text({ label: "Title", required: true, maxLength: 60 }),
    line: prop.text({ label: "Line", maxLength: 160 }),
    nameMergeTag: prop.text({ label: "Name merge tag", maxLength: 40, pattern: "^[A-Za-z_][A-Za-z0-9_]*$" }),
  },
  render: ({ kicker, title, line, nameMergeTag }) => (
    <Column style={{ gap: 10 }}>
      <Heading level={2} style={{ color: token("colors.muted") }}>{kicker}</Heading>
      <Heading level={1}>{title}</Heading>
      {line || nameMergeTag ? (
        <Text style={{ apply: ["muted"] }}>
          {nameMergeTag ? <><MergeTag name={nameMergeTag} />, </> : null}
          {line}
        </Text>
      ) : null}
    </Column>
  ),
});
