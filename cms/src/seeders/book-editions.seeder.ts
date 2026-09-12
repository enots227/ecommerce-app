import { Core } from "@strapi/strapi";
import { faker } from "@faker-js/faker";
import { PromisePool } from "@supercharge/promise-pool";

// Names are taken in order, so a book's second release is the "Second Edition".
const EDITION_NAMES = [
  "First Edition",
  "Second Edition",
  "Third Edition",
  "Revised Edition",
];
const MAX_EDITION_AGE_YEARS = 30;
const CONCURRENCY = 5;

export async function seedBookEditions(strapi: Core.Strapi): Promise<void> {
  const editions = strapi.documents("api::book-edition.book-edition");
  if ((await editions.count({})) > 0) return;

  const bookIds = (await strapi.documents("api::book.book").findMany()).map(
    (book) => book.documentId,
  );
  if (bookIds.length === 0) {
    strapi.log.warn("No books found; skipping book edition seeding");
    return;
  }

  const payloads = bookIds.flatMap((bookId) => {
    const count = faker.number.int({ min: 1, max: EDITION_NAMES.length });
    // Sort so the release dates run in the same order as the edition names.
    const releaseDates = Array.from({ length: count }, () =>
      faker.date.past({ years: MAX_EDITION_AGE_YEARS }),
    ).sort((a, b) => a.getTime() - b.getTime());

    return releaseDates.map((releasedAt, index) => ({
      book: bookId,
      name: EDITION_NAMES[index],
      releasedAt: releasedAt.toISOString().slice(0, 10),
    }));
  });

  await PromisePool.withConcurrency(CONCURRENCY)
    .for(payloads)
    // The pool collects errors by default; rethrow so a failed insert aborts seeding.
    .handleError((error) => {
      throw error;
    })
    .process((data) => editions.create({ data, status: "published" }));
  strapi.log.info(`Seeded ${payloads.length} book editions`);
}
