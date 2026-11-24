/** The genres a spine can be coloured by. Anything else on the export lands on "other". */
export const GENRES = ["fiction", "scifi", "fantasy", "mystery", "nonfiction", "memoir", "other"] as const;
export type Genre = (typeof GENRES)[number];

export interface Book {
  title: string;
  author: string;
  pages: number;
  /** 0 when the reader didn't rate it; otherwise 1 to 5. */
  rating: number;
  genre: Genre;
  /** YYYY-MM-DD. */
  dateRead: string;
}

export interface ReadingYear {
  reader: string;
  year: number;
  books: Book[];
  /** Where the email's button sends the reader: their shelf page, or the card to share. */
  shareUrl: string;
}
