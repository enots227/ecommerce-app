import { Core } from "@strapi/strapi";

import { seedApiToken } from "./api-token.seeder";
import { seedAuthors } from "./authors.seeder";
import { seedBookCategories } from "./book-categories.seeder";
import { seedBookEditions } from "./book-editions.seeder";
import { seedBookSkus } from "./book-skus.seeder";
import { seedBooks } from "./books.seeder";
import { seedCatalogs } from "./catalogs.seeder";
import { seedSkuDiscounts } from "./sku-discounts.seeder";
import { seedDefaultAdmin } from "./user.seeder";

export async function seedEnvironment(strapi: Core.Strapi): Promise<void> {
  await seedDefaultAdmin(strapi);
  await seedApiToken(strapi);
  await seedAuthors(strapi);
  await seedBooks(strapi);
  // Categories link to the genre catalogs, so those must exist first.
  await seedCatalogs(strapi);
  await seedBookCategories(strapi);
  await seedBookEditions(strapi);
  await seedBookSkus(strapi);
  await seedSkuDiscounts(strapi);
}
