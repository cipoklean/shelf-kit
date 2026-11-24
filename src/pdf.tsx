import { Column, Document, PageBreak, PageFooter, PageNumber, Row, Text, token } from "@hyper-elements/react";
import { Bookshelf, ShelfHeader, ShelfKey, Stat, TitleKey } from "./elements";
import { webFonts } from "./fonts";
import { Fragment } from "react";
import { clip, fmt, shelves, shortTitle, stats } from "./shelf";
import { shelfTheme } from "./theme";
import type { ReadingYear } from "./types";

const WIDTH = 1056 - 2 * 56; // Tabloid portrait (11in at 96px) inside its margins

/**
 * A tabloid poster of the year: the shelf big enough to pin up, every spine numbered, the key to the
 * numbers in two columns under it. More books add shelves and shorten the spines so it stays one page.
 */
export function ShelfPoster({ year, theme = shelfTheme }: { year: ReadingYear; theme?: typeof shelfTheme }) {
  const s = stats(year.books);
  // Spines at least 28 wide; a short year widens them (to 40) so the shelf spans the page.
  const gap = 6;
  const perShelf = Math.floor((WIDTH + gap) / (28 + gap));
  const spine = Math.min(40, Math.floor((WIDTH + gap) / Math.min(year.books.length, perShelf)) - gap);
  const shelfCount = Math.ceil(year.books.length / perShelf);
  const maxHeight = Math.min(640, Math.floor((860 - (shelfCount - 1) * 60) / shelfCount));
  const books = year.books.map((b, i) => ({ n: i + 1, title: b.title, author: b.author, pages: b.pages, genre: b.genre, fiveStar: b.rating === 5 }));
  // Up to 24 books the key fits under the shelf; a bigger year moves it to a second page, in three columns past 60.
  const keyPage = books.length > 24;
  // A key page holds at most 66 books (three columns of 22), so a very big year runs onto more pages.
  const keyCols = books.length === 1 ? 1 : books.length > 60 ? 3 : 2;
  const keyPages = shelves(books, keyPage ? 66 : books.length);
  return (
    <Document theme={theme} size="Tabloid" margin={56} lang="en" fonts={webFonts} title={`${year.reader}'s ${year.year} shelf`} style={{ gap: 36 }}>
      <PageFooter>
        <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ apply: ["caption"] }}>Made with shelf-kit from a Goodreads export. Spine height is page count; colour is genre.</Text>
          {keyPage ? (
            <Text style={{ apply: ["caption"], flex: "none", textAlign: "right" }}>
              Page <PageNumber /> of <PageNumber total />
            </Text>
          ) : null}
        </Row>
      </PageFooter>

      <Column style={{ gap: 28 }}>
        <ShelfHeader kicker={`${year.reader}'s year in books`} title={`${year.year} on ${shelfCount === 1 ? "one shelf" : `${shelfCount} shelves`}`} />
        <Row style={{ gap: 56, justifyContent: "start" }}>
          <Stat value={String(s.count)} label={s.count === 1 ? "book" : "books"} />
          <Stat value={fmt(s.pages)} label="pages" />
          <Stat value={String(s.fiveStars.length)} label="five stars" />
          <Stat value={fmt(s.longest.pages)} label={`pages in ${clip(shortTitle(s.longest.title), 32)}`} />
        </Row>
      </Column>

      <Column style={{ gap: 14 }}>
        <Bookshelf books={books.map(({ pages, genre, fiveStar }) => ({ pages, genre, fiveStar }))} spine={spine} gap={gap} minHeight={Math.round(maxHeight * 0.32)} maxHeight={maxHeight} perShelf={perShelf} plank={8} band={12} numbers numberSize={14} />
        <ShelfKey genres={s.genres.map(([genre, count]) => ({ genre, count }))} columns={4} fiveStars={s.fiveStars.length > 0} />
      </Column>

      {keyPages.map((page, p) => {
        const perCol = Math.ceil(page.length / keyCols);
        return (
          <Fragment key={p}>
            {keyPage ? <PageBreak /> : null}
            {keyPage ? <ShelfHeader kicker={`${year.reader}'s year in books`} title={p === 0 ? "The key to the spines" : "The key, continued"} /> : null}
            <Row style={{ gap: 36, alignItems: "start", border: { top: { width: 1, style: "solid", color: token("colors.rule") } }, padding: [16, 0, 0, 0] }}>
              {shelves(page, perCol).map((col, c) => (
                <Column key={c}><TitleKey books={col} /></Column>
              ))}
            </Row>
          </Fragment>
        );
      })}
    </Document>
  );
}
