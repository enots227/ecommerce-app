import { Core } from "@strapi/strapi";
import { faker } from "@faker-js/faker";
import { PromisePool } from "@supercharge/promise-pool";
import { genreSlug } from "./catalogs.seeder";

const CONCURRENCY = 5;

/**
 * Seeds one category per genre `faker.book.genre()` can produce — the same
 * genres the catalog filters slugify — links each to the genre's catalog, and
 * files each seeded book under a few. Run after the catalogs are seeded.
 */
export async function seedBookCategories(strapi: Core.Strapi): Promise<void> {
  const categories = strapi.documents("api::book-category.book-category");
  if ((await categories.count({})) > 0) {
    strapi.log.info("BookCategories have already been seeded");
    return;
  }

  const bookIds = (await strapi.documents("api::book.book").findMany()).map(
    (book) => book.documentId,
  );
  if (bookIds.length === 0) {
    strapi.log.warn("No books found; seeding book categories without books");
  }

  // Every category must have its catalog; a missing one means the seeders drifted.
  const genres = faker.definitions.book.genre;
  const catalogIdBySlug = new Map(
    (
      await strapi.documents("api::catalog.catalog").findMany({
        filters: { type: "BOOK", slug: { $in: genres.map(genreSlug) } },
        fields: ["slug"],
      })
    ).map((catalog) => [catalog.slug, catalog.documentId]),
  );
  const catalogIdOf = (genre: string) => {
    const catalogId = catalogIdBySlug.get(genreSlug(genre));
    if (!catalogId) {
      throw new Error(`No catalog for book category "${genre}"`);
    }
    return catalogId;
  };

  // Pick each book's categories, then invert: the category side owns the relation.
  const bookIdsByGenre = new Map<string, string[]>(
    genres.map((genre) => [genre, []]),
  );
  for (const bookId of bookIds) {
    for (const genre of faker.helpers.arrayElements(genres, {
      min: 1,
      max: 3,
    })) {
      bookIdsByGenre.get(genre)!.push(bookId);
    }
  }

  const payloads = [...bookIdsByGenre].map(([title, books]) => ({
    title,
    description: faker.lorem.sentence(),
    books,
    catalog: catalogIdOf(title),
  }));

  await PromisePool.withConcurrency(CONCURRENCY)
    .for(payloads)
    // The pool collects errors by default; rethrow so a failed insert aborts seeding.
    .handleError((error) => {
      throw error;
    })
    .process((data) => categories.create({ data, status: "published" }));
  strapi.log.info(
    `Seeded ${payloads.length} book categories across ${bookIds.length} books`,
  );
}
