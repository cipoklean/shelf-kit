import { Canvas, Column, Row } from "@hyper-elements/react";
import { Bookshelf, ShelfHeader, ShelfKey, Stat } from "./elements";
import { fmt, stats } from "./shelf";
import { shelfTheme } from "./theme";
import type { ReadingYear } from "./types";

const WIDTH = 1080 - 2 * 72;

/** The portrait card for a story or a group chat: the shelf is the picture, three numbers say what it holds. */
export function ShelfCard({ year, theme = shelfTheme }: { year: ReadingYear; theme?: typeof shelfTheme }) {
  const s = stats(year.books);
  const gap = 8;
  const perShelf = Math.floor((WIDTH + gap) / (24 + gap));
  const spine = Math.min(56, Math.floor((WIDTH + gap) / Math.min(year.books.length, perShelf)) - gap);
  const shelfCount = Math.ceil(year.books.length / perShelf);
  const maxHeight = Math.min(560, Math.floor((640 - (shelfCount - 1) * 60) / shelfCount));
  return (
    <Canvas theme={theme} lang="en" width={1080} height={1350} title={`${year.reader}'s ${year.year} shelf`} style={{ padding: 72, gap: 40, justifyContent: "space-between" }}>
      <ShelfHeader kicker="A year in books" title={`${year.reader}'s ${year.year} shelf`} fitTitle />
      <Column style={{ gap: 24 }}>
        <Bookshelf books={year.books.map((b) => ({ pages: b.pages, genre: b.genre, fiveStar: b.rating === 5 }))} spine={spine} gap={gap} minHeight={Math.round(maxHeight * 0.32)} maxHeight={maxHeight} perShelf={perShelf} plank={12} band={16} />
        <ShelfKey genres={s.genres.map(([genre, count]) => ({ genre, count }))} columns={4} swatch={10} fiveStars={s.fiveStars.length > 0} />
      </Column>
      <Row style={{ gap: 32 }}>
        <Stat value={String(s.count)} label={s.count === 1 ? "book" : "books"} />
        <Stat value={fmt(s.pages)} label="pages" />
        <Stat value={String(s.fiveStars.length)} label="five stars" />
      </Row>
    </Canvas>
  );
}
