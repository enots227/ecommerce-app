import { Core } from "@strapi/strapi";

import { seedApiToken } from "./api-token.seeder";
import { seedAuthors } from "./authors.seeder";
import { seedBookEditions } from "./book-editions.seeder";
import { seedBookSkus } from "./book-skus.seeder";
import { seedBooks } from "./books.seeder";
import { seedDefaultAdmin } from "./user.seeder";

export async function seedEnvironment(strapi: Core.Strapi): Promise<void> {
  await seedDefaultAdmin(strapi);
  await seedApiToken(strapi);
  await seedAuthors(strapi);
  await seedBooks(strapi);
  await seedBookEditions(strapi);
  await seedBookSkus(strapi);
}
