import { Button, Column, Email, Heading, Row, Section, Span, Text, token } from "@hyper-elements/react";
import { Bookshelf, ShelfHeader, ShelfKey, Stat } from "./elements";
import { webFonts } from "./fonts";
import { fmt, stats } from "./shelf";
import { shelfTheme } from "./theme";
import type { ReadingYear } from "./types";

/** "Your shelf grew": the year as a bookshelf, three numbers, the five-star books, and one button. */
export function ShelfEmail({ year, theme = shelfTheme }: { year: ReadingYear; theme?: typeof shelfTheme }) {
  const s = stats(year.books);
  return (
    <Email
      theme={theme}
      width={600}
      lang="en"
      fonts={webFonts}
      title={`Your ${year.year} shelf`}
      previewText={`${s.count} books and ${fmt(s.pages)} pages. Here's your ${year.year} as a bookshelf.`}
      style={{ gap: 0 }}
    >
      <Section style={{ padding: [36, 24, 28, 24] }}>
        <ShelfHeader
          kicker={`Your year in books · ${year.year}`}
          title={`Your shelf grew by ${s.count} books`}
          nameMergeTag="first_name"
          line={"here's your year as a bookshelf: one spine per book, as tall as the book was long, in the order you read\u00a0them."}
        />
      </Section>
      <Section style={{ padding: [0, 24, 28, 24], gap: 16 }}>
        <Bookshelf books={year.books.map((b) => ({ pages: b.pages, genre: b.genre, fiveStar: b.rating === 5 }))} spine={22} gap={4} phoneSpine={12} phoneGap={3} minHeight={56} maxHeight={150} perShelf={21} />
        <ShelfKey genres={s.genres.map(([genre, count]) => ({ genre, count }))} />
      </Section>
      <Section tokens={{ colors: { background: token("colors.surface") } }} style={{ padding: [24, 24] }}>
        <Row style={{ gap: 16 }}>
          <Stat value={String(s.count)} label="books finished" />
          <Stat value={fmt(s.pages)} label="pages turned" />
          <Stat value={String(s.longest.pages)} label={`pages in your longest, ${s.longest.title}`} />
        </Row>
      </Section>
      <Section style={{ padding: [28, 24, 36, 24], gap: 14 }}>
        <Heading level={2}>{`Five stars · ${s.fiveStars.length} books`}</Heading>
        <Column style={{ gap: 6 }}>
          {s.fiveStars.map((b) => (
            <Text key={b.title}>
              {b.title}
              <Span style={{ color: token("colors.muted") }}>{` · ${b.author}`}</Span>
            </Text>
          ))}
        </Column>
        <Button href={year.shareUrl}>Share your shelf</Button>
        <Text style={{ apply: ["caption"] }}>Made from your Goodreads export. Spine height is page count; colour is genre, from your shelves.</Text>
      </Section>
    </Email>
  );
}
