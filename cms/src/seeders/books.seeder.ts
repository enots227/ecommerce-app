import { Core } from "@strapi/strapi";
import { faker } from "@faker-js/faker";
import { PromisePool } from "@supercharge/promise-pool";

const BOOK_COUNT = 50;
const CONCURRENCY = 5;

export async function seedBooks(strapi: Core.Strapi): Promise<void> {
  const books = strapi.documents("api::book.book");
  if ((await books.count({})) > 0) {
    strapi.log.info("Books have already been seeded");
    return;
  }

  const authorIds = (
    await strapi.documents("api::author.author").findMany()
  ).map((author) => author.documentId);
  if (authorIds.length === 0) {
    strapi.log.warn("No authors found; skipping book seeding");
    return;
  }

  const takenSlugs = new Set<string>();
  const payloads = Array.from({ length: BOOK_COUNT }, () => {
    const title = faker.book.title();
    return {
      title,
      slug: uniqueSlug(title, takenSlugs),
      authors: faker.helpers.arrayElements(authorIds, { min: 1, max: 3 }),
    };
  });

  await PromisePool.withConcurrency(CONCURRENCY)
    .for(payloads)
    // The pool collects errors by default; rethrow so a failed insert aborts seeding.
    .handleError((error) => {
      throw error;
    })
    .process((data) => books.create({ data, status: "published" }));
  strapi.log.info(`Seeded ${BOOK_COUNT} books`);
}

/**
 * Slugifies the title, suffixing a counter when the slug is already taken —
 * `faker.book.title()` repeats itself over a run of this size.
 */
function uniqueSlug(title: string, taken: Set<string>): string {
  const base = faker.helpers.slugify(title).toLowerCase();

  let slug = base;
  for (let suffix = 2; taken.has(slug); suffix++) {
    slug = `${base}-${suffix}`;
  }
  slug = slug.replace(/[^A-Za-z0-9_-]/g, "");
  taken.add(slug);
  return slug;
}
