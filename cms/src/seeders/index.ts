import { Core } from "@strapi/strapi";

import { seedAuthors } from "./authors.seeder";
import { seedBooks } from "./books.seeder";
import { seedDefaultAdmin } from "./user.seeder";

export async function seedEnvironment(strapi: Core.Strapi): Promise<void> {
  await seedDefaultAdmin(strapi);
  await seedAuthors(strapi);
  await seedBooks(strapi);
}
