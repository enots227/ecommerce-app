import { Core } from "@strapi/strapi";
import { faker } from "@faker-js/faker";
import { PromisePool } from "@supercharge/promise-pool";

const BOOK_COUNT = 50;
const CONCURRENCY = 5;

export async function seedBooks(strapi: Core.Strapi): Promise<void> {
  const books = strapi.documents("api::book.book");
  if ((await books.count({})) > 0) return;

  const authorIds = (await strapi.documents("api::author.author").findMany()).map(
    (author) => author.documentId,
  );
  if (authorIds.length === 0) {
    strapi.log.warn("No authors found; skipping book seeding");
    return;
  }

  await PromisePool.withConcurrency(CONCURRENCY)
    .for(Array.from({ length: BOOK_COUNT }))
    // The pool collects errors by default; rethrow so a failed insert aborts seeding.
    .handleError((error) => {
      throw error;
    })
    .process(() =>
      books.create({
        data: {
          title: faker.book.title(),
          authors: faker.helpers.arrayElements(authorIds, { min: 1, max: 3 }),
        },
        status: "published",
      }),
    );
  strapi.log.info(`Seeded ${BOOK_COUNT} books`);
}
