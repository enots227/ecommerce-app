import { Core } from "@strapi/strapi";
import { faker } from "@faker-js/faker";
import { PromisePool } from "@supercharge/promise-pool";

const AUTHOR_COUNT = 25;
const CONCURRENCY = 5;

export async function seedAuthors(strapi: Core.Strapi): Promise<void> {
  const authors = strapi.documents("api::author.author");
  if ((await authors.count({})) > 0) {
    strapi.log.info("Authors have already been seeded");
    return;
  }

  await PromisePool.withConcurrency(CONCURRENCY)
    .for(Array.from({ length: AUTHOR_COUNT }))
    // The pool collects errors by default; rethrow so a failed insert aborts seeding.
    .handleError((error) => {
      throw error;
    })
    .process(() =>
      authors.create({
        data: {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
        },
      }),
    );
  strapi.log.info(`Seeded ${AUTHOR_COUNT} authors`);
}
